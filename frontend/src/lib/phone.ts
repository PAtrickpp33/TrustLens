// src/lib/phone.ts
export type ParsedAu = { country_code: string; national_number: string; e164: string };

// Richard: only covers AU phone numbers for now due to country code and national number requirement
// Richard: accepts (+61)410243321, +61123456789, and 61123456789
export function parseAuPhone(input: string): ParsedAu | null {
  // keep only digits and a single leading plus
  const cleaned = input
    .trim()
    .replace(/[^\d+]/g, "")
    .replace(/(?!^)\+/g, ""); // any plus not at start -> remove

  // AU: +61 followed by exactly 9 digits (NN)
  const m = cleaned.match(/^\+?61(?<nn>\d{9})$/);
  if (!m || !m.groups) return null;

  const national_number = m.groups.nn;
  const country_code = "+61";
  return { country_code, national_number, e164: `${country_code}${national_number}` };
}
