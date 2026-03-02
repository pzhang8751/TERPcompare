from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import query

app = FastAPI(title ="TERPCompare AI Backend")

# CORS so that Chrome extension can call api 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Mount routers
app.include_router(query.router, prefix="/api")

# Checking server health 
@app.get("/health")
def health():
    return {"status": "ok"}