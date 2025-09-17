#!/usr/bin/env python

# To run: 
# host:TrustLens user$ cd backend
# host:backend user$ python -m data.crud.insert_url

from .config import settings
from .utils import get_dataset, chunk_records, batch_post

API_URL = f"{settings.api_url.strip()}/api/v1/url/import"

def main():
    # Ex. dataset = "email_phishing_clean.parquet"
    url_data = get_dataset("**/url*clean.parquet")

    # Retain only relevant cols and reformat to specific order
    url_data = url_data[["full_url", "risk_level", "phishing_flag"]]
    url_data = url_data.rename(columns={"full_url": "url"})
    url_data["notes"] = ""

    # Convert to JSON array [{record 1}, {record 2}, ...]
    url_records = url_data.to_dict(orient="records")
    
    url_batches = chunk_records(url_records[:10], chunk_size=10)

    # Send POST request to API to update remote DB
    batch_post(url_batches, API_URL, verbose=True)
    
if __name__ == "__main__":
    main()