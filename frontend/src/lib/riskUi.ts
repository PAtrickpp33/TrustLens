// Visual/wording presets for each entity type and risk level.
export type RiskLevel = 0 | 1 | 2 | 3;
export type RiskKind = "url" | "email" | "mobile";

export type RiskVisual = {
  label: string;         // short status text
  badge: string;         // bg/text classes for a pill
  border: string;        // border color class
  text: string;          // main text color class
  dot: string;           // small dot color class
  note: string;          // one-sentence explanation
  tips: string[];        // quick follow-up actions
};

// shared palette helpers
const palette = {
  gray:  { badge: "bg-gray-100 text-gray-800",  border: "border-gray-300",  text: "text-gray-800",  dot: "bg-gray-400" },
  green: { badge: "bg-green-100 text-green-900", border: "border-green-300", text: "text-green-900", dot: "bg-green-500" },
  amber: { badge: "bg-amber-100 text-amber-900", border: "border-amber-300", text: "text-amber-900", dot: "bg-amber-500" },
  red:   { badge: "bg-red-100 text-red-900",     border: "border-red-300",   text: "text-red-900",   dot: "bg-red-500" },
};

// -------- URL --------
export const URL_RISK_UI: Record<RiskLevel, RiskVisual> = {
  0: {
    label: "Unknown",
    ...palette.gray,
    note: "We couldn't match this exact URL in our database. Proceed carefully.",
    tips: [
      "Check for HTTPS and a valid padlock.",
      "Verify the domain spelling and company details.",
      "Avoid sensitive info unless you fully trust it.",
    ],
  },
  1: {
    label: "Safe",
    ...palette.green,
    note: "No suspicious signals found for this URL based on our checks.",
    tips: [
      "Keep browser and OS updated.",
      "Use a password manager + MFA.",
      "Stay alert for unusual pop-ups or redirects.",
    ],
  },
  2: {
    label: "Moderately Risky",
    ...palette.amber,
    note: "Some signals suggest caution (e.g., low reputation, recent domain).",
    tips: [
      "Avoid logging in or payments.",
      "Validate via independent sources.",
      "Consider visiting in a sandbox/VM.",
    ],
  },
  3: {
    label: "Unsafe",
    ...palette.red,
    note: "Strong indicators of phishing/malicious behavior detected.",
    tips: [
      "Do not enter credentials or payment info.",
      "Close the page if opened.",
      "Report the site to relevant providers.",
    ],
  },
};

// -------- EMAIL --------
export const EMAIL_RISK_UI: Record<RiskLevel, RiskVisual> = {
  0: {
    label: "Unknown",
    ...palette.gray,
    note: "We don't have enough history for this address.",
    tips: [
      "Be wary of attachments/links.",
      "Verify the sender via another channel.",
      "Check the domain spelling and reply-to.",
    ],
  },
  1: {
    label: "Likely Legitimate",
    ...palette.green,
    note: "MX and reputation look normal for this address.",
    tips: [
      "Still verify unexpected requests.",
      "Enable spam/junk filters.",
      "Use MFA for accounts mentioned.",
    ],
  },
  2: {
    label: "Suspicious",
    ...palette.amber,
    note: "Signals like disposable domains or poor reputation detected.",
    tips: [
      "Do not click links—open sites directly.",
      "Request official documents via secure portals.",
      "Report as phishing if content seems off.",
    ],
  },
  3: {
    label: "Malicious",
    ...palette.red,
    note: "High-risk indicators (phishing or spoofing patterns).",
    tips: [
      "Do not reply or download attachments.",
      "Report and block the sender.",
      "Warn affected teammates/contacts.",
    ],
  },
};

// -------- MOBILE --------
export const MOBILE_RISK_UI: Record<RiskLevel, RiskVisual> = {
  0: {
    label: "Unknown",
    ...palette.gray,
    note: "No prior history for this number in our data.",
    tips: [
      "Let unknown calls go to voicemail.",
      "Search the number before calling back.",
      "Avoid sharing codes or personal info.",
    ],
  },
  1: {
    label: "Low Risk",
    ...palette.green,
    note: "No scam patterns associated with this number.",
    tips: [
      "Still avoid sharing one-time codes.",
      "Prefer official support numbers.",
      "Use call screening where available.",
    ],
  },
  2: {
    label: "Suspicious",
    ...palette.amber,
    note: "Patterns linked to spam or smishing were seen.",
    tips: [
      "Do not tap SMS links.",
      "Confirm requests via official channels.",
      "Block if behavior persists.",
    ],
  },
  3: {
    label: "High Risk",
    ...palette.red,
    note: "Strong signals of scam/spam activity from reports or patterns.",
    tips: [
      "Do not engage—block the number.",
      "Report to your carrier/regulator.",
      "Warn contacts if they might be targeted.",
    ],
  },
};

// helper to pick the right map
export function getRiskUi(kind: RiskKind, level: RiskLevel): RiskVisual {
  const maps = { url: URL_RISK_UI, email: EMAIL_RISK_UI, mobile: MOBILE_RISK_UI } as const;
  return maps[kind][level];
}
