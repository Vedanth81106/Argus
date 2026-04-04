import threading
from fastapi import FastAPI
from dotenv import load_dotenv
from reviewer import get_ai_review
from database import delete_repo_reviews
from consumer import start_worker
from contextlib import asynccontextmanager

load_dotenv()

app = FastAPI(title = "Argus AI worker")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Connecting to RabbitMQ and Pinecone...")
    yield
    print("Closing connections...")

app = FastAPI(lifespan=lifespan)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.delete("/delete/{repo_id}")
def delete_reviews(repo_id: str):
    success = delete_repo_reviews(repo_id)
    if success:
        return {"status": "success"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete vectors")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)