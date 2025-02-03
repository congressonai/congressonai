from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv
import aiohttp
from pinecone_integration import PineconeClient
from grok_integration.client import grok_client
import ssl
import logging

from fastapi.responses import FileResponse


# Load environment variables
load_dotenv()

# Database configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "congress_bills"

# Create a database instance
class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to the database
    db.client = AsyncIOMotorClient(MONGO_URL)
    db.db = db.client[DB_NAME]
    logger.info("Connected to the database")
    yield
    if db.client:
        db.client.close()
    logger.info("Shutdown complete")

# Update FastAPI instance to use lifespan
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost", 
        "http://localhost:80", 
        "http://frontend:5173", 
        "http://5.161.106.191",
        "http://5.161.106.191:80",
        "http://5.161.106.191:5173", 
        "https://congresson.ai", 
        "http://congresson.ai", 
        "https://www.congresson.ai"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str
    bill_id: str
    bill_type: str
    congress: str

class BillResponse(BaseModel):
    id: str
    title: str
    summary: Optional[str]
    status: str
    type: str
    congress: int
    pdf_link: Optional[List[str]] = None  # Make it optional with default None
    latest_action: Optional[dict]

    @classmethod
    def _process_pdf_link(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            return [value]  # Convert single string to list
        if isinstance(value, list):
            return value
        return None

    def __init__(self, **data):
        if 'pdf_link' in data:
            data['pdf_link'] = self._process_pdf_link(data['pdf_link'])
        super().__init__(**data)

class BillSummaryResponse(BaseModel):
    bill_id: str
    summary: str


class CrossBillQuery(BaseModel):
    message: str
    chat_history: Optional[List] = None

# Initialize Pinecone client
pinecone_client = PineconeClient()

@app.post("/api/chat")
async def chat(message: ChatMessage):
    try:
        # Get bill from database using all identifiers
        bill = await db.db.bills.find_one({
            "number": message.bill_id,
            "type": message.bill_type.upper(),  # Changed from bill_type to type and ensure uppercase
            "congress": int(message.congress)
        })
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")

        # Try to get relevant context from Pinecone first
        context_response = await pinecone_client.get_relevant_context(message.message)
        
        # If no context found, vectorize the bill and try again
        if not context_response.get("context"):
            print(f"No context found for bill {message.bill_id}, vectorizing now...")
            text_url = bill.get("text_link")
            if not text_url or not text_url[0]:
                raise HTTPException(status_code=400, detail="Bill text URL not found")

            success = await pinecone_client.create_vectordb_from_url(
                url=text_url[0],
                metadata={
                    "bill_id": message.bill_id,
                    "title": bill.get("title"),
                    "congress": bill.get("congress"),
                    "bill_type": bill.get("type")
                }
            )
            if not success:
                raise HTTPException(status_code=500, detail="Failed to vectorize bill content")
            
            # Try getting context again after vectorization
            context_response = await pinecone_client.get_relevant_context(message.message)

        # Format the question with context if available
        if context_response.get("context"):
            enhanced_question = f"""Here's a question about bill {message.bill_id} - {bill.get('title', '')}:
{message.message}

Here's some relevant context from the bill:
{context_response["context"]}

Please provide a detailed answer based on this context."""
        else:
            enhanced_question = message.message

        # Get response from Grok
        grok_response = await grok_client.chat_about_bill(
            question=enhanced_question,
            bill_title=f'Bill {message.bill_type}.{message.bill_id} - {bill.get("title", "")}'
        )

        return {
            "message": grok_response,
            "context": context_response.get("context")
        }

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bills/{congress}/{bill_type}/{bill_id}")
async def get_bill(congress: int, bill_type: str, bill_id: str):
    bill_type = bill_type.upper()
    bill = await db.db.bills.find_one({"congress": congress, "type": bill_type, "number": bill_id})
    
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    return BillResponse(
        id=bill["number"],
        title=bill.get("title", ""),
        summary=bill.get("summary", None),
        status=bill.get("latestAction", {}).get("text", "Unknown"),
        type=bill.get("type", "Unknown"),
        congress=bill.get("congress", "Unknown"),
        pdf_link=bill.get("pdf_link", None),
        latest_action=bill.get("latestAction", {})
    )

@app.get("/api/summary/{congress}/{bill_type}/{bill_id}")
async def get_bill_summary(congress: int, bill_type: str, bill_id: str):
    # Check if summary exists in database
    bill = await db.db.bills.find_one({"congress": congress, "type": bill_type, "number": bill_id})
    
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    # If summary exists in database, return it
    if bill.get("summary"):
        return BillSummaryResponse(bill_id=bill_id, summary=bill["summary"])
    
    # If no summary, call GROK API
    try:
        # Get bill text from the text_link
        if not bill.get("text_link") or len(bill["text_link"]) == 0:
            raise HTTPException(status_code=400, detail="Bill text link not found")
            
        text_url = bill["text_link"][0]
        
        # Create SSL context that ignores verification
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        # Fetch the HTML content with SSL context
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
            async with session.get(text_url) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail=f"Failed to fetch bill text. Status: {response.status}")
                bill_text = await response.text()
            
        # Get summary from GROK
        summary = await grok_client.get_bill_summary(bill_text)
            
        # Update database with new summary
        await db.db.bills.update_one(
            {"congress": congress, "type": bill_type, "number": bill_id},
            {"$set": {"summary": summary}}
        )
        
        return BillSummaryResponse(bill_id=bill_id, summary=summary)
        
    except HTTPException as he:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")


