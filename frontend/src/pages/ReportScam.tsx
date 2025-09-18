import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { reportUrl, reportEmail, reportMobile } from "@/lib/api";


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

export default function ReportScam() {
  const [params] = useSearchParams();
  const initialType = (params.get("type") ?? "url") as "url" | "email" | "sms" | "phone";
  const initialValue = params.get("value") ?? "";

  const [type, setType] = useState(initialType);
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    setType((params.get("type") ?? "url") as any);
    setValue(params.get("value") ?? "");
  }, [params]);

  const validate = () => {
    if (type === "url") {
      try {
        const u = new URL(value);
        if (!/^https?:/.test(u.protocol)) throw new Error("Invalid protocol");
        return null;
      } catch {
        return "Please enter a valid URL that starts with https://";
      }
    }
    if (type === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
      return null;
    }
    if (type === "phone" || type === "sms") {
      if (!value.trim()) return "Please enter a valid number/message";
      return null;
    }
    return null;
  };

  const submit = async () => {
  setErr(null);
  setOk(null);

  const v = validate();
  if (v) { setErr(v); return; }

  setLoading(true);
  try {
    if (type === "url") {
      await reportUrl(value);
    } else if (type === "email") {
      await reportEmail(value);
    } else {
      await reportMobile({ e164: value });
    }

    setOk("Thanks! Your report was added to our moderation queue.");

    const ref = encodeURIComponent(`${type}:${value}`.slice(0, 40));
    setTimeout(() => nav(`/report/success?ref=${ref}`), 650);

  } catch (e: any) {
    setErr(e?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};


  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
  };

  /* ------- UI ------- */
  return (
    <main style={{ background: "#f8fafc" }}>
      {/* HERO */}
      <div
        style={{
          padding: "64px 20px 36px",
          background: "linear-gradient(90deg, rgba(37,99,235,.12), rgba(6,182,212,.12))",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
          <p style={{ marginTop: 6, color: COLORS.sub, maxWidth: 720 }}>
            Submit a suspicious link, email or number. We run a quick safety check before adding it to the moderation queue.
          </p>
        </div>
      </div>

      {/* CARD */}
      <section style={{ maxWidth: 1100, margin: "18px auto 56px", padding: "0 20px" }}>
        {/* Messages */}
        {ok && (
          <div
            role="status"
            style={{
              margin: "12px 0",
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(5,150,105,.08)",
              border: "1px solid rgba(5,150,105,.25)",
              color: COLORS.success,
              fontWeight: 600,
            }}
          >
            {ok}
          </div>
        )}
        {err && (
          <div
            role="alert"
            style={{
              margin: "12px 0",
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(220,38,38,.08)",
              border: "1px solid rgba(220,38,38,.25)",
              color: COLORS.danger,
              fontWeight: 600,
            }}
          >
            {err}
          </div>
        )}

        <div
          style={{
            background: COLORS.panel,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 14px 40px rgba(2,6,23,.06)",
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* input wrapper */}
            <div
              style={{
                position: "relative",
                flex: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #e0e7ff, #f5d0fe)",
                  boxShadow: "inset 0 0 0 5px #eef2ff",
                  color: COLORS.brandA,
                  fontWeight: 700,
                }}
              >
                🔗
              </span>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKey}
                placeholder={
                  type === "email"
                    ? "name@example.com"
                    : type === "phone"
                    ? "+61412345678"
                    : "https://example.com/login"
                }
                inputMode={type === "url" ? "url" : "text"}
                autoComplete="off"
                aria-label="Suspicious value"
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 52px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  outline: "none",
                  fontSize: 15,
                }}
              />
            </div>

            <button
              onClick={submit}
              disabled={loading}
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                border: `1px solid ${COLORS.dark}`,
                background: COLORS.dark,
                color: "#fff",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 6px 14px rgba(17,24,39,.18)",
                minWidth: 104,
              }}
            >
              {loading ? "Sending…" : "Report"}
            </button>
          </div>

          <div style={{ marginTop: 8, color: "#64748b", fontSize: 13 }}>
            We don’t store personal data. Reports help improve ScamCheck for everyone.
          </div>
        </div>
      </section>
    </main>
  );
}

function Hint({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{title}</div>
      <div style={{ color: "#475569", fontSize: 14 }}>{body}</div>
    </div>
  );
}
