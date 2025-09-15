# encoders_from_notebook.py
import numpy as np
from AI_model.utils_from_notebook import PAD_ID, UNK_ID, tok_chars_url, tok_words, tok_chars_token

def enc_char_url(u, char2id, max_len=256):
    ids = [char2id.get(ch, UNK_ID) for ch in tok_chars_url(u)[:max_len]]
    if len(ids) < max_len:
        ids += [PAD_ID] * (max_len - len(ids))
    return np.array(ids, np.int64)

def enc_words(u, word2id, max_words=64):
    toks = tok_words(u)[:max_words]
    ids = [word2id.get(t, UNK_ID) for t in toks]
    if len(ids) < max_words:
        ids += [PAD_ID] * (max_words - len(ids))
    return np.array(ids, np.int64)

# === token char ===
def enc_token_chars(u, tokenchar2id, max_words=64, max_tok_char=16):
    toks = tok_words(u)[:max_words]
    out = []
    for t in toks:
        chs = [tokenchar2id.get(c, UNK_ID) for c in tok_chars_token(t, max_tok_char)]
        if len(chs) < max_tok_char:
            chs += [PAD_ID] * (max_tok_char - len(chs))
        out.append(chs)
    while len(out) < max_words:
        out.append([PAD_ID] * max_tok_char)
    return np.array(out, np.int64)  # [T, Lc]

