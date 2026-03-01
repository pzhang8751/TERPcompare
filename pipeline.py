from sentence_transformers import SentenceTransformer
from supabase import create_client
import ollama
import os 
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
client = create_client(url, key)

embedder = SentenceTransformer("all-MiniLM-L6-v2")

def embed_query(text):
    return embedder.encode(text, normalize_embeddings=True).tolist()

def retreive_chunks(query, max_chunks=8, threshold=0, professor="Larry Herman", course=None):
    query_vec = embed_query(query)

    params = {
        "query_embedding": query_vec,
        "match_count": max_chunks,
        "similarity_threshold": threshold,
    }

    if professor:
        params["filter_professor"] = professor
    if course:
        params["filter_course"] = course

    result = client.rpc("match_chunks", params).execute()

    for chunk in result.data:
        print(f"{chunk["chunk_text"]} : {chunk["similarity"]}")
    
    return result.data

retreive_chunks(query="Is this professor easy?")