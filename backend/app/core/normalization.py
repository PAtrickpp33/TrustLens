from __future__ import annotations

import hashlib
from typing import Tuple, Optional
from urllib.parse import urlparse, urlunparse

import phonenumbers
from email_validator import validate_email, EmailNotValidError
import tldextract


def normalize_phone(*, e164: Optional[str] = None, country_code: Optional[str] = None, national_number: Optional[str] = None) -> Tuple[str, str, str]:
    """Return (e164, country_code, national_number). Raises ValueError if invalid."""
    try:
        if e164:
            raw_in = e164.strip()
            # Strip common prefixes like tel: or tel://
            if raw_in.lower().startswith("tel:"):
                raw_in = raw_in[4:]
            parsed = phonenumbers.parse(raw_in, None)
        else:
            if not country_code or not national_number:
                raise ValueError("country_code and national_number are required when e164 is not provided")
            raw = f"{country_code}{national_number}"
            parsed = phonenumbers.parse(raw, None)
        if not phonenumbers.is_valid_number(parsed):
            raise ValueError("Invalid phone number")
        e164_fmt = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        cc = f"+{parsed.country_code}"
        nn = str(parsed.national_number)
        return e164_fmt, cc, nn
    except phonenumbers.NumberParseException as e:
        raise ValueError(str(e))


def normalize_email(address: str) -> Tuple[str, str, str]:
    """Return (local_part, domain, normalized_address). Raises ValueError if invalid."""
    try:
        addr = (address or "").strip()
        if not addr:
            raise ValueError("Email cannot be empty")
        # Extract inside angle brackets if present: Name <user@example.com>
        if "<" in addr and ">" in addr:
            start = addr.rfind("<")
            end = addr.find(">", start + 1)
            if start != -1 and end != -1 and end > start + 1:
                addr = addr[start + 1:end].strip()
        # Strip mailto: prefix if present
        if addr.lower().startswith("mailto:"):
            addr = addr[7:]
        v = validate_email(addr, check_deliverability=False)
        local = v.local_part
        domain = v.domain.lower()
        normalized = f"{local}@{domain}".lower()
        return local, domain, normalized
    except EmailNotValidError as e:
        raise ValueError(str(e))


def normalize_url(url: str) -> Tuple[str, str, str, Optional[str], str]:
    """Return (normalized_url, scheme, host, registrable_domain, sha256). Raises ValueError if invalid.

    Robustness improvements:
    - Trim surrounding whitespace
    - Assume http scheme if missing
    - Lowercase scheme/host
    - Strip default ports, remove fragment, keep query
    """
    url = (url or "").strip()
    if not url:
        raise ValueError("URL cannot be empty")
    parsed = urlparse(url)
    if not parsed.scheme:
        # Assume http if scheme is missing
        parsed = urlparse(f"http://{url}")
    if not parsed.scheme or not parsed.netloc:
        raise ValueError("URL must include scheme and host")
    scheme = parsed.scheme.lower()
    host = parsed.hostname.lower() if parsed.hostname else ""

    # Normalize: lowercase scheme/host, strip default ports, remove fragment, keep query
    netloc = host
    if parsed.port:
        default_port = (scheme == "http" and parsed.port == 80) or (scheme == "https" and parsed.port == 443)
        if not default_port:
            netloc = f"{host}:{parsed.port}"
    normalized = urlunparse((scheme, netloc, parsed.path or "/", "", parsed.query, ""))

    ext = tldextract.extract(host)
    registrable = f"{ext.domain}.{ext.suffix}" if ext.suffix else ext.domain

    sha256 = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
    return normalized, scheme, host, registrable, sha256
