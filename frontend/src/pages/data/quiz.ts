// src/data/quiz.ts
export type QuizItem = {
  question: string;
  options: string[];
  correctIndex: number;
  rationale: string;
  sources: { label: string; url: string }[];
};

export const QUIZ: QuizItem[] = [
  {
    question: "A job ad offers $90/hr for entry-level work from home. They ask to chat on Telegram to ‘fast-track’. Safe or risky?",
    options: ["Safe — modern hiring uses chat apps", "Risky — off-platform chat is a red flag", "Safe — pay rate proves it’s legit", "Risky — but only if they ask for your TFN"],
    correctIndex: 1,
    rationale:
      "Legit employers keep comms on email/official systems and won’t force encrypted chat apps for hiring.",
    sources: [
      { label: "Scamwatch (Job scams)", url: "https://www.scamwatch.gov.au/types-of-scams/jobs-employment" }
    ],
  },
  {
    question: "You receive an email from careers@micr0soft-careers.com about an interview. What’s the riskiest sign?",
    options: ["Uses ‘careers’ in the address", "Misspelt brand in the domain", "No logo in signature", "It’s short"],
    correctIndex: 1,
    rationale: "Typosquatting domains (micr0soft) imitate brands and are commonly used in phishing.",
    sources: [
      { label: "ACSC — Phishing", url: "https://www.cyber.gov.au/online-security/online-scams/phishing" }
    ],
  },
  {
    question: "Recruiter requests a copy of your passport ‘to verify identity’ before an interview. What should you do?",
    options: ["Send it immediately", "Watermark a copy + confirm via official channel", "Decline all ID checks", "Only send Medicare card"],
    correctIndex: 1,
    rationale:
      "If ID is needed, confirm via an official company channel and watermark (purpose + date) to prevent misuse.",
    sources: [
      { label: "OAIC — ID security", url: "https://www.oaic.gov.au/privacy/your-privacy-rights/protecting-your-identity" }
    ],
  },
  {
    question: "An ‘onboarding fee’ of $80 is required to activate a work portal. Legit?",
    options: ["Yes — standard industry fee", "No — upfront payment = scam", "Only legit for remote roles", "Legit if refundable"],
    correctIndex: 1,
    rationale: "Legitimate employers do not ask candidates to pay to start work or access systems.",
    sources: [
      { label: "Scamwatch — Upfront payment", url: "https://www.scamwatch.gov.au" }
    ],
  },
  {
    question: "Which link is safest to click?",
    options: [
      "http://my-company-careers.secure-login.cc",
      "https://careers.mycompany.com/apply",
      "https://mycompany-careers.com.app-track.io",
      "http://careers-mycompany.org"
    ],
    correctIndex: 1,
    rationale:
      "Prefer official subpaths on the brand’s primary domain (mycompany.com). Extra words/domains are suspect.",
    sources: [
      { label: "ACSC — Check URLs", url: "https://www.cyber.gov.au" }
    ],
  },
  {
    question: "A recruiter sends a .zip attachment for a ‘skills test’. Safest action?",
    options: ["Open to check contents", "Ask for a link to a known platform (e.g., HackerRank)", "Disable antivirus then open", "Forward to friends"],
    correctIndex: 1,
    rationale:
      "Executable archives can deliver malware. Request a test via reputable platforms or company portal.",
    sources: [
      { label: "ACSC — Malware", url: "https://www.cyber.gov.au" }
    ],
  },
  {
    question: "They ask for your bank details to ‘pre-set payroll’ before an offer letter. Best response?",
    options: ["Provide details to speed things up", "Wait until a signed contract & HR portal", "Send a photo of your card only", "Give BSB only"],
    correctIndex: 1,
    rationale:
      "Provide payroll details only after a formal offer via verified HR systems.",
    sources: [
      { label: "Services Australia — Protect info", url: "https://www.servicesaustralia.gov.au/scams" }
    ],
  },
  {
    question: "SMS says: “We saw your resume — click to verify your identity” with a short link. What’s the risk?",
    options: ["Low — SMS is secure", "Medium — but OK if phone shows company name", "High — short links hide risky domains", "None if on 4G"],
    correctIndex: 2,
    rationale:
      "Unsolicited short links are high risk. Verify first via company website, not the link.",
    sources: [
      { label: "Scamwatch — Phishing texts", url: "https://www.scamwatch.gov.au" }
    ],
  },
  {
    question: "During a video ‘interview’, they ask to share your screen and open email. Red flag?",
    options: ["No — normal procedure", "Yes — potential credential theft", "Only red flag if on mobile", "Fine if on Zoom"],
    correctIndex: 1,
    rationale:
      "Screen-sharing email/credentials is not a standard interview practice and can expose accounts.",
    sources: [
      { label: "ACSC — Account security", url: "https://www.cyber.gov.au" }
    ],
  },
  {
    question: "You’re offered a job without an interview if you buy gift cards to ‘test procurement’. Legit?",
    options: ["Yes — common procurement test", "No — classic scam pattern", "Only legit for finance roles", "Legit if they reimburse next day"],
    correctIndex: 1,
    rationale:
      "Gift card purchases are a classic scam tactic, not a hiring step.",
    sources: [
      { label: "Scamwatch — Gift card scams", url: "https://www.scamwatch.gov.au" }
    ],
  },
  {
    question: "They ask for your TFN and full DOB using a public Google Form. Best action?",
    options: ["Submit quickly", "Ask for a secure HR portal", "Send via SMS instead", "Email a PDF"],
    correctIndex: 1,
    rationale:
      "Sensitive data should be collected via secure, verified HR systems, not public forms.",
    sources: [
      { label: "ATO — Protect your TFN", url: "https://www.ato.gov.au/general/online-services/identity-security" }
    ],
  },
  {
    question: "Which is the strongest early job-scam signal?",
    options: [
      "Unusually high pay + instant offer",
      "A long application form",
      "A phone call after 6pm",
      "They use Calendly"
    ],
    correctIndex: 0,
    rationale:
      "Too-good-to-be-true pay paired with pressure/instant offers is a high-confidence red flag.",
    sources: [
      { label: "Scamwatch — Job scams", url: "https://www.scamwatch.gov.au/types-of-scams/jobs-employment" }
    ],
  },
];