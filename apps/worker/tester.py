import asyncio
import uuid  # Generates a random ID for our test
from vectorizer import get_code_embedding
from database import upsert_review, query_similar_reviews

async def run_integration_test():
    print("🚀 Step 1: Vectorizing a 'Buggy' Java snippet...")
    
    # A sample piece of code to test
    test_code = """
    public void processOrder(Order order) {
        if (order.items == null) {
            // Potential NullPointerException here
            System.out.println(order.items.size());
        }
    }
    """
    
    # 1. Get the vector from Cloudflare (BGE-M3)
    vector = await get_code_embedding(test_code)
    
    if not vector:
        print("❌ Failed at Step 1: Could not get embedding from Cloudflare.")
        return

    print(f"✅ Step 1 Success! Vector received (Length: {len(vector)})")

    # 2. Save it to Pinecone
    print("🚀 Step 2: Saving to Pinecone...")
    test_id = f"test-{uuid.uuid4().hex[:8]}" # Create a unique ID
    metadata = {
        "code_snippet": test_code[:100], # Save a bit of the code in metadata
        "issue": "Potential NullPointerException",
        "language": "Java"
    }
    
    saved = upsert_review(test_id, vector, metadata)
    
    if not saved:
        print("❌ Failed at Step 2: Pinecone refused the data.")
        return

    print(f"✅ Step 2 Success! Review {test_id} is now in the cloud.")

    # 3. Try to find it back
    print("🚀 Step 3: Querying Pinecone to see if it remembers...")
    matches = query_similar_reviews(vector, top_k=1)
    
    if matches:
        print(f"✅ Step 3 Success! Pinecone found a match with score: {matches[0].score}")
        print(f"   Match ID: {matches[0].id}")
    else:
        print("❌ Failed at Step 3: Pinecone couldn't find the vector we just saved.")

if __name__ == "__main__":
    asyncio.run(run_integration_test())