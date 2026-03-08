import os 
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

pc = Pinecone(api_key=os.getenv("pinecone_api_key"))

# connect to pinecone index
index = pc.Index("code-reviews")

def upsert_review(review_id: str, vector: list, metadata: dict):
    """
    saves a code review into pinecone.
    review_id: use something unique like a GitHub commit SHA or a timestamp,
    vector: The list of 1024 floats gotten from your vectorizer.
    metadata: A dictionary of info (e.g., {"code": "...", "summary": "..."})
    """

    try:

        # pinecone stores data in a list of tuples (id, vector, metadata)
        # upsert means "update if exists, insert if not"
        index.upsert(
            vectors=[
                (review_id, vector, metadata)
            ]
        )
        return True
    except Exception as e:
        print(f"Error upserting review: {e}")
        return False

def query_similar_reviews(vector: list, top_k: int = 5):
    """
    queries pinecone for similar code reviews.
    vector: The list of 1024 floats gotten from vectorizer.py.
    top_k: how many similar reviews to return.
    """

    try:
        results = index.query(
            vector=vector,
            top_k=top_k,
            include_metadata=True
        )
        return results.matches
    except Exception as e:
        print(f"Error querying similar reviews: {e}")
        return []

def delete_repo_reviews(repo_id: str):
    try:
        results = index.query(
            vector=[0] * 1024,
            filter={"repo_id": {"$eq": repo_id}},
            top_k=10000,
            include_metadata=False
        )

        ids_to_delete = [match["id"] for match in results["matches"]]

        if not ids_to_delete:
            print(f"No vectors found for repo: {repo_id}")
            return True

        index.delete(ids=ids_to_delete)
        print(f"Deleted {len(ids_to_delete)} vectors for repo: {repo_id}")
        return True
    except Exception as e:
        print(f"Pinecone deletion error: {e}")
        return False