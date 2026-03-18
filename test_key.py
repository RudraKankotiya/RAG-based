import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
print(f"Testing key: {api_key[:10]}...")

genai.configure(api_key=api_key)

try:
    for m in genai.list_models():
        print(f"Model: {m.name}")
except Exception as e:
    print(f"Error: {e}")
