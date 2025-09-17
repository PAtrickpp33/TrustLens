#!/usr/bin/env python

# To run: 
# host:TrustLens user$ cd backend
# host:backend user$ python -m data.crud.insert_email

from config import settings
from utils import get_dataset, chunk_records, batch_post

API_URL = f"{settings.api_url.strip()}/api/v1/email/import"

def main():
    # Ex. dataset = "email_phishing_clean.parquet"
    email_data = get_dataset("**/email*clean.parquet")

    # Reformat DF to address, risk_level, notes, mx_valid, and disposable cols
    email_data = email_data[["address", "risk_level"]].copy()
    email_data["notes"] = None
    email_data["mx_valid"] = 0
    email_data["disposable"] = 0

    # Convert to JSON array [{record 1}, {record 2}, ...]
    email_records = email_data.to_dict(orient="records")
    
    email_batches = chunk_records(email_records, chunk_size=10)

    # Send POST request to API to update remote DB
    batch_post(email_batches, API_URL, verbose=True)
    
if __name__ == "__main__":
    main()