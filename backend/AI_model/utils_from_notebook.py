# utils_from_notebook.py
import re
from typing import List

TOKEN_SPLIT = re.compile(r"[\\/\\.\\?\\&\\=\\_\\-\\:\\+\\%\\#\\|\\!\\,\\;\\@\\(\\)\\[\\]\\{\\}]")
PAD_ID, UNK_ID = 0, 1

def normalize_url(u: str) -> str:
    return str(u).strip().lower()

def tok_chars_url(u: str) -> List[str]:
    return list(normalize_url(u))

def tok_words(u: str) -> List[str]:
    return [t for t in TOKEN_SPLIT.split(normalize_url(u)) if t]

def tok_chars_token(tok: str, max_tok_char: int = 16) -> List[str]:
    return list(tok)[:max_tok_char]
