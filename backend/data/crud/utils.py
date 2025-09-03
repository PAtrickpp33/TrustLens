import requests
import pandas as pd
from typing import Iterable, List, Dict
from pathlib import Path

def get_dataset(glob_pat: str):
    # Recursively look through directories in backend/data
    data_fp = None
    for parent in Path().cwd().parents:
        results = list(parent.rglob(glob_pat))
        if results:
            # Only one clean dataset
            data_fp = results[0]
            break
        # Sentinel to stop recursively checking whole filesystem
        if parent.name == "backend":
            raise RuntimeError("Dataset not found in TrustLens/backend.")
    if data_fp is None:
        raise RuntimeError("Dataset not found.")
    # Parse either parquet or csv only
    if data_fp.suffix == ".parquet":
        return pd.read_parquet(data_fp)
    elif data_fp.suffix == ".csv":
        return pd.read_csv(data_fp)
    else:
        raise TypeError("Dataset must be either .csv or .parquet")

def chunk_records(records: list, chunk_size: int=200):
    if chunk_size <= 0:
        raise ValueError("Chunk size must be positive nonzero integer.")
    # +1 for remainder, otherwise floor div
    chunks = len(records) // chunk_size + 1 if len(records) % chunk_size != 0 else len(records) // chunk_size
    lower, upper = 0, chunk_size
    for _ in range(chunks):
        yield records[lower:upper]
        lower += chunk_size
        upper += chunk_size

def batch_post(batches: Iterable[List[Dict]], api_url: str, verbose: bool | None=None, timeout: float=10.0):
    if not api_url:
        raise ValueError("API_URL is not configured. Set the environment variable in the .env file.")
    for batch in batches:
        payload = {"items": batch}
        response = requests.post(api_url, json=payload, timeout=timeout)
        # Print results from API
        if verbose:
            print(f"Status code: {response.status_code}")
            try:
                print(f"Response: {response.json()}")
            except:
                print(f"Response (text): {response.text}")