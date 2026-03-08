from google import genai
import os
from pydantic import BaseModel
from dotenv import load_dotenv
import time
import json

load_dotenv()

class ReviewResponse(BaseModel):
    summary: str
    logic_errors: str
    security_vulnerabilities: str
    performance_bottlenecks: str
    score: int

client = genai.Client(api_key=os.getenv("gemini_api_key"))

def get_ai_review(context: str, past_reviews: list) -> ReviewResponse:
    '''
    context_history = ""
    if past_reviews:
        context_history = " Similar past reviews for this context: "
        for review in past_reviews:
            m=review.metadata
            context_history += f"-Past summary: {m.get('summary', 'No summary')}"
            context_history += f", logic errors: {m.get('logic_errors','No info')}"
            context_history += f", security vulnerabilities: {m.get('security_vulnerabilities','No info')}"
            context_history += f", performance bottlenecks: {m.get('performance_bottlenecks','No info')}."

    SYSTEM_PROMPT = f"""
    You are an elite Senior Software Engineer. 
    Review the code provided. Use the 'Similar past reviews' provided below 
    to ensure consistency. If a similar bug was caught before, make sure 
    to highlight it again if it exists in the new code.
     Always provide a score from 1 to 10, where 10 is perfect code and 1 is extremely buggy code.
    {context_history}
     Your review should be in JSON format with the following fields:
    - summary: A brief summary of the review.
    - logic_errors: A description of any logic errors found in the code.
    - security_vulnerabilities: A description of any security vulnerabilities found in the code.
    - performance_bottlenecks: A description of any performance bottlenecks found in the code.
    - score: An integer score from 1 to 10 indicating the overall quality of the code.
     Always respond in the specified JSON format, and never include any explanations outside of it.
     If the code is perfect, respond with a score of 10 and empty strings for the other fields.
     If the code is extremely buggy, respond with a score of 1 and detailed explanations in the other fields.
     Remember to use the 'Similar past reviews' to maintain consistency in your evaluations."
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=f"Please review this commit: \n{context}",
            config={
                "system_instruction": SYSTEM_PROMPT,
                "response_mime_type": "application/json",
                "response_schema": ReviewResponse,
            }
        )

        return response.parsed

    except Exception as e:
        print(f"AI Review failed: {e}")
        return {
            "summary": f"Error: {str(e)}",
            "logic_errors": "N/A",
            "security_vulnerabilities": "N/A",
            "performance_bottlenecks": "N/A",
            "score": 0
        } 
    '''

    print("Mock mode")
    time.sleep(3)

    return {
        "score": 8,
        "summary": "MOCK: Your code is clean, but consider adding more comments to the service layer.",
        "logic_errors": "None detected.",
        "security_vulnerabilities": "Potential for SQL injection on line 42 (Simulated).",
        "performance_bottlenecks": "Loop on line 12 could be optimized.",

    }