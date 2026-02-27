import requests
import os
from dotenv import load_dotenv
from tqdm import tqdm
import time
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

client = create_client(url, key)

def get_course_data():
    offset = 0
    limit = 100
    response = requests.get("https://planetterp.com/api/v1/courses", params={"limit": limit, "offset": offset, "reviews": "true"})

    while response.status_code == 200:
        response_json = response.json()

        if not response_json:
            break

        course_batch = [{"name": item["title"], "course_id": item["department"] + item["course_number"], "description": item["description"]} for item in response_json if item["reviews"]]
        client.table("courses").insert(course_batch).execute()

        tqdm.write(f"courses inserted: {offset + len(response_json)}")
        time.sleep(1)
        offset += limit
        response = requests.get("https://planetterp.com/api/v1/courses", params={"limit": limit, "offset": offset, "reviews": "true"})

    print("successfully uploaded course data")

def get_prof_data():
    # querying api for all professors 
    offset = 0
    response = requests.get("https://planetterp.com/api/v1/professors", params={"type": "professor", "offset": offset})

    while(response.status_code == 200): 
        response_json = response.json()

        if not response_json:
            break

        batch = [{"name": item["name"], "slug": item["slug"]} for item in response_json]
        client.table("professors").insert(batch).execute()

        # polite api rate call
        time.sleep(1)

        offset += 100
        tqdm.write(f"professors inserted: {offset}")
        response = requests.get("https://planetterp.com/api/v1/professors", params={"type": "professor", "offset": offset})

    print("successfully uploaded professor data")


def insert_review_data():
    courses = fetch_all("courses", "id, course_id")
    professors = fetch_all("professors", "id, name")

    professor_map = {p["name"]: p["id"] for p in professors}

    for course in tqdm(courses):
        response = requests.get("https://planetterp.com/api/v1/course", params={"name": course["course_id"], "reviews": "true"})
        response_json = response.json()

        review_batch = []
        for review in response_json["reviews"]:
            professor_id = professor_map.get(review["professor"])
            if professor_id is None:
                continue
            review_batch.append({
                "professor_id": professor_id,
                "course_id": course["id"],
                "review_text": review["review"],
                "rating": review["rating"],
                "created": review["created"]
            })

        if review_batch:
            client.table("reviews").insert(review_batch).execute()

        time.sleep(1)
    
    print("successfully entered review information")
    
def fetch_all(table, columns):
    results = []
    offset = 0
    while True:
        response = client.table(table).select(columns).range(offset, offset + 999).execute()
        if not response.data:
            break
        results.extend(response.data)
        offset += 1000
    return results


def test():
    response = requests.get("https://planetterp.com/api/v1/course", params={"name": "MATH140", "reviews": "true"})
    response_json = response.json()
    print(response_json["reviews"][0])

insert_review_data()