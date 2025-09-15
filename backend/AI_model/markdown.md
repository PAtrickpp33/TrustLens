# Trustlens URL Security API – Integration Guide

## 1. Service Information
- **Framework**: FastAPI (Python 3.11+)
- **Start command**:
  ```bash
  python -m uvicorn app:app --host 0.0.0.0 --port 8300 --reload
  ```
- **Base URL**:  
  - Development: http://localhost:8300  
  - Production: https://api.yourdomain.com  

> ⚠️ Do not expose `GEMINI_API_KEY` to the frontend. It must be configured as a backend environment variable.

---

## 2. Routes

### Health Check
- **GET** `/healthz`
- **Response example**:
  ```json
  {
    "status": "ok",
    "provider": "gemini",
    "model": "gemini-1.5-flash"
  }
  ```

---

### URL Scoring (local URLNet model)
- **POST** `/score`
- **Request body**:
  ```json
  {
    "url": "http://secure-login.paypaI.com.verify-accounts.xyz/login"
  }
  ```
- **Response body**:
  ```json
  {
    "url": "http://secure-login.paypaI.com.verify-accounts.xyz/login",
    "ascii_safe_url": "http://secure-login.paypai.com.verify-accounts.xyz/login",
    "score": 0.932,
    "risk_band": "HIGH"
  }
  ```

---

### URL Recommendation (scoring + Gemini advice)
- **POST** `/recommend`
- **Request body**:
  ```json
  {
    "url": "http://secure-login.paypaI.com.verify-accounts.xyz/login"
  }
  ```
- **Response body**:
  ```json
  {
    "url": "http://secure-login.paypaI.com.verify-accounts.xyz/login",
    "ascii_safe_url": "http://secure-login.paypai.com.verify-accounts.xyz/login",
    "score": 0.932,
    "risk_band": "HIGH",
    "llm": {
      "risk_band": "HIGH",
      "action": "block",
      "confidence_note": "Domain resembles PayPal with homoglyph attack.",
      "evidence": [
        "Homoglyph: paypaI.com (I instead of l)",
        "Suspicious TLD: .xyz",
        "Unusual multi-level subdomain"
      ],
      "recommended_next_steps": [
        "Block URL at gateway",
        "Alert security analyst"
      ],
      "user_safe_message": "This site looks malicious. Access blocked.",
      "notes_for_analyst": "Potential phishing campaign targeting PayPal users."
    }
  }
  ```

---

## 3. API Key Authentication (recommended)
Add to `.env`:
```
PUBLIC_API_KEY=xxxxxxx
```

FastAPI will require the `x-api-key` header. Example request:
```bash
curl -X POST "https://api.yourdomain.com/recommend" \
  -H "Content-Type: application/json" \
  -H "x-api-key: xxxxxxx" \
  -d '{"url":"http://secure-login.paypaI.com.verify-accounts.xyz/login"}'
```

---

## 4. Frontend Call Examples

### fetch
```js
async function checkUrl(u) {
  const res = await fetch("https://api.yourdomain.com/recommend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "xxxxxxx"
    },
    body: JSON.stringify({ url: u }),
  });
  return res.json();
}
```

### React + Axios
```ts
import axios from "axios";

export async function recommend(url: string) {
  const { data } = await axios.post(
    "https://api.yourdomain.com/recommend",
    { url },
    { headers: { "x-api-key": "xxxxxxx" } }
  );
  return data;
}
```

---

## 5. Deployment Notes
- **CORS**: configure allowed frontend domains in `.env`:
  ```
  CORS_ORIGINS=https://frontend.yourdomain.com,http://localhost:5173
  ```
- **Rate limiting**: recommended via gateway or `slowapi`.
- **Caching**: cache results for the same URL (Redis or in-memory) to reduce Gemini calls.
- **Internal routes**: `/__diag` and `/__reload` should be disabled or restricted in production.

---

## 6. Integration Checklist
- [ ] Confirm API base URL and port
- [ ] `GEMINI_API_KEY` configured in backend environment
- [ ] Frontend only calls `/score` and `/recommend`
- [ ] API Key validation enabled
- [ ] CORS configured for production frontend domain
- [ ] HTTPS enabled via gateway/Nginx/Cloudflare
- [ ] Rate limiting and caching enabled
- [ ] Internal routes not exposed to public

