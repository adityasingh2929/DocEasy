import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize the Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Use Llama 3.1 8B, it's insanely fast and great for coding
MODEL = "llama-3.1-8b-instant"

def call_groq(prompt: str) -> str:
    response = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model=MODEL,
    )
    
    if response.choices and response.choices[0].message.content:
        return response.choices[0].message.content
        
    raise RuntimeError("Empty response from Groq")
