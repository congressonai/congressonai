import os
from typing import Optional
import httpx
from fastapi import HTTPException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GrokClient:
    """
    A client for interacting with the XAI (Grok) API to generate bill summaries and analysis.
    
    This client provides methods to:
    - Generate concise summaries of legislative bills
    - Analyze bills based on specific criteria
    
    The client uses the XAI API with the grok-2-1212 model and requires an API key
    to be set in the GROK_API_KEY environment variable.
    """

    def __init__(self):
        """
        Initialize the GrokClient with API key and base URL.
        
        Raises:
            ValueError: If GROK_API_KEY environment variable is not set
        """
        self.api_key = os.getenv("GROK_API_KEY")
        self.base_url = "https://api.x.ai/v1/chat/completions"
        
        if not self.api_key:
            raise ValueError("GROK API key not configured")
            
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def _make_request(self, messages: list, temperature: float = 0.3, max_tokens: int = 500) -> str:
        """
        Make a request to the XAI (Grok) API.
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            temperature: Controls randomness in the response (0.0 to 1.0)
            
        Returns:
            str: The generated response text
            
        Raises:
            HTTPException: If the API request fails or times out
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers=self.headers,
                    json={
                        "model": "grok-beta",
                        "messages": messages,
                        "temperature": temperature,
                        "stream": False,
                        "max_tokens": max_tokens
                    },
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=500,
                        detail=f"GROK API error: {response.text}"
                    )
                    
                result = response.json()
                return result["choices"][0]["message"]["content"].strip()
                
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="GROK API request timed out")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error calling GROK API: {str(e)}")
    
    async def get_bill_summary(self, bill_text: str) -> str:
        """
        Generate a concise summary of a legislative bill.
        
        This method uses the Grok model to create a brief, focused summary
        of the bill's main purpose and key provisions, limited to 2-3 sentences.
        
        Args:
            bill_text: The full text content of the bill
            
        Returns:
            str: A concise summary of the bill
            
        Raises:
            HTTPException: If the API request fails
        """
        prompt = f"""Provide a brief, one-paragraph summary of this bill's main purpose and key provisions. Be extremely concise and focus only on the most important points:

{bill_text}

Summary:"""

        messages = [
            {
                "role": "system", 
                "content": "You are a legislative assistant that provides extremely concise bill summaries. Keep summaries to 2-3 sentences maximum, focusing only on the core purpose and most important provisions."
            },
            {"role": "user", "content": prompt}
        ]
        
        return await self._make_request(messages, temperature=0.3)
    
    async def analyze_bill(self, bill_text: str, analysis_type: str) -> str:
        """
        Analyze a bill based on the specified analysis type.
        
        Args:
            bill_text: The full text content of the bill
            analysis_type: The type of analysis to perform
            
        Returns:
            str: The analysis result
            
        Raises:
            HTTPException: If the API request fails
        """
        prompt = f"""Please analyze the following bill text based on {analysis_type}:

{bill_text}

Analysis:"""

        messages = [
            {"role": "system", "content": "You are an expert in legislative analysis."},
            {"role": "user", "content": prompt}
        ]
        
        return await self._make_request(messages)

    async def chat_about_bill(self, question: str, bill_title: str = None) -> str:
        """
        Handle a chat interaction about a specific bill.
        
        Args:
            question: The user's question or message
            bill_title: The title of the bill
            
        Returns:
            str: The AI's response to the question
            
        Raises:
            HTTPException: If the API request fails
        """
        try:

            messages = [
                {
                    "role": "system",
                    "content": """You are Grok, a chatbot with vast knowledge of all Congress bills, with real time updates of the latest events.
                    Your answers are to be concise and to the point.
                    Your answers should be authoritative and factual, yet not boring or dry. Try to make them interesting and engaging.
                    When the bill doesn't contain information about the specific question, you should just use your knowledge to answer the question.
                    Strive for your answers to contain up to date info and if possible make them interesting and engaging."""
                },
                {
                    "role": "user",
                    "content": f"{bill_title}. {question}"
                }
            ]
            
            return await self._make_request(messages, temperature=1, max_tokens=2000)

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error calling Grok API: {str(e)}")

# Create a singleton instance
grok_client = GrokClient()
