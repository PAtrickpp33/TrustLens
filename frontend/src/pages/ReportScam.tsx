// pages/ReportScam.tsx  (یا هر فایلی که صفحه Report شماست)
import { useEffect, useMemo, useState, useCallback } from "react";
import { Segmented, Input, Button, Collapse, Alert } from "antd";
import { Globe, Mail, ShieldCheck } from "lucide-react";
import "./ReportScam.css";

/* ------------------------------------------------------------------ */
/* Local daily throttle store                                          */
/* ------------------------------------------------------------------ */

const LS_KEY = "TL_REPORTS_V1"; // map: key -> YYYY-MM-DD

type ReportStore = Record<string, string>;
type Kind = "email" | "url";

const todayStr = () => new Date().toISOString().slice(0, 10);

function loadStore(): ReportStore {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveStore(store: ReportStore) {
  localStorage.setItem(LS_KEY, JSON.stringify(store));
}

/** normalize value to create a stable key per day */
function canonicalize(value: string, kind: Kind): string {
  let v = value.trim().toLowerCase();
  if (kind === "url") {
    try {
      const raw = v.startsWith("http") ? v : `https://${v}`;
      const u = new URL(raw);
      const host = u.hostname.replace(/^www\./, "");
      const path = u.pathname.replace(/\/+$/, "");
      v = `${host}${path || ""}${u.search ? u.search : ""}`;
    } catch {
      // leave as-is if URL parsing fails
    }
  }
  return `${kind}:${v}`;
}
function isReportedToday(value: string, kind: Kind) {
  const store = loadStore();
  const key = canonicalize(value, kind);
  return store[key] === todayStr();
}
function markReportedToday(value: string, kind: Kind) {
  const store = loadStore();
  const key = canonicalize(value, kind);
  store[key] = todayStr();
  saveStore(store);
  return key;
}

/* ------------------------------------------------------------------ */

export default function ReportScam() {
  const [kind, setKind] = useState<Kind>("email");
  const [value, setValue] = useState("");
  const [alreadyToday, setAlreadyToday] = useState(false);
  const [banner, setBanner] = useState<null | "thanks" | "already">(null);
  const [submitting, setSubmitting] = useState(false);

  // prefill from query ?type=&value=
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const t = sp.get("type");
    const v = sp.get("value");
    if ((t === "email" || t === "url") && v) {
      setKind(t);
      setValue(v);
      if (isReportedToday(v, t)) {
        setAlreadyToday(true);
        setBanner("already");
      }
    }
  }, []);

  // when user edits value, clear "already" state
  useEffect(() => {
    setAlreadyToday(false);
    setBanner(null);
  }, [kind, value]);

  const canSubmit = useMemo(
    () => !!value.trim() && !alreadyToday && !submitting,
    [value, alreadyToday, submitting]
  );

  const handleSubmit = useCallback(async () => {
    if (!value.trim()) return;

    setSubmitting(true);
    try {
      // اگر بک‌اند دارید، اینجا کال کنید:
      // await api.createReport({ type: kind, value });

      // Throttle محلی یک‌روزه
      markReportedToday(value, kind);
      setAlreadyToday(true);
      setBanner("thanks");
    } catch (e) {
      // خطاهای احتمالی بک‌اند
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }, [value, kind]);

  const items = [
    {
      key: "how",
      label: <span className="collapse-title">How we use your report</span>,
      children: (
        <p className="collapse-body">
          We don’t keep the exact value you submit. We derive a non-reversible fingerprint
          to build community statistics and early-warning signals. To reduce noise,
          duplicate reports from this browser are ignored for a day.
        </p>
      ),
    },
  ];

  return (
    <section className="report-root">
      <div className="report-hero">
        <span className="report-pill">Community safety</span>
        <h1 className="report-title">Report a Scam</h1>
        <p className="report-sub">
          Tap <b>Report</b> to send an <b>anonymous signal</b>. We use it to improve detection and share
          community trends. Your personal data isn’t stored permanently.
        </p>
      </div>

      {/* badges row (optional) */}

      {banner === "thanks" && (
        <Alert
          type="success"
          showIcon
          message="Thanks! Your report helps protect others."
          style={{ maxWidth: 980, margin: "12px auto" }}
        />
      )}
      {banner === "already" && (
        <Alert
          type="info"
          showIcon
          message="You already reported this today."
          style={{ maxWidth: 980, margin: "12px auto" }}
        />
      )}

      <div className="report-card">
        {/* selector */}
        <div className="report-type">
          <Segmented
            value={kind}
            onChange={(v) => setKind(v as Kind)}
            options={[
              {
                label: (
                  <span className="seg-item">
                    <Mail size={16} /> Email
                  </span>
                ),
                value: "email",
              },
              {
                label: (
                  <span className="seg-item">
                    <Globe size={16} /> URL
                  </span>
                ),
                value: "url",
              },
            ]}
          />
        </div>

        {/* form */}
        <div className="report-row">
          <label className="report-label">{kind === "email" ? "Email" : "URL"}</label>
          <Input
            size="large"
            className="report-input"
            placeholder={kind === "email" ? "name@example.com" : "https://example.com"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onPressEnter={() => canSubmit && handleSubmit()}
          />

          <Button
            size="large"
            className={`report-btn ${alreadyToday ? "is-disabled" : ""}`}
            disabled={!canSubmit}
            loading={submitting}
            onClick={handleSubmit}
            icon={<ShieldCheck size={18} />}
          >
            {alreadyToday ? "Already reported" : "Report"}
          </Button>
        </div>

        <Collapse items={items} className="report-collapse" bordered={false} />
      </div>
    </section>
  );
}
