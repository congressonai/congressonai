"""
This is a simple script that periodically downloads bills from cpo.congress.gov, and saves them to a local DB
"""

import time
from datetime import datetime

from env_utils import IS_PROD
from congress_utils import enrich_bill, fetch_recent_bills
from db_utils import load_existing_bills, add_to_db
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Constants
POLLING_INTERVAL = 1800 if IS_PROD else 5  # Check every half an hour


def main():
    print("Starting bill monitoring service...")
    
    while True:
        # Get existing bill numbers from MongoDB
        existing_bills = load_existing_bills()
        existing_bills_map = {
            f"{bill['congress']}-{bill['type']}-{bill['number']}": bill.get('text_link')
            for bill in existing_bills
        }

        # Fetch new bills
        bills = fetch_recent_bills()
        bills = bills["bills"]
        
        # Filter out bills that are already in the db AND have text
        bills = [
            bill for bill in bills 
            if (f"{bill['congress']}-{bill['type']}-{bill['number']}" not in existing_bills_map or
                not existing_bills_map[f"{bill['congress']}-{bill['type']}-{bill['number']}"])  # Check text_link in existing bill
        ]

        if bills:
            print(f"Found {len(bills)} bills to process")
            processed_bills = []
            for bill in bills:
                enriched = enrich_bill(bill)
                bill['has_text'] = enriched  # Track whether bill has text
                processed_bills.append(bill)  # Add all bills, even those without text
            add_to_db(processed_bills)
        else:
            print("No new or text-less bills found")
        
        time.sleep(POLLING_INTERVAL)

if __name__ == "__main__":
    main()
