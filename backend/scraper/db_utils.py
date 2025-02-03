from pymongo import errors, InsertOne, MongoClient
import os
import random

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

# Initialize MongoDB client
client = MongoClient(MONGO_URI)
db = client.congress_bills
bills_collection = db.bills
# create unique index on number+congress+type
try:
    bills_collection.create_index([("number", 1), ("congress", 1), ("type", 1)], unique=True)
except: pass
try:
    # create search index on title
    bills_collection.create_index([("title", "text")])
except: pass


def load_existing_bills():
    """Load existing bills from the database, returning relevant fields"""
    return db.bills.find({}, {'congress': 1, 'type': 1, 'number': 1, 'text_link': 1})

def add_to_db(new_bills):
    """Save new bills to MongoDB"""
    if not new_bills:
        return
    
    requests = [InsertOne(bill) for bill in new_bills]
    try:
        bills_collection.bulk_write(requests, ordered=False)
    except errors.BulkWriteError as e:
        dups = [op for op in e.details['writeErrors'] if op['code'] == 11000]
        if not dups:
            raise
        else:
            print(f"Duplicate bill number found, skipping: {dups}")
