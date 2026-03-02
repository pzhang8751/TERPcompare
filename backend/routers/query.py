from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.pipeline import rewrite_query, retreive_chunks, answer_query

router = APIRouter()

# Pydantic model which defines the JSON body of the request 
class QueryRequest(BaseModel):
    question: str
    professor: str | None = None
    course: str | None = None

@router.post("/query")
async def handle_query(req: QueryRequest):
    new_query = rewrite_query(req.question)
    chunks = retreive_chunks(
        query=new_query,
        professor=req.professor,
        course=req.course
    )

    # Streaming response so chat is flushed out as tokens arrive
    return StreamingResponse(
        answer_query(req.question, chunks),
        media_type="text/event-stream"
    )