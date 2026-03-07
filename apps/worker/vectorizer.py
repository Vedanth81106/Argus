import os
from dotenv import load_dotenv
import httpx # library to make async http requests

load_dotenv()

cloudflare_account_id = os.getenv("cloudflare_account_key")
cloudflare_api_token = os.getenv("cloudflare_api_token")

cloudflare_url = f"https://api.cloudflare.com/client/v4/accounts/{cloudflare_account_id}/ai/run/@cf/baai/bge-m3"

async def get_code_embedding(text : str):

    # preparing the data: since the model has a limit, we take the first 3k characters of the code
    payload = {"text": text[:3000]}
    headers = {"Authorization": f"Bearer {cloudflare_api_token}"}

    # async ensures the connection closes automatically when done
    async with httpx.AsyncClient() as client:

        try:
            response  = await client.post(cloudflare_url, json = payload, headers = headers)

            #check if cloudflare returned an error
            response.raise_for_status()

            # api returns a json object. we dig into the result field to get the list of 1024 floats
            result = response.json()
            return result["result"]["data"][0]
        
        except httpx.HTTPError as e:
            print(f"HTTP error occurred: {e}")
            return None
        except Exception as e:
            print(f"An error occurred: {e}")
            return None