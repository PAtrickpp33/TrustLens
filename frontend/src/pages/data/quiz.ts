// src/data/quiz.ts
export type QuizItem = {
  question: string;
  options: string[];
  correctIndex: number;
  rationale: string;
  sources: { label: string; url: string }[];
};

export const QUIZ: QuizItem[] = [
  /* ===================== JOB SCAMS ===================== */
  {
    question: "[Job] A job ad offers $90/hr for entry-level work from home. They ask to chat on Telegram to ‘fast-track’. Safe or risky?",
    options: ["Safe — modern hiring uses chat apps", "Risky — off-platform chat is a red flag", "Safe — pay rate proves it’s legit", "Risky — but only if they ask for your TFN"],
    correctIndex: 1,
    rationale: "Legit employers start via email/official portals. Pushing to encrypted chat early is a classic evasion tactic.",
    sources: [{ label: "Scamwatch — Job scams", url: "https://www.scamwatch.gov.au/types-of-scams/jobs-employment" }],
  },
  {
    question: "[Job] You’re asked to pay an $80 ‘onboarding fee’ to activate a work portal. Legit?",
    options: ["Yes — standard industry fee", "No — upfront payment = scam", "Only legit for remote roles", "Legit if refundable"],
    correctIndex: 1,
    rationale: "Real employers do not charge candidates to start work or access systems.",
    sources: [{ label: "Scamwatch — Upfront payment", url: "https://www.scamwatch.gov.au" }],
  },
  {
    question: "[Job] Recruiter requests a copy of your passport ‘to verify identity’ before an interview. Best approach?",
    options: ["Send it immediately", "Watermark a copy + confirm via official channel", "Decline all ID checks", "Only send Medicare card"],
    correctIndex: 1,
    rationale: "Confirm the request via official contact and watermark copies with purpose/date to reduce misuse.",
    sources: [{ label: "OAIC — Protecting your identity", url: "https://www.oaic.gov.au/privacy/your-privacy-rights/protecting-your-identity" }],
  },
  {
    question: "[Job] They ask for bank details to ‘pre-set payroll’ before an offer letter. Best response?",
    options: ["Provide details to speed things up", "Wait until a signed contract in the HR portal", "Send a photo of your card only", "Give BSB only"],
    correctIndex: 1,
    rationale: "Only provide payroll info after a formal offer, via verified HR systems.",
    sources: [{ label: "Services Australia — Scams", url: "https://www.servicesaustralia.gov.au/scams" }],
  },
  {
    question: "[Job] They ‘hire’ you without an interview if you buy gift cards to ‘test procurement’. What now?",
    options: ["It’s a common test", "It’s a well-known scam tactic", "Fine if they reimburse tomorrow", "Legit for finance roles"],
    correctIndex: 1,
    rationale: "Gift cards are widely used by scammers; not a legitimate hiring step.",
    sources: [{ label: "Scamwatch — Gift card scams", url: "https://www.scamwatch.gov.au" }],
  },

  /* ===================== EMAIL / PHISHING ===================== */
  {
    question: "[Email] careers@micr0soft-careers.com invites you to interview. What’s the strongest red flag?",
    options: ["Uses ‘careers’ in the address", "Misspelt brand/typosquatting domain", "No logo in signature", "Email is short"],
    correctIndex: 1,
    rationale: "Look-alike domains (e.g., micr0soft) are classic phishing technique.",
    sources: [{ label: "ACSC — Phishing", url: "https://www.cyber.gov.au/online-security/online-scams/phishing" }],
  },
  {
    question: "[Email] An unexpected email has a .zip ‘skills test’. What’s the safest action?",
    options: ["Open it and scan later", "Ask for a test via a known platform (e.g., HackerRank)", "Disable antivirus then open", "Forward to friends to check"],
    correctIndex: 1,
    rationale: "Archives can hide malware. Use recognised testing platforms or official portals.",
    sources: [{ label: "ACSC — Malware", url: "https://www.cyber.gov.au" }],
  },
  {
    question: "[Email] A public Google Form asks for TFN + full DOB to ‘pre-register’. Best response?",
    options: ["Submit quickly to hold the spot", "Ask for a secure HR portal", "Send via SMS instead", "Email a PDF"],
    correctIndex: 1,
    rationale: "Sensitive data must go through secure, verified HR systems — not public forms.",
    sources: [{ label: "ATO — Protect your TFN", url: "https://www.ato.gov.au/general/online-services/identity-security" }],
  },
  {
    question: "[Email] The sender name looks right, but the actual email is random@gmail.com. What’s this called?",
    options: ["DMARC alignment", "Display-name spoofing", "SPF pass", "BCC masking"],
    correctIndex: 1,
    rationale: "Attackers spoof the display name to look official; always check the real address domain.",
    sources: [{ label: "ACSC — Email security", url: "https://www.cyber.gov.au" }],
  },

  /* ===================== SMS / PHONE ===================== */
  {
    question: "[SMS] “We saw your resume — tap to verify identity” with a short link. Risk level?",
    options: ["Low — SMS is secure", "Medium — OK if phone shows company name", "High — short links hide risky domains", "None if on 4G"],
    correctIndex: 2,
    rationale: "Short links hide destinations; treat unsolicited identity links as high risk.",
    sources: [{ label: "Scamwatch — Phishing texts", url: "https://www.scamwatch.gov.au" }],
  },
  {
    question: "[Phone] Caller says they’re from the ATO and you must pay an overdue tax by gift cards today. What’s true?",
    options: ["Legit — urgent tax debts use gift cards", "Scam — ATO will not demand gift cards", "Only legit near EOFY", "Legit if they have your address"],
    correctIndex: 1,
    rationale: "Authorities do not take payment by gift cards or pressure immediate payment by phone.",
    sources: [{ label: "ATO — Scams", url: "https://www.ato.gov.au/general/online-services/identity-security" }],
  },
  {
    question: "[Phone] You get a missed call from an overseas number you don’t recognise. What should you do?",
    options: ["Call back immediately", "Search the number first / ignore if unknown", "Text them your name", "Save to contacts"],
    correctIndex: 1,
    rationale: "Wangiri (‘one-ring’) scams lure callbacks to premium numbers; don’t return unknown calls.",
    sources: [{ label: "ACCC — Phone scams", url: "https://www.scamwatch.gov.au" }],
  },

  /* ===================== URL SAFETY ===================== */
  {
    question: "[URL] Which link is likely the safest?",
    options: [
      "http://my-company-careers.secure-login.cc",
      "https://careers.mycompany.com/apply",
      "https://mycompany-careers.com.app-track.io",
      "http://careers-mycompany.org"
    ],
    correctIndex: 1,
    rationale: "Prefer HTTPS on the brand’s primary domain/subpath. Extra words/extra domains are suspect.",
    sources: [{ label: "ACSC — Check URLs", url: "https://www.cyber.gov.au" }],
  },
  {
    question: "[URL] The padlock icon (HTTPS) guarantees the site is safe. True or false?",
    options: ["True — padlock means trusted", "False — it only means the connection is encrypted"],
    correctIndex: 1,
    rationale: "HTTPS protects transport, not legitimacy. Phishing sites can also use HTTPS.",
    sources: [{ label: "ACSC — TLS/HTTPS basics", url: "https://www.cyber.gov.au" }],
  },
  {
    question: "[URL] You see login.mybank.com.security-verify.co. The risky element is…",
    options: ["‘login’ subdomain", "‘security-verify.co’ primary domain", "HTTPS", "‘mybank’ word"],
    correctIndex: 1,
    rationale: "Attackers place real brand words on the left; the actual registered domain is the rightmost known domain and its TLD.",
    sources: [{ label: "ACSC — Spot fake sites", url: "https://www.cyber.gov.au" }],
  },

  /* ===================== MARKETPLACE / SOCIAL ===================== */
  {
    question: "[Marketplace] A buyer on FB Marketplace overpays and asks you to ‘refund the difference’. What now?",
    options: ["Refund immediately — be polite", "Wait for funds to fully clear in your bank", "Trust a screenshot of ‘payment sent’", "Ship first; refund later"],
    correctIndex: 1,
    rationale: "Overpayment/refund scams exploit reversible payments; wait for cleared funds in your account.",
    sources: [{ label: "Scamwatch — Buying & selling", url: "https://www.scamwatch.gov.au" }],
  },
  {
    question: "[Social] A friend’s account messages you about a ‘grant’ and asks for your ID and a fee. What’s most likely?",
    options: ["They found a great opportunity", "Their account was compromised", "It’s a sponsored ad", "They typed the wrong person"],
    correctIndex: 1,
    rationale: "Compromised accounts push fake grants. Verify with a separate channel (call/text).",
    sources: [{ label: "ACSC — Social media security", url: "https://www.cyber.gov.au" }],
  },

  /* ===================== INVESTMENT / CRYPTO ===================== */
  {
    question: "[Investment] You’re promised 20% weekly returns if you deposit to a crypto wallet. What’s true?",
    options: ["Fine for short periods", "Very likely a scam — guaranteed high returns", "Safe if they share a ‘certificate’", "Safe if other ‘investors’ DM you"],
    correctIndex: 1,
    rationale: "Guaranteed high/fast returns are a hallmark of investment scams.",
    sources: [{ label: "Scamwatch — Investment scams", url: "https://www.scamwatch.gov.au/types-of-scams/investment-scams" }],
  },
  {
    question: "[Investment] A site shows testimonials and live profit widgets. What’s a good check?",
    options: ["Trust testimonials", "Reverse-image-search profile photos", "Deposit a small ‘test’ amount", "Ask them for a Zoom call"],
    correctIndex: 1,
    rationale: "Fake testimonials are common; reverse image search often reveals stolen photos/stock images.",
    sources: [{ label: "ACCC — Check before you invest", url: "https://www.scamwatch.gov.au" }],
  },

  /* ===================== DELIVERY / IMPERSONATION ===================== */
  {
    question: "[Delivery] You get a text from ‘AUSPOST’ asking a $3 re-delivery fee via a short link. Best action?",
    options: ["Pay to avoid return", "Open link and check tracking", "Ignore; use official AusPost app/website", "Reply STOP"],
    correctIndex: 2,
    rationale: "Delivery scams use small fees + short links. Check through the official app/website instead.",
    sources: [{ label: "Scamwatch — Delivery scams", url: "https://www.scamwatch.gov.au" }],
  },
  {
    question: "[Impersonation] An email appears from your uni asking for your password to ‘unlock storage’. What should you do?",
    options: ["Reply with your password quickly", "Click and sign in", "Report phishing + verify via the uni portal", "Ignore all uni emails"],
    correctIndex: 2,
    rationale: "Universities do not ask for passwords by email. Report and use the official portal to verify.",
    sources: [{ label: "ACSC — Phishing", url: "https://www.cyber.gov.au/online-security/online-scams/phishing" }],
  },

  /* ===================== INVOICE / BUSINESS EMAIL COMPROMISE ===================== */
  {
    question: "[Invoice] A supplier emails a new bank account for payment. What’s the safest step?",
    options: ["Pay right away to avoid late fees", "Call the supplier using a known number to confirm", "Reply to the same email to confirm", "Split payment across both accounts"],
    correctIndex: 1,
    rationale: "Invoice fraud is common. Confirm bank changes via a known, independent contact method.",
    sources: [{ label: "ACSC — BEC/Invoice fraud", url: "https://www.cyber.gov.au" }],
  },
  {
    question: "[Invoice] The email domain matches the supplier, but DKIM/DMARC fail in headers. What does that suggest?",
    options: ["Authenticated email", "Potential spoofing/compromise", "Safe if signed ‘Kind regards’", "Always spam"],
    correctIndex: 1,
    rationale: "Failed email authentication can indicate spoofing or account compromise.",
    sources: [{ label: "ACSC — Email authentication", url: "https://www.cyber.gov.au" }],
  },

  /* ===================== GENERAL HYGIENE ===================== */
  {
    question: "[Hygiene] What’s the best way to store your passwords?",
    options: ["Reuse a strong one everywhere", "Use a password manager + unique passwords", "Keep them in Notes app", "Email them to yourself"],
    correctIndex: 1,
    rationale: "Password managers + unique passwords reduce blast radius of any single breach.",
    sources: [{ label: "ACSC — Passphrases & managers", url: "https://www.cyber.gov.au" }],
  },
  {
    question: "[Hygiene] Multi-factor authentication (MFA) is…",
    options: ["Optional and mostly annoying", "Critical — it blocks many account-takeovers", "Only for banks", "Less secure than SMS only"],
    correctIndex: 1,
    rationale: "MFA thwarts most credential-based attacks; use app-based or hardware keys where possible.",
    sources: [{ label: "ACSC — MFA", url: "https://www.cyber.gov.au" }],
  },
  {
    question: "[Hygiene] You clicked a suspicious link by mistake. Best immediate action?",
    options: ["Ignore it", "Change your Wi-Fi", "Disconnect, run AV scan, change relevant passwords, enable MFA, monitor accounts", "Factory reset phone instantly"],
    correctIndex: 2,
    rationale: "Contain the risk, scan, rotate credentials, and enable MFA. Monitor for unusual activity.",
    sources: [{ label: "ACSC — If you’ve been scammed", url: "https://www.cyber.gov.au" }],
  },

  /* ===================== ADVANCED RED FLAGS ===================== */
  {
    question: "[Advanced] An email passes SPF but fails DKIM/DMARC. Which is most accurate?",
    options: ["Fully trusted mail", "Partially authenticated; treat with caution", "Means encryption is on", "Harmless header detail"],
    correctIndex: 1,
    rationale: "Mixed/failed auth signals mean the message might be spoofed/forwarded; verify via another channel.",
    sources: [{ label: "ACSC — Email auth basics", url: "https://www.cyber.gov.au" }],
  },
  {
    question: "[Advanced] A site uses an internationalised domain: paypa\u200bl.com (looks like paypal.com). What’s the issue?",
    options: ["Harmless hyphen", "IDN/Unicode look-alike (homograph) risk", "It’s a test site", "HTTPS blocks this"],
    correctIndex: 1,
    rationale: "Homograph attacks use visually similar characters to impersonate trusted domains.",
    sources: [{ label: "ACSC — Homograph attacks", url: "https://www.cyber.gov.au" }],
  }
];