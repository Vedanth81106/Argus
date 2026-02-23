from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("gemini-api-key"))

def get_ai_review(context: str) -> str:

    prompt = f"""
    You are an elite Senior Software Engineer and Security Researcher.
    Review the following code changes from a Git commit.
    
    Look for:
    1. Logic errors or potential bugs.
    2. Security vulnerabilities (SQL injection, XSS, etc.).
    3. Performance bottlenecks.
    
    Provide your feedback in a concise, bulleted format along with a short summary.
    If a file looks good, simply say "No issues found."
    
    CODE TO REVIEW:
    {context}
    """

    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt
        )
        return response.text

    except Exception as e:
        return f"AI Review failed: {str(e)}"