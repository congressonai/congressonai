import requests
import time
import os

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv("CONGRESS_API_KEY")
if not API_KEY:
    raise ValueError("Please set CONGRESS_API_KEY environment variable")
    
def fetch_recent_bills():
    """Fetch recent bills from the Congress.gov API"""
    url = f"https://api.congress.gov/v3/bill?format=json&api_key={API_KEY}&fromDateTime=2024-01-01T00:00:00Z&sort=updateDate+asc&limit=250"
    response = requests.get(url)
    return response.json()

def enrich_bill(bill):
    """
    Enrich a bill with additional information and download bill text/PDF.
    Returns True if text was found, None if not (for backwards compatibility)
    Also updates the bill object directly with enrichment details
    """
    bill_type = bill["type"].lower()
    congress = bill["congress"]
    bill_number = bill["number"]

    # Initialize enrichment fields in bill
    bill.update({
        'pdf_link': None,
        'text_link': None,
        'enrichment_error': None
    })

    # get the bill text
    url = f"https://api.congress.gov/v3/bill/{congress}/{bill_type}/{bill_number}/text?format=json&api_key={API_KEY}"
    response = requests.get(url)
    j = response.json()
    text_versions = j.get('textVersions', [])
    
    if not text_versions:
        bill['enrichment_error'] = f'No text versions found for bill {congress}/{bill_type}/{bill_number}'
        print(f'[!] Warning: {bill["enrichment_error"]}')
        return None
    
    texts = text_versions[0]
    pdf_link = [f['url'] for f in texts['formats'] if f['type'] == 'PDF']
    text_link = [f['url'] for f in texts['formats'] if f['type'] == 'Formatted Text']
    
    if not pdf_link or not text_link:
        bill['enrichment_error'] = f'Missing links for bill {congress}/{bill_type}/{bill_number}'
        print(f'[!] Warning: {bill["enrichment_error"]}')
        return None

    # Update bill with links
    bill['pdf_link'] = pdf_link[0]
    bill['text_link'] = text_link[0]
    
    # Create directory structure
    bill_dir = os.path.join('bin', str(congress), bill_type, str(bill_number))
    os.makedirs(bill_dir, exist_ok=True)

    time.sleep(1)
    return True

def get_bills_historical(congress):
    """Get all bills for a given congress"""
    url = f"https://api.congress.gov/v3/bill/{congress}?format=json&api_key={API_KEY}&fromDateTime=2024-01-01T00:00:00Z&sort=updateDate+asc&limit=250"
    while url:
        response = requests.get(url)
        j = response.json()
        yield j['bills']
        pagination = j.get('pagination')
        if not pagination or 'next' not in pagination:
            break
        url = pagination['next']
        # add api_key to url
        url = f"{url}&api_key={API_KEY}"
        time.sleep(1)
