import json
import os
import boto3
import requests
from typing import Dict, List, Any, Optional

# Configuration
DEFAULT_MODEL = "gpt-3.5-turbo"
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

# LLM Provider interface
class LLMProvider:
    def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """Generate a response from the LLM based on the conversation history."""
        raise NotImplementedError("Subclasses must implement this method")

# OpenAI implementation
class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str, api_url: str = OPENAI_API_URL):
        self.api_key = api_key
        self.api_url = api_url
        
    def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        model = kwargs.get("model", DEFAULT_MODEL)
        temperature = kwargs.get("temperature", 0.7)
        max_tokens = kwargs.get("max_tokens", 1000)
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        response = requests.post(self.api_url, headers=headers, json=payload)
        response.raise_for_status()
        
        result = response.json()
        
        return {
            "message": result["choices"][0]["message"]["content"],
            "model": model,
            "usage": result.get("usage", {})
        }

# Factory to get the appropriate LLM provider
def get_llm_provider(provider_name: str = "openai") -> LLMProvider:
    if provider_name.lower() == "openai":
        if not OPENAI_API_KEY:
            raise ValueError("OpenAI API key not found in environment variables")
        return OpenAIProvider(OPENAI_API_KEY)
    else:
        raise ValueError(f"Unsupported LLM provider: {provider_name}")

# Lambda handler
def lambda_handler(event, context):
    try:
        # Parse request body
        body = json.loads(event.get("body", "{}"))
        
        # Get messages from request
        messages = body.get("messages", [])
        
        # Get optional parameters
        provider_name = body.get("provider", "openai")
        model = body.get("model", DEFAULT_MODEL)
        temperature = body.get("temperature", 0.7)
        max_tokens = body.get("max_tokens", 1000)
        
        # Get LLM provider
        provider = get_llm_provider(provider_name)
        
        # Generate response
        response = provider.generate_response(
            messages,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        # Return response
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps(response)
        }
    
    except Exception as e:
        # Log error
        print(f"Error: {str(e)}")
        
        # Return error response
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({
                "error": str(e)
            })
        }

# Handle OPTIONS requests for CORS
def handle_options(event, context):
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        "body": json.dumps({})
    }

# Main handler that routes based on HTTP method
def handler(event, context):
    http_method = event.get("httpMethod", "")
    
    if http_method == "OPTIONS":
        return handle_options(event, context)
    elif http_method == "POST":
        return lambda_handler(event, context)
    else:
        return {
            "statusCode": 405,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "error": f"Method {http_method} not allowed"
            })
        }
