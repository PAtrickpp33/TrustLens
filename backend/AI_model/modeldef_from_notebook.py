# modeldef_from_notebook.py
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Tuple, List

class _Branch(nn.Module):
    def __init__(self, vocab_size: int, emb_dim: int,
                 conv_specs: List[tuple], proj_in_out=None, emb_name="emb", padding_idx=0):
        super().__init__()
        if emb_name == "word_emb":
            self.word_emb = nn.Embedding(vocab_size, emb_dim, padding_idx=padding_idx)
            self.emb = None
        else:
            self.emb = nn.Embedding(vocab_size, emb_dim, padding_idx=padding_idx)
            self.word_emb = None

        self._conv_in = conv_specs[0][1]  # in_ch from first conv

        self.proj = None
        if proj_in_out is not None:
            in_dim, out_dim = proj_in_out
            self.proj = nn.Linear(in_dim, out_dim, bias=True)
        elif self._conv_in != emb_dim:
            self.proj = nn.Linear(emb_dim, self._conv_in, bias=True)

        self.convs = nn.ModuleList()
        for (out_ch, in_ch, k) in conv_specs:
            self.convs.append(nn.Conv1d(in_ch, out_ch, kernel_size=k, padding=k // 2, bias=True))

    def _embed(self, x):
        return self.emb(x) if self.emb is not None else self.word_emb(x)

    def _maybe_project(self, x_e: torch.Tensor) -> torch.Tensor:
        in_feat = x_e.shape[-1]
        need = self._conv_in
        if in_feat == need:
            if self.proj is not None and getattr(self.proj, "in_features", None) == need and getattr(self.proj, "out_features", None) == need:
                return self.proj(x_e)
            return x_e

        #  in_feat -> need
        if self.proj is None or getattr(self.proj, "in_features", None) != in_feat or getattr(self.proj, "out_features", None) != need:
            self.proj = nn.Linear(in_feat, need, bias=True)
        return self.proj(x_e)

    def _apply_convs(self, x_e):  # x_e: [B, L, D]
        x = x_e.transpose(1, 2)   # [B, D, L]
        outs = []
        for conv in self.convs:
            y = F.relu(conv(x))
            y = F.max_pool1d(y, y.shape[2]).squeeze(2)  # [B, out_ch]
            outs.append(y)
        return outs[0] if len(outs) == 1 else torch.cat(outs, dim=1)

    def forward(self, x):
        # x: [B, L] / [B, W]（indices）
        if x.dim() == 3:
            x_e = x
        else:
            x_e = self._embed(x)  # [B, L, D_emb]
        x_e = self._maybe_project(x_e)  # [B, L, conv_in]
        return self._apply_convs(x_e)

class URLNetDynamic(nn.Module):
    def __init__(self, branches: Dict[str, _Branch], fc_in_features: int):
        super().__init__()
        for name, mod in branches.items():
            setattr(self, name, mod)
        self._branch_names = list(branches.keys())
        self.fc = nn.Linear(fc_in_features, 1)

    def forward(self, x_char, x_word, x_tokc):
        outs = []

        # 1) char_url
        if hasattr(self, "char_url"):
            outs.append(getattr(self, "char_url")(x_char))  # expects [B, Lc]

        # 2) word_cnn +char_tok
        has_word = hasattr(self, "word_cnn")
        has_tok  = hasattr(self, "char_tok")

        if has_word:
            word_br: _Branch = getattr(self, "word_cnn")
            word_e = word_br._embed(x_word)  # [B, W, Dw]

            if has_tok:
                tok_br: _Branch = getattr(self, "char_tok")
                # x_tokc: [B, W, C]
                B, W, C = x_tokc.shape
                flat = x_tokc.reshape(B * W, C)     # [B*W, C]
                tok_e = tok_br._embed(flat)         # [B*W, C, Dt]
                tok_e = tok_e.mean(dim=1)           # [B*W, Dt]
                tok_e = tok_e.view(B, W, -1)        # [B, W, Dt]

                # [B, W, Dw+Dt]
                merged = torch.cat([word_e, tok_e], dim=2)
                out_word = word_br.forward(merged)
            else:
                out_word = word_br.forward(x_word)

            outs.append(out_word)

        else:
            if has_tok:
                tok_br: _Branch = getattr(self, "char_tok")
                B, W, C = x_tokc.shape
                flat = x_tokc.reshape(B * W, C)
                tok_e = tok_br._embed(flat).mean(dim=1).view(B, W, -1)  # [B,W,Dt]
                tok_e = tok_br._maybe_project(tok_e)
                outs.append(tok_br._apply_convs(tok_e))

        h = torch.cat(outs, dim=1) if len(outs) > 1 else outs[0]
        logit = self.fc(h)
        prob = torch.sigmoid(logit)
        return {"logit": logit.squeeze(1), "prob": prob.squeeze(1)}

def _branch_from_sd(prefix: str, sd: dict, declared_vocab_size: int, padding_idx=0) -> Tuple[_Branch, int]:
    if f"{prefix}.emb.weight" in sd:
        emb_w = sd[f"{prefix}.emb.weight"]; emb_name = "emb"
    elif f"{prefix}.word_emb.weight" in sd:
        emb_w = sd[f"{prefix}.word_emb.weight"]; emb_name = "word_emb"
    else:
        raise RuntimeError(f"Missing embedding for '{prefix}' in checkpoint.")
    ckpt_vocab_rows, emb_dim = emb_w.shape

    conv_specs = []
    i = 0
    while f"{prefix}.convs.{i}.weight" in sd:
        w = sd[f"{prefix}.convs.{i}.weight"]  # [out_ch, in_ch, k]
        out_ch, in_ch, k = w.shape
        conv_specs.append((out_ch, in_ch, k))
        i += 1
    if not conv_specs:
        raise RuntimeError(f"No convs found for '{prefix}' in checkpoint.")

    proj_in_out = None
    if f"{prefix}.proj.weight" in sd and f"{prefix}.proj.bias" in sd:
        pw = sd[f"{prefix}.proj.weight"]  # [out, in]
        proj_in_out = (pw.shape[1], pw.shape[0])  # (in, out)

    br = _Branch(
        vocab_size=ckpt_vocab_rows,
        emb_dim=emb_dim,
        conv_specs=conv_specs,
        proj_in_out=proj_in_out,
        emb_name=emb_name,
        padding_idx=padding_idx,
    )
    out_total = sum(o for (o, _, _) in conv_specs)
    return br, out_total

def build_urlnet_from_state_dict(CHAR2ID: dict, WORD2ID: dict, TOKCHAR2ID: dict, sd: dict) -> nn.Module:
    def has_prefix(pfx: str) -> bool:
        return any(k.startswith(pfx + ".") for k in sd.keys())

    branches: Dict[str, _Branch] = {}
    fc_in = 0

    if has_prefix("char_url"):
        br, c = _branch_from_sd("char_url", sd, len(CHAR2ID))
        branches["char_url"] = br; fc_in += c

    if has_prefix("word_cnn"):
        br, c = _branch_from_sd("word_cnn", sd, len(WORD2ID))
        branches["word_cnn"] = br; fc_in += c

    if has_prefix("char_tok"):

        br, _ = _branch_from_sd("char_tok", sd, len(TOKCHAR2ID))
        branches["char_tok"] = br

    if "fc.weight" in sd:
        fc_in = sd["fc.weight"].shape[1]

    model = URLNetDynamic(branches, fc_in)
    model.load_state_dict(sd, strict=False)
    model.eval()
    return model

