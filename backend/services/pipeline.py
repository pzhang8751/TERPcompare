from fastembed import TextEmbedding
from supabase import create_client
from groq import Groq
import os 
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
client = create_client(url, key)
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

embedder = TextEmbedding("sentence-transformers/all-MiniLM-L6-v2")

def embed_query(text):
    return list(embedder.embed([text]))[0].tolist()

def retreive_chunks(query, professor, course, max_chunks=8, threshold=0.3):
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

    # for chunk in result.data:
    #     print(f"{chunk["chunk_text"]} : {chunk["similarity"]}")
    
    return result.data

def rewrite_query(query):
    system_prompt = """
    You are a query rewriting assistant for a university course and professor review search engine.

    Your job is to take a vague or casual student question and rewrite it into a detailed search query
    that will match relevant student reviews, GPA data, and course feedback.

    Rules:
    - Expand vague words like "easy", "hard", "good", "bad" into specific terms students use in reviews
    - If the question is about a professor, focus on: grading style, workload, lecture quality, availability, exam difficulty, attendance policy, curves, clarity of teaching
    - If the question is about a course, focus on: workload, time commitment, prerequisites, exam structure, project load, grade distribution, difficulty
    - Return ONLY the rewritten query as a plain string, no explanation, no punctuation besides commas

    Examples:
    User: "is this professor easy?"
    Rewritten: "lenient grading, easy exams, light workload, generous curve, forgiving attendance policy"

    User: "is this class worth taking?"
    Rewritten: "interesting course material, manageable workload, good grade distribution, useful skills, high student satisfaction"

    User: "is the professor boring?"
    Rewritten: "dry lectures, low student engagement, monotone delivery, reads from slides, low energy teaching style"

    User: "how hard is this class?"
    Rewritten: "difficult exams, heavy workload, low average GPA, challenging assignments, strict grading, significant time commitment"
    """

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': query}
        ],
        max_tokens=100, # max tokens 
        temperature=0.2, # creativity - 0.2 = more consistent
    )

    return response.choices[0].message.content

def answer_query(query, retrieved_chunks):
    system_prompt = f"""
    You are a helpful assistant that answers student questions about UMD professors and courses.
    Answer based only on the review data provided. Be concise and direct.
    If the reviews provided are not relevant to the question or no reviews are provided, respond with "I don't have enough data to answer that question."

    Reviews:
    {retrieved_chunks if retrieved_chunks else "No reviews found."}
    """
    # messages = [
    #     {'role': 'system', 'content': system_prompt},
    #     {'role': 'user', 'content': query}
    # ]

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': query}
        ],
        max_tokens=250,
        temperature=0.7,
        stream=False,
    )

    return response.choices[0].message.content

"""
def pipeline(): 
    query = "Is this professor easy?"
    new_query = rewrite_query(query)
    context = retreive_chunks(new_query)
    answer_query(query, context)

pipeline()
"""