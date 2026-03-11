'''
import google as genai

genai.configure(api_key="AIzaSyCXMH0gn-xJO01UKnA5Kmlb5Ea1znEcJJE")

print("AVAILABLE MODELS")

for model in genai.list_models():
    if'generateContent' in model.supported_generation_methods:
        print(f"Model name: {model.name}")
        print(f"Model description: {model.description}")
        print(f"Model supported generation methods: {model.supported_generation_methods}")
        print(f"Model input token limit: {model.input_token_limit}")
        print(f"Model output token limit: {model.output_token_limit}")
        print(f"Model context window size: {model.context_window_size}")

'''
from google import genai

client = genai.Client(api_key="AIzaSyCXMH0gn-xJO01UKnA5Kmlb5Ea1znEcJJE")

print("List of models that support generateContent:\n")
for model in client.models.list():
    for action in model.supported_actions:
        if action == "generateContent":
            print(f"Model name: {model.name}")
            print(f"Model description: {model.description}")
            print(f"Model input token limit: {model.input_token_limit}")
            print(f"Model output token limit: {model.output_token_limit}")
            print("*******************************************************")