@app.post("/api/bills/{bill_id}/vectorize")
async def vectorize_bill(bill_id: str):
    try:
        # Get bill from database
        bill = await db.db.bills.find_one({"number": bill_id})
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
            
        # Create vector embeddings for the bill
        success = await pinecone_client.create_vectordb_from_url(
            url=bill.get("text_url"),
            metadata={
                "bill_id": bill_id,
                "title": bill.get("title"),
                "congress": bill.get("congress")
            }
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to create vector embeddings")
            
        return {"message": "Bill vectorized successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bills")
async def get_bills_sorted(sort_by: str = "title", order: str = "asc"):
    try:
        # Determine the sort order
        sort_order = 1 if order == "asc" else -1
        
        # Fetch and sort bills from the database
        bills_cursor = db.db.bills.find().sort(sort_by, sort_order).limit(100)
        bills = await bills_cursor.to_list(length=100)
        
        # Transform the bills into the desired response format
        bill_responses = [
            BillResponse(
                id=bill["number"],
                title=bill.get("title", ""),
                summary=bill.get("summary", None),
                status=bill.get("latestAction", {}).get("text", "Unknown"),
                type=bill.get("type", "Unknown"),
                congress=bill.get("congress", "Unknown"),
                pdf_link=[bill["pdf_link"]] if isinstance(bill.get("pdf_link"), str) else bill.get("pdf_link", None),  # Convert string to list if needed
                latest_action=bill.get("latestAction", {})
            )
            for bill in bills
        ]
        
        return bill_responses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching bills: {str(e)}")

@app.get("/api/trending-bills")
async def get_trending_bills(sort_by: str = "title", order: str = "desc"):
    try:
        # Determine the sort order
        sort_order = 1 if order == "asc" else -1
        
        # Fetch and sort bills from the database
        bills_cursor = db.db.bills.find().sort(sort_by, sort_order).limit(50)
        bills = await bills_cursor.to_list(length=50)
        
        # Transform the bills into the desired response format
        bill_responses = [
            BillResponse(
                id=bill["number"],
                title=bill.get("title", ""),
                summary=bill.get("summary", None),
                status=bill.get("latestAction", {}).get("text", "Unknown"),
                type=bill.get("type", "Unknown"),
                congress=bill.get("congress", "Unknown"),
                pdf_link=[bill["pdf_link"]] if isinstance(bill.get("pdf_link"), str) else bill.get("pdf_link", None),  # Convert string to list if needed
                latest_action=bill.get("latestAction", {})
            )
            for bill in bills
        ]
        
        return bill_responses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching bills: {str(e)}")

@app.get("/api/search")
async def search_bills_by_title(query: str):
    try:
        # Use a case-insensitive regex to search for the title
        bills_cursor = db.db.bills.find({"title": {"$regex": query, "$options": "i"}})
        bills = await bills_cursor.to_list(length=20)
        
        # Transform the bills into the desired response format
        bill_responses = [
            BillResponse(
                id=bill["number"],
                title=bill.get("title", ""),
                summary=bill.get("summary", None),
                status=bill.get("latestAction", {}).get("text", "Unknown"),
                type=bill.get("type", "Unknown"),
                congress=bill.get("congress", "Unknown"),
                pdf_link=[bill["pdf_link"]] if isinstance(bill.get("pdf_link"), str) else bill.get("pdf_link", None),  # Convert string to list if needed
                latest_action=bill.get("latestAction", {})
            )
            for bill in bills
        ]
        
        return bill_responses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching bills: {str(e)}")

@app.get("/api/bills/{congress}/{bill_type}/{bill_id}/pdf")
async def get_bill_pdf(congress: int, bill_type: str, bill_id: str):
    # Construct the file path for the PDF
    pdf_path = os.path.join("bin", str(congress), bill_type.upper(), bill_id, "bill.pdf")
    
    # Check if the PDF file exists locally
    if os.path.exists(pdf_path):
        return FileResponse(pdf_path, media_type='application/pdf', filename=f"{bill_id}.pdf")
    
    # If PDF not found locally, fetch from database
    bill = await db.db.bills.find_one({
        "congress": congress,
        "type": bill_type.upper(),
        "number": bill_id
    })
    
    if not bill or not bill.get("pdf_link"):
        raise HTTPException(status_code=404, detail="PDF link not found in database")
    
    pdf_url = bill["pdf_link"][0]  # Assuming first link is the main PDF
    
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
        
        # Download PDF
        async with aiohttp.ClientSession() as session:
            async with session.get(pdf_url) as response:
                if response.status != 200:
                    raise HTTPException(status_code=response.status, detail="Failed to fetch PDF from source")
                
                # Save PDF to local filesystem
                with open(pdf_path, 'wb') as f:
                    f.write(await response.read())
        
        # Return the newly downloaded PDF
        return FileResponse(pdf_path, media_type='application/pdf', filename=f"{bill_id}.pdf")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
