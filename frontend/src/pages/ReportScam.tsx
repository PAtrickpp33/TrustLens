import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { reportEmail, reportUrl } from "@/lib/api";

type Kind = "email" | "url";

const COLORS = {
  text: "#0f172a",
  sub: "#475569",
  border: "#e5e7eb",
  panel: "#ffffff",
  brandA: "#2563eb",
  brandB: "#06b6d4",
  danger: "#dc2626",
  success: "#059669",
  dark: "#111827",
};

function dailyKey(kind: Kind, raw: string) {
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const value = raw.trim().toLowerCase();
  return `report:${kind}:${value}:${day}`;
}

export default function ReportScam() {
  const [params] = useSearchParams();

  // Prefill from query
  const initialKind = (params.get("type") === "url" ? "url" : "email") as Kind;
  const prefill = params.get("value") ?? "";

  const [kind, setKind] = useState<Kind>(initialKind);
  const [value, setValue] = useState(prefill);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [reported, setReported] = useState(false);

  // Keep value in sync if the URL param changes
  useEffect(() => setValue(prefill), [prefill]);

  // “Already reported today?” derived flag
  const alreadyToday = useMemo(() => {
    const v = value.trim();
    if (!v) return false;
    return !!localStorage.getItem(dailyKey(kind, v));
  }, [kind, value]);

  // Reflect derived flag in local state (for button disabling)
  useEffect(() => setReported(alreadyToday), [alreadyToday]);

  // Reset messages on kind/value change
  useEffect(() => {
    setErr(null);
    setOk(null);
  }, [kind, value]);

  const validate = () => {
    const v = value.trim();
    if (!v) return "Please enter a value.";

    if (kind === "url") {
      try {
        const u = new URL(v);
        if (!/^https?:/i.test(u.protocol)) throw new Error();
      } catch {
        return "Please enter a valid URL that starts with https://";
      }
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!isEmail) return "Please enter a valid email address.";
    }
    return null;
  };

  const submit = async () => {
    setErr(null);
    setOk(null);
    if (kind === "url") {
      reportUrl(value)
    }
    else if (kind === "email") {
      reportEmail(value)
    }

    const problem = validate();
    if (problem) {
      setErr(problem);
      return;
    }

    if (reported) {
      setErr("This entry was already reported today.");
      return;
    }

    setLoading(true);
    try {
      localStorage.setItem(dailyKey(kind, value), "1");
      setReported(true); // immediately disable
      setOk("Thanks for your report! You’re helping us improve ScamCheck and keep the community safe.");
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !loading && !reported) submit();
  };

  return (
    <main style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* HERO */}
      <div
        style={{
          padding: "64px 20px 36px",
          background: "linear-gradient(90deg, rgba(37,99,235,.12), rgba(6,182,212,.12))",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.brandA,
              background: "rgba(37,99,235,.10)",
              border: "1px solid rgba(37,99,235,.18)",
              marginBottom: 8,
            }}
          >
            Community safety
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: COLORS.text,
            }}
          >
            Report a Scam
          </h1>

          <p style={{ marginTop: 6, color: COLORS.sub, maxWidth: 700, fontSize: 16, lineHeight: 1.6 }}>
            Help us improve online safety. Submitting suspicious {kind === "email" ? "emails" : "websites"} makes it
            easier to detect threats and protect the community from scams.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <section style={{ maxWidth: 800, margin: "24px auto", padding: "0 20px" }}>
        {/* Success */}
        {ok && (
          <div
            role="status"
            style={{
              margin: "12px 0",
              padding: "18px 20px",
              borderRadius: 14,
              background: "rgba(5,150,105,.08)",
              border: "1px solid rgba(5,150,105,.25)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.text, marginBottom: 4 }}>
              Thanks for your report!
            </div>
            <div style={{ color: COLORS.success, fontWeight: 600, fontSize: 15 }}>
              You’re helping us improve <strong>ScamCheck</strong> and keep the community safe.
            </div>
          </div>
        )}

        {/* Error */}
        {err && (
          <div
            role="alert"
            style={{
              margin: "12px 0",
              padding: "14px 16px",
              borderRadius: 12,
              background: "rgba(220,38,38,.08)",
              border: "1px solid rgba(220,38,38,.25)",
              color: COLORS.danger,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            {err}
          </div>
        )}

        {/* Card */}
        <div
          style={{
            background: COLORS.panel,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 18,
            padding: 22,
            boxShadow: "0 14px 40px rgba(2,6,23,.06)",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              disabled={loading || reported}
              style={{
                padding: "12px 14px",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                fontWeight: 600,
                background: "#fff",
              }}
            >
              <option value="email">Email</option>
              <option value="url">Website URL</option>
            </select>

            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={kind === "email" ? "name@example.com" : "https://example.com/login"}
              disabled={loading || reported}
              style={{
                flex: 1,
                padding: "14px",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                fontSize: 15,
              }}
            />

            <button
              onClick={submit}
              disabled={loading || reported}
              style={{
                padding: "12px 20px",
                borderRadius: 12,
                background: reported ? "#94a3b8" : COLORS.dark,
                border: "none",
                color: "#fff",
                fontWeight: 700,
                cursor: reported ? "not-allowed" : "pointer",
                boxShadow: "0 6px 14px rgba(17,24,39,.18)",
                minWidth: 170,
                fontSize: 15,
              }}
            >
              {reported ? "Already reported" : loading ? "Sending…" : "Report"}
            </button>
          </div>

          <div style={{ marginTop: 10, color: "#64748b", fontSize: 14, lineHeight: 1.55 }}>
            <strong>Note:</strong> We don’t store personal data on a server. Your reports are saved locally in this
            browser and duplicate submissions are blocked for today.
          </div>
        </div>
      </section>
    </main>
  );
}
