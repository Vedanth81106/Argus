import threading
from fastapi import FastAPI
from dotenv import load_dotenv
from reviewer import get_ai_review
from database import delete_repo_reviews
from consumer import start_worker

load_dotenv()

app = FastAPI(title = "Argus AI worker")

# auto run this function when the app starts
@app.on_event("startup")
async def startup_event():

    # we run start_worker method in a separate thread
    # because it is an infinite loop and will block normal execution
    thread = threading.Thread(target=start_worker, daemon = True) # daemon true = thread stops when server/app stops
    thread.start()

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.delete("/delete/{repo_id}")
def delete_reviews(repo_id: str):
    success: delete_repo_reviews(repo_id)


@app.delete("/delete/{repo_id}")
async def delete_repo_data(repo_id: str):
    try:
        index.delete(filter={"repo_id": repo_id})
        print(f"Vectors for {repo_id} deleted.")
        return {"status": "success"}
    except Exception as e:
        print(f"Error during delete: {e}")
        return {"status": "error", "message": str(e)}
