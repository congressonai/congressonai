"""
This is a simple script that periodically downloads bills from cpo.congress.gov, and saves them to a local DB
"""

import argparse
from datetime import datetime
from pymongo import MongoClient, errors

from env_utils import IS_PROD
from congress_utils import enrich_bill, get_bills_historical
from db_utils import load_existing_bills, add_to_db

# Constants
POLLING_INTERVAL = 1800 if IS_PROD else 5  # Check every half an hour

def main(congress):
    print("Starting historical bill downloader...")
    
    # Get existing bill numbers from MongoDB
    existing_bills = load_existing_bills()
    existing_bills_map = {
        f"{bill['congress']}-{bill['type']}-{bill['number']}": bill.get('text_link')
        for bill in existing_bills
    }

    # Fetch new bills
    bills = get_bills_historical(congress)
    bills = list(bills)
    
    for bill_batch in bills:
        # filter out bills that are already in the db AND have text
        new_bills = [
            bill for bill in bill_batch 
            if (f"{bill['congress']}-{bill['type']}-{bill['number']}" not in existing_bills_map or
                not existing_bills_map[f"{bill['congress']}-{bill['type']}-{bill['number']}"])  # Check text_link in existing bill
        ]

        if new_bills:
            print(f"Found {len(new_bills)} bills to process")
            processed_bills = []
            for bill in new_bills:
                enriched = enrich_bill(bill)
                bill['has_text'] = enriched  # Track whether bill has text
                processed_bills.append(bill)  # Add all bills, even those without text
            add_to_db(processed_bills)
        else:
            print("No new or text-less bills found")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Historical bill monitoring service")
    parser.add_argument("--congress", type=int, help="The congress number to fetch bills for", default=118)
    args = parser.parse_args()
    congress = args.congress
    main(congress)
