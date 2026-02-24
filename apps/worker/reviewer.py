from google import genai
import os
from dotenv import load_dotenv
import json

load_dotenv()

client = genai.Client(api_key=os.getenv("gemini-api-key"))

def get_ai_review(context: str) -> dict:

    prompt = f"""
    You are an elite Senior Software Engineer and Security Researcher.
    Review the following code changes from a Git commit.
    
    Look for:
    1. Logic errors or potential bugs.
    2. Security vulnerabilities (SQL injection, XSS, etc.).
    3. Performance bottlenecks.
    
    Also, provide a short summary of the commit.
    
    Return a JSON object with exactly these keys:
    "summary": (string),
    "logic_errors": (string),
    "security_vulnerabilities": (string),
    "performance_bottlenecks": (string),
    "score": (integer from 1 to 10)
    
    If there are no logic errors, vulnerabilities or bottlenecks, simply say "No issues found under that key"
    
    CODE TO REVIEW:
    {context}
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        raw = response.text.strip()
        if(raw.startswith("```")):
            raw = raw.split("```")[1]
            if(raw.startswith("json")):
                raw = raw[4:]

        return json.loads(raw)

    except Exception as e:
        return {"error": f"AI Review failed: {str(e)}"}