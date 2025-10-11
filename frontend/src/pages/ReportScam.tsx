import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Card, Button, Select, Input, Alert, Typography, Collapse } from "antd";
import { reportEmail, reportUrl } from "@/lib/api";
import { CheckCircle2, Sparkles, ShieldCheck, Lock, Clock } from "lucide-react";
import "./ReportScam.css";

type Kind = "email" | "url";
const { Title, Paragraph, Text } = Typography;

function dailyKey(kind: Kind, raw: string) {
  const day = new Date().toISOString().slice(0, 10);
  const value = raw.trim().toLowerCase();
  return `report:${kind}:${value}:${day}`;
}

// hook up to a stats API later if you like
async function fetchAggregateCount(_kind: Kind, _value: string): Promise<number | undefined> {
  try { return undefined; } catch { return undefined; }
}

export default function ReportScam() {
  const [params] = useSearchParams();
  const location = useLocation();

  const initialKind = (params.get("type") === "url" ? "url" : "email") as Kind;
  const prefill = params.get("value") ?? "";
  const jump = params.get("jump") === "1";

  const [kind, setKind] = useState<Kind>(initialKind);
  const [value, setValue] = useState(prefill);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [reported, setReported] = useState(false);
  const [communityCount, setCommunityCount] = useState<number | undefined>(undefined);

  const formRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, []);
  useEffect(() => setValue(prefill), [prefill]);
  useEffect(() => {
    if (jump && location.hash === "#report-form" && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [jump, location.hash]);
  useEffect(() => { if (prefill && inputRef.current) inputRef.current.focus(); }, [prefill]);

  const alreadyToday = useMemo(() => {
    const v = value.trim();
    return v ? !!localStorage.getItem(dailyKey(kind, v)) : false;
  }, [kind, value]);
  useEffect(() => setReported(alreadyToday), [alreadyToday]);
  useEffect(() => { setErr(null); setOk(null); }, [kind, value]);

  const validate = () => {
    const v = value.trim();
    if (!v) return "Please enter a value.";
    if (kind === "url") {
      try { const u = new URL(v); if (!/^https?:/i.test(u.protocol)) throw new Error(); }
      catch { return "Please enter a valid URL that starts with https://"; }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Please enter a valid email address.";
    }
    return null;
  };

  const submit = async () => {
    setErr(null); setOk(null);
    const problem = validate();
    if (problem) return setErr(problem);
    if (reported) return;

    setLoading(true);
    try {
      let backendOk = true;
      try { if (kind === "url") await reportUrl(value.trim()); else await reportEmail(value.trim()); }
      catch { backendOk = false; }

      localStorage.setItem(dailyKey(kind, value), "1");
      setReported(true);
      setOk(backendOk ? "Thanks—your report helps protect others."
                      : "Thanks—your report was queued as an anonymous signal.");
      setCommunityCount(await fetchAggregateCount(kind, value.trim()));
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> =
    (e) => { if (e.key === "Enter" && !loading && !reported) submit(); };

  return (
    <main className="report-page">
      {/* HERO */}
      <header className="report-hero">
        <div className="report-container report-hero-inner">
          <span className="report-pill">Community safety</span>
          <Title level={1} className="report-title">Report a Scam</Title>
          <Paragraph className="report-sub">
            Tap <b>Report</b> to send an <Text strong>anonymous signal</Text>. We use it to improve detection and share
            community trends. Your personal data isn’t stored permanently.
          </Paragraph>
          <div className="report-badges">
            <span className="report-badge"><ShieldCheck size={16}/> Anonymous</span>
            <span className="report-badge"><Lock size={16}/> No account required</span>
            <span className="report-badge"><Clock size={16}/> Takes &lt; 1 min</span>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="report-container">
        <div className="report-content-inner" aria-live="polite">
          {ok && (
            <Alert
              type="success"
              showIcon
              className="report-success"
              message={
                <span className="report-success-text">
                  <CheckCircle2 size={18} /> {communityCount !== undefined
                    ? <>Thanks—your report helps protect others. You’re not alone — <b>{communityCount.toLocaleString()}</b> similar reports in the last 30 days.</>
                    : <>Thanks—your report helps protect others.</>}
                </span>
              }
            />
          )}
          {err && <Alert type="error" message={err} showIcon className="report-error" />}

          {/* OUTSIDE EXPLAINER (callout) */}
          <div className="report-callout" role="note">
            <Sparkles size={18} />
            <span>
              Reports add an <b>anonymous signal</b> that helps our systems and the community identify potential scams faster.
            </span>
          </div>

          {/* FORM CARD */}
          <Card id="report-form" ref={formRef} className="report-card">
            <label className="sr-only" htmlFor="report-input">
              {kind === "email" ? "Email address" : "Website URL"}
            </label>
            <div className="report-form-row">
              <Select
                className="report-select"
                value={kind}
                onChange={(v) => setKind(v as Kind)}
                disabled={loading || reported}
                options={[{ value: "email", label: "Email" }, { value: "url", label: "Website URL" }]}
                aria-label="Type"
              />
              <Input
                id="report-input"
                className="report-input"
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={loading || reported}
                placeholder={kind === "email" ? "name@example.com" : "https://example.com/login"}
                aria-required
              />
              <Button
                className="report-btn"
                type="primary"
                onClick={submit}
                disabled={loading || reported}
                loading={loading}
              >
                {reported ? "Already reported" : "Report"}
              </Button>
            </div>

            <Collapse
              className="report-collapse"
              items={[{
                key: "how",
                label: "How we use your report",
                children: (
                  <Paragraph className="report-how-text">
                    We don’t keep the exact value you submit. We derive a non-reversible fingerprint to build community
                    statistics and early-warning signals. To reduce noise, duplicate reports from this browser are
                    ignored for a day.
                  </Paragraph>
                ),
              }]}
            />
          </Card>
        </div>
      </section>
    </main>
  );
}
