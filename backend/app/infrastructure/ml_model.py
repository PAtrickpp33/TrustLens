import json
import torch
from app.core.config import llm_settings

# ======== Encoders & Dynamic URLNet builder ========
from AI_model.encoders_from_notebook import enc_char_url, enc_words, enc_token_chars  # 你的编码器
from AI_model.modeldef_from_notebook import build_urlnet_from_state_dict             # 动态搭建模型

META_PATH = llm_settings.meta_path
WEIGHT_PATH = llm_settings.weight_path

# ======== URLNet Wrapper ========
class URLScorer:
    def __init__(self, meta_path: str = META_PATH, weights_path: str = WEIGHT_PATH):
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        self.CHAR2ID = meta["CHAR2ID"]
        self.WORD2ID = meta["WORD2ID"]
        self.TOKCHAR2ID = meta["TOKCHAR2ID"]
        self.MAX_LEN = meta.get("MAX_LEN", 256)
        self.MAX_WORDS = meta.get("MAX_WORDS", 64)
        self.MAX_TOK_CHAR = meta.get("MAX_TOK_CHAR", 16)

        sd = torch.load(weights_path, map_location="cpu")
        if not isinstance(sd, dict) or any(not isinstance(k, str) for k in sd.keys()):
            sd = sd.state_dict()

        if any(k.startswith("module.") for k in sd.keys()):
            sd = {k[7:]: v for k, v in sd.items()}

        self.model = build_urlnet_from_state_dict(self.CHAR2ID, self.WORD2ID, self.TOKCHAR2ID, sd)
        self.model.eval()

    def score(self, url: str) -> float:
        x_char = torch.tensor([enc_char_url(url, self.CHAR2ID, max_len=self.MAX_LEN)], dtype=torch.long)
        x_word = torch.tensor([enc_words(url, self.WORD2ID, max_words=self.MAX_WORDS)], dtype=torch.long)
        x_tokc = torch.tensor([enc_token_chars(url, self.TOKCHAR2ID,
                                               max_words=self.MAX_WORDS, max_tok_char=self.MAX_TOK_CHAR)],
                              dtype=torch.long)
        with torch.no_grad():
            out = self.model(x_char, x_word, x_tokc)
            prob = out.get("prob", None)
            if prob is None:
                logit = out.get("logit", None)
                if logit is None:
                    raise RuntimeError("Model output missing both 'prob' and 'logit'.")
                prob = torch.sigmoid(logit)
            return float(prob.squeeze().item())