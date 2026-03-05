from google import genai
import os
from pydantic import BaseModel
from dotenv import load_dotenv
import json

load_dotenv()

class ReviewResponse(BaseModel):
    summary: str
    logic_errors: str
    security_vulnerabilities: str
    performance_bottlenecks: str
    score: int

client = genai.Client(api_key=os.getenv("gemini-api-key"))

def get_ai_review(context: str) -> ReviewResponse:

    prompt = f"""
    You are an elite Senior Software Engineer and Security Researcher.
    Review the following code changes from a Git commit.
    
    Look for:
    1. Logic errors or potential bugs.
    2. Security vulnerabilities (SQL injection, XSS, etc.).
    3. Performance bottlenecks.
    
    Also, provide a short summary of the commit.  
    If there are no logic errors, vulnerabilities or bottlenecks, simply say "No issues found under that key"
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"Please review this commit: \n{context}",
            config={
                "system_instruction": SYSTEM_PROMPT,
                "response_mime_type": "application/json",
                "response_schema": ReviewResponse,
            }
        )

        return response.parsed

    except Exception as e:
        return {"error": f"AI Review failed: {str(e)}"}