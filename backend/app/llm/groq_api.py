import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize the Groq client
client = None

# Override the provider model without changing application code.
MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

def call_groq(prompt: str, json_mode: bool = False) -> str:
    global client
    if client is None:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"), timeout=30.0, max_retries=1)
    response = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model=MODEL,
        **({"response_format": {"type": "json_object"}} if json_mode else {}),
    )

    if response.choices and response.choices[0].message.content:
        return response.choices[0].message.content

    raise RuntimeError("Empty response from Groq")
