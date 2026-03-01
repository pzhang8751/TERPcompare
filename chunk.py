from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import os
from dotenv import load_dotenv
from tqdm import tqdm
import time
from supabase import create_client

# print(torch.cuda.is_available())

# note need to clean data one day and redo the data process 

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

client = create_client(url, key)

# can backtest which model is best for chunking / embeddding later after project launch 

splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " ", ""]
)
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_processed_review_ids():
    processed_ids = set()
    offset = 0

    while True:
        result = client.rpc("get_distinct_processed_ids").range(offset, offset + 999).execute().data
        
        if not result:
            break
            
        for row in result:
            processed_ids.add(row["review_id"])
        
        if len(result) < 1000:
            break
            
        offset += 1000
        print(f"Fetched {len(processed_ids)} processed ids so far...")

    return processed_ids

def get_all_reviews():
    processed_ids = get_processed_review_ids()
    all_reviews = []
    offset = 0

    while True:
        batch = client.table("reviews").select("id, review_text").range(offset, offset + 999).execute().data
        
        if not batch:
            break
            
        for review in batch:
            if review["id"] not in processed_ids:
                all_reviews.append(review)

        offset += 1000
        print(f"Fetched {len(all_reviews)} reviews so far...")

    return all_reviews

def clean_chunk(chunk):
    chunk = chunk.lstrip(". ")  # remove leading ". "
    if chunk and not chunk.endswith("."):
        chunk = chunk + "."     # ensure ends with period
    return chunk.strip()        # remove any leading/trailing whitespace

def split_chunks():
    reviews_data = get_all_reviews()

    for review in tqdm(reviews_data): 
        text = review["review_text"]
        review_id = review["id"]

        chunks = splitter.split_text(text)

        chunks = [clean_chunk(chunk) for chunk in chunks]
        embeddings = embed_chunks(chunks)

        insert_data(review_id, chunks, embeddings)

    print("finished splitting, embedding, and inserting review data")

def embed_chunks(chunks):

    embeddings = model.encode(chunks, batch_size=64)
    
    return embeddings

def insert_data(review_id, chunks, embeddings):
    batch = [{"review_id": review_id, "chunk_text": chunk, "embedding": vector.tolist()} for chunk, vector in zip(chunks, embeddings)]

    # skipping empty batches 
    if not batch:
        # print(f"Skipping empty batch for review_id: {review_id}")
        return
    
    client.table("chunks").insert(batch).execute()

    # time.sleep(1)

# print(len(get_processed_review_ids()))
split_chunks()