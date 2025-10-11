import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Card, Button, Select, Input, Alert, Typography, Collapse } from "antd";
import type { InputRef } from "antd";
import { reportEmail, reportUrl } from "@/lib/api";

type Kind = "email" | "url";
const { Title, Paragraph, Text } = Typography;

function dailyKey(kind: Kind, raw: string) {
  const day = new Date().toISOString().slice(0, 10);
  const value = raw.trim().toLowerCase();
  return `report:${kind}:${value}:${day}`;
}

export default function ReportScam() {
  const [params] = useSearchParams();
  const location = useLocation();

  const initialKind = (params.get("type") === "url" ? "url" : "email") as Kind;
  const prefill = params.get("value") ?? "";

  const [kind, setKind] = useState<Kind>(initialKind);
  const [value, setValue] = useState(prefill);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [reported, setReported] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => setValue(prefill), [prefill]);

  // Smooth scroll to the form (account for sticky header)
  useEffect(() => {
    if (location.hash === "#report-form" && formRef.current) {
      // scrollMarginTop handles sticky navbar offset
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  useEffect(() => {
    if (prefill && inputRef.current) inputRef.current.focus();
  }, [prefill]);

  const alreadyToday = useMemo(() => {
    const v = value.trim();
    if (!v) return false;
    return !!localStorage.getItem(dailyKey(kind, v));
  }, [kind, value]);

  useEffect(() => setReported(alreadyToday), [alreadyToday]);
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

    const problem = validate();
    if (problem) return setErr(problem);

    if (reported) return setErr("This entry was already reported today.");

    setLoading(true);
    try {
      if (kind === "url") await reportUrl(value.trim());
      else await reportEmail(value.trim());

      localStorage.setItem(dailyKey(kind, value), "1");
      setReported(true);
      setOk("Thanks for your report! You’re helping to protect others.");
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
      {/* Hero */}
      <div
        style={{
          padding: "64px 20px 36px",
          background: "linear-gradient(90deg, rgba(37,99,235,.12), rgba(6,182,212,.12))",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <span
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              color: "#2563eb",
              background: "rgba(37,99,235,.10)",
              border: "1px solid rgba(37,99,235,.18)",
              marginBottom: 8,
            }}
          >
            Community safety
          </span>
          <Title level={1} style={{ margin: 0 }}>Report a Scam</Title>
          <Paragraph style={{ marginTop: 6, maxWidth: 720 }}>
            This form helps us detect threats faster. We use <Text strong>anonymous summaries</Text> for statistics;
            your personal data isn’t stored permanently.
          </Paragraph>
        </div>
      </div>

      {/* Form Card */}
      <section style={{ maxWidth: 960, margin: "24px auto", padding: "0 20px" }}>
        {ok && <Alert type="success" message={ok} showIcon style={{ marginBottom: 12 }} />}
        {err && <Alert type="error" message={err} showIcon style={{ marginBottom: 12 }} />}

        <Card
          id="report-form"
          ref={formRef}
          style={{
            borderRadius: 18,
            boxShadow: "0 14px 40px rgba(2,6,23,.06)",
            scrollMarginTop: 112, // anchor lands nicely below sticky header
          }}
          bodyStyle={{ padding: 20 }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Select
              value={kind}
              onChange={(v) => setKind(v as Kind)}
              disabled={loading || reported}
              style={{ width: 140 }}
              options={[
                { value: "email", label: "Email" },
                { value: "url", label: "Website URL" },
              ]}
            />
            <Input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading || reported}
              placeholder={kind === "email" ? "name@example.com" : "https://example.com/login"}
              style={{ height: 44 }}
            />
            <Button
              type="primary"
              onClick={submit}
              disabled={loading || reported}
              loading={loading}
              style={{ height: 44, minWidth: 160, borderRadius: 12, background: "#111827" }}
            >
              {reported ? "Already reported" : "Report"}
            </Button>
          </div>

          <Collapse
            style={{ marginTop: 10, borderRadius: 12 }}
            items={[
              {
                key: "how",
                label: "How we use your report",
                children: (
                  <Paragraph style={{ margin: 0 }}>
                    We don’t keep the exact value; we derive a non-reversible fingerprint to build community statistics.
                    Duplicate reports from this browser are blocked for the day.
                  </Paragraph>
                ),
              },
            ]}
          />
        </Card>
      </section>
    </main>
  );
}
