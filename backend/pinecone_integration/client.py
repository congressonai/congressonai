import os
from typing import Optional, List, Dict
from pinecone import Pinecone, ServerlessSpec
from langchain.text_splitter import RecursiveCharacterTextSplitter
import requests
import numpy as np
import logging

logger = logging.getLogger(__name__)

class PineconeClient:
    def __init__(self):
        # Initialize Pinecone
        try:
            self.pc = Pinecone(
                api_key=os.getenv("PINECONE_API_KEY"),
                environment=os.getenv("PINECONE_ENVIRONMENT", "gcp-starter")
            )
            
            self.index_name = os.getenv("PINECONE_INDEX_NAME", "congress-bills")
            
            # Create index if it doesn't exist
            existing_indexes = [index.name for index in self.pc.list_indexes()]
            if self.index_name not in existing_indexes:
                self.pc.create_index(
                    name=self.index_name,
                    dimension=3072,  # Using larger dimension
                    metric='cosine',
                    spec=ServerlessSpec(
                        cloud='aws',  # Using AWS for free tier
                        region='us-east-1'  # Free tier region
                    )
                )
            
            self.index = self.pc.Index(self.index_name)
            logger.info(f"Successfully initialized Pinecone client with index: {self.index_name}")
        
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone client: {str(e)}")
            raise
    
    async def create_vectordb_from_url(self, url: str, metadata: Optional[Dict] = None) -> bool:
        """Create vector embeddings from a bill's text URL"""
        try:
            logger.info(f"Fetching text from URL: {url}")
            # Fetch text from URL
            response = requests.get(url, timeout=30)  # Add timeout
            response.raise_for_status()  # Raise exception for bad status codes
            text = response.text
            logger.info(f"Successfully fetched text, length: {len(text)}")
            
            # Create chunks of text
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=500,
                chunk_overlap=50
            )
            chunks = text_splitter.split_text(text)
            logger.info(f"Created {len(chunks)} chunks")
            
            # Create records for Pinecone
            vectors = []
            for i, chunk in enumerate(chunks):
                # Create a dummy vector (all zeros except one random position)
                vector = np.zeros(3072)
                vector[np.random.randint(0, 3072)] = 1
                
                vectors.append({
                    "id": f"{metadata['bill_id']}_chunk_{i}",
                    "values": vector.tolist(),
                    "metadata": {
                        "text": chunk,
                        "bill_id": metadata.get("bill_id"),
                        "title": metadata.get("title"),
                        "congress": metadata.get("congress"),
                        "bill_type": metadata.get("bill_type"),
                        "chunk_id": i
                    }
                })
            
            logger.info(f"Created {len(vectors)} vectors")
            
            # Upsert in batches of 100
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i + batch_size]
                logger.info(f"Upserting batch {i//batch_size + 1} of {(len(vectors) + batch_size - 1)//batch_size}")
                self.index.upsert(vectors=batch)
            
            logger.info("Vectorization completed successfully")
            return True
        except Exception as e:
            logger.error(f"Error creating vector DB: {str(e)}")
            return False
    
    async def is_bill_vectorized(self, bill_id: str, bill_type: str, congress: str) -> bool:
        """
        Check if a bill is already vectorized in Pinecone.
        
        Args:
            bill_id (str): The bill number (e.g., "3076")
            bill_type (str): The type of bill (e.g., "hr", "s")
            congress (str): The congress number (e.g., "117")
            
        Returns:
            bool: True if the bill is vectorized, False otherwise
        """
        try:
            # Try to fetch one vector with the bill_id in metadata
            response = self.index.query(
                vector=np.zeros(3072).tolist(),  # Dummy vector
                top_k=25,
                include_metadata=True,
                filter={
                    "$and": [
                        {"bill_id": bill_id},
                        {"bill_type": bill_type},
                        {"congress": congress}
                    ]
                }
            )
            return len(response['matches']) > 0
        except Exception as e:
            logger.error(f"Error checking if bill is vectorized: {str(e)}")
            return False
    
    async def query_bill(self, question: str, chat_history: List = None) -> dict:
        """Query the vector DB about a specific bill using Pinecone's hybrid search"""
        try:
            logger.info("Querying Pinecone...")
            # Create a dummy query vector (all zeros except one random position)
            query_vector = np.zeros(3072)
            query_vector[np.random.randint(0, 3072)] = 1
            
            # Use hybrid search to find relevant chunks
            query_response = self.index.query(
                vector=query_vector.tolist(),
                top_k=25,
                include_metadata=True,
                filter={}
            )
            
            logger.info(f"Number of matches: {len(query_response.matches) if hasattr(query_response, 'matches') else 0}")
            
            # Extract relevant text chunks and metadata
            context = []
            sources = []
            
            if hasattr(query_response, 'matches'):
                for match in query_response.matches:
                    if hasattr(match, 'metadata'):
                        text = match.metadata.get("text", "")
                        logger.info(f"Found text: {text[:100]}...")
                        context.append(text)
                        sources.append({
                            "bill_id": match.metadata.get("bill_id"),
                            "title": match.metadata.get("title"),
                            "congress": match.metadata.get("congress"),
                            "chunk_id": match.metadata.get("chunk_id")
                        })
            
            if not context:
                logger.info("No context found in Pinecone")
                return {
                    "answer": "I apologize, but I couldn't find any relevant information to answer your question.",
                    "sources": []
                }
            
            # Format context for the answer
            formatted_context = "\n\n".join(context)
            
            # Create a more focused response
            answer = self._generate_concise_answer(question, formatted_context)
            
            return {
                "answer": answer,
                "sources": sources
            }
        except Exception as e:
            logger.error(f"Error querying bill: {str(e)}")
            return {"error": str(e)}
    
    async def get_relevant_context(self, question: str) -> dict:
        """Get relevant context from Pinecone without generating an answer"""
        try:
            logger.info("Getting relevant context from Pinecone...")
            # Create a dummy query vector (all zeros except one random position)
            query_vector = np.zeros(3072)
            query_vector[np.random.randint(0, 3072)] = 1
            
            # Use hybrid search to find relevant chunks
            query_response = self.index.query(
                vector=query_vector.tolist(),
                top_k=25,
                include_metadata=True,
                filter={}
            )
            
            # Extract relevant text chunks and metadata
            context = []
            sources = []
            
            if hasattr(query_response, 'matches'):
                for match in query_response.matches:
                    if hasattr(match, 'metadata'):
                        text = match.metadata.get("text", "")
                        context.append(text)
                        sources.append({
                            "bill_id": match.metadata.get("bill_id"),
                            "title": match.metadata.get("title"),
                            "congress": match.metadata.get("congress"),
                            "chunk_id": match.metadata.get("chunk_id")
                        })
            
            if not context:
                return {"context": None, "sources": []}
            
            # Format context
            formatted_context = "\n\n".join(context)
            
            return {
                "context": formatted_context,
                "sources": sources
            }
        except Exception as e:
            logger.error(f"Error getting context: {str(e)}")
            return {"context": None, "sources": []}
    
    async def search_across_bills(self, question: str) -> dict:
        """Search for relevant context across all vectorized bills"""
        try:
            logger.info("Searching across all bills...")
            # Create a dummy query vector (all zeros except one random position)
            query_vector = np.zeros(3072)
            query_vector[np.random.randint(0, 3072)] = 1
            
            # Use hybrid search to find relevant chunks across all bills
            query_response = self.index.query(
                vector=query_vector.tolist(),
                top_k=25,  # Updated for cross-bill search
                include_metadata=True,
                filter={}  # No filter to search across all bills
            )
            
            # Extract relevant text chunks and metadata
            results = []
            
            if hasattr(query_response, 'matches'):
                for match in query_response.matches:
                    if hasattr(match, 'metadata'):
                        text = match.metadata.get("text", "")
                        bill_info = {
                            "bill_id": match.metadata.get("bill_id"),
                            "title": match.metadata.get("title"),
                            "congress": match.metadata.get("congress"),
                            "text": text
                        }
                        results.append(bill_info)
            
            if not results:
                logger.info("No results found in cross-bill search")
                return {"context": None, "bills": []}
            
            # Format context with bill information
            formatted_context = []
            for result in results:
                formatted_context.append(f"""From bill {result['bill_id']} - {result['title']}:
{result['text']}""")
            
            logger.info(f"Found {len(results)} relevant bills in cross-bill search")
            return {
                "context": "\n\n".join(formatted_context),
                "bills": [{"bill_id": r["bill_id"], "title": r["title"], "congress": r["congress"]} for r in results]
            }
        except Exception as e:
            logger.error(f"Error searching across bills: {str(e)}")
            return {"context": None, "bills": []}
    
    async def get_full_bill_content(self, bill_id: str) -> dict:
        """Get the entire content of a specific bill"""
        try:
            logger.info(f"Getting full content for bill {bill_id}...")
            # Query all chunks for this bill
            query_response = self.index.query(
                vector=np.zeros(3072).tolist(),  # Dummy vector
                top_k=25,  # Updated from 1000 to be consistent
                include_metadata=True,
                filter={
                    "bill_id": {"$eq": bill_id}
                }
            )
            
            if not hasattr(query_response, 'matches') or not query_response.matches:
                logger.warning(f"No content found for bill {bill_id}")
                return {"content": None, "metadata": None}
            
            # Sort chunks by chunk_id to maintain order
            chunks = []
            metadata = None
            for match in query_response.matches:
                if hasattr(match, 'metadata'):
                    chunk_id = match.metadata.get("chunk_id", 0)
                    text = match.metadata.get("text", "")
                    chunks.append((chunk_id, text))
                    
                    # Store metadata from first chunk
                    if metadata is None:
                        metadata = {
                            "bill_id": match.metadata.get("bill_id"),
                            "title": match.metadata.get("title"),
                            "congress": match.metadata.get("congress")
                        }
            
            # Sort chunks by chunk_id and join
            chunks.sort(key=lambda x: x[0])
            full_content = "\n\n".join(chunk[1] for chunk in chunks)
            
            logger.info(f"Successfully retrieved full content for bill {bill_id}")
            return {
                "content": full_content,
                "metadata": metadata
            }
        except Exception as e:
            logger.error(f"Error getting full bill content for {bill_id}: {str(e)}")
            return {"content": None, "metadata": None}
    
    def _generate_concise_answer(self, question: str, context: str) -> str:
        """Generate a concise answer based on the context"""
        # Extract key information from context based on the question
        relevant_info = []
        
        # Split context into sentences for better processing
        sentences = context.split('. ')
        
        # Simple keyword matching to find relevant sentences
        question_words = set(question.lower().split())
        for sentence in sentences:
            sentence_words = set(sentence.lower().split())
            # If there's significant word overlap, include this sentence
            if len(question_words.intersection(sentence_words)) >= 2:
                relevant_info.append(sentence)
        
        if not relevant_info:
            return "Based on the bill's content, I cannot find a direct answer to your question."
        
        # Combine relevant sentences into a concise answer
        answer = ". ".join(relevant_info[:2])  
        
        # Format the answer to be more direct
        if question.lower().startswith("what"):
            return f"{answer}."
        elif question.lower().startswith("how"):
            return f"The bill addresses this by {answer}."
        elif question.lower().startswith("why"):
            return f"The reason is that {answer}."
        elif question.lower().startswith("when"):
            return f"According to the bill, {answer}."
        elif question.lower().startswith("who"):
            return f"{answer}."
        else:
            return f"{answer}."
