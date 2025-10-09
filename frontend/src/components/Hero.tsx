import { useState, useCallback, useMemo } from "react";
import { Card, Tabs, Input, Button, Typography } from "antd";
import { Shield, Globe, Mail, Search } from "lucide-react";
import RiskNotesCard from "@/components/ui/riskNotesCard";
import { scamcheckEmail, scamcheckUrl } from "@/lib/api";
import type { UrlRiskData, EmailRiskData } from "@/lib/api";
import { UsageCounter } from "@/components/UsageCounter";
import "./Hero.css";

type Tab = "url" | "email";

/** Minimal inline privacy note (plain language + link). */
function PrivacyNoteInline() {
  return (
    <div
      className="hero-privacy-note"
      role="note"
      aria-label="Privacy notice"
      style={{ marginTop: 8, fontSize: 12, color: "#475569" }}
    >
      We don’t store your input. Checks run momentarily; only anonymous totals are kept.{" "}
      <a href="/about#governance-policy">Privacy & Governance</a>

    </div>
  );
}

export function Hero() {
  const [activeTab, setActiveTab] = useState<Tab>("url");

  // inputs
  const [urlInput, setUrlInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  // status
  const [loading, setLoading] = useState(false);

  // results
  const [urlRes, setUrlRes] = useState<UrlRiskData | null>(null);
  const [emailRes, setEmailRes] = useState<EmailRiskData | null>(null);

  const canSubmit = useMemo(() => {
    if (activeTab === "url") return !!urlInput.trim();
    if (activeTab === "email") return !!emailInput.trim();
    return false;
  }, [activeTab, urlInput, emailInput]);

  const handleCheck = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "url") {
        setEmailRes(null);
        const data = await scamcheckUrl(urlInput.trim());
        setUrlRes(data);
      } else {
        setUrlRes(null);
        const data = await scamcheckEmail(emailInput.trim());
        setEmailRes(data);
      }
    } catch {
      // Friendly fallbacks (don’t leak backend errors)
      if (activeTab === "url") {
        setEmailRes(null);
        const placeholder = {
          url: urlInput.trim(),
          risk_level: 0 as 0,
          phishing_flag: 0,
          report_count: 0,
          source: null,
          notes:
            "This URL is currently being analyzed by our AI model. Please try again shortly.",
        } satisfies UrlRiskData;
        setUrlRes(placeholder);
      } else {
        setUrlRes(null);
        const placeholder = {
          address: emailInput.trim(),
          risk_level: 0 as 0,
          mx_valid: 0,
          disposable: 0,
          report_count: 0,
          source: null,
          notes:
            "This email address is currently being analyzed by our AI model. Please try again shortly.",
        } satisfies EmailRiskData;
        setEmailRes(placeholder);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, urlInput, emailInput]);

  const onEnter = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && canSubmit && !loading) handleCheck();
    },
    [canSubmit, loading, handleCheck]
  );

  return (
    <section id="home" className="hero-root">
      {/* decorative blobs */}
      <div className="hero-blob hero-blob-a" />
      <div className="hero-blob hero-blob-b" />

      <div className="hero-container">
        <div className="hero-header">
          <div className="hero-badge">
            <Shield size={18} />
            <span>Security First</span>
          </div>

          <Typography.Title level={1} className="hero-title">
            Check for <span className="hero-title-accent">Malicious</span>
            <br /> Content Instantly
          </Typography.Title>

          <Typography.Paragraph className="hero-sub">
            Protect yourself online by checking URLs and email addresses
            for potential threats. Get instant security analysis with
            detailed explanations.
          </Typography.Paragraph>

          {/* Above-the-fold legitimacy signal (AC 11.1.1) */}
          <div className="hero-usage" style={{ marginTop: 8 }}>
            <UsageCounter />
          </div>
        </div>

        <div className="hero-card-wrap">
          <Card className="hero-card" bordered>
            <div className="hero-card-head">
              <Search size={18} />
              <span>Security Scanner</span>
            </div>
            <div className="hero-card-desc">
              Enter a URL or email address to check for security threats
            </div>

            <Tabs
              activeKey={activeTab}
              onChange={(k) => setActiveTab(k as Tab)}
              items={[
                {
                  key: "url",
                  label: (
                    <span className="hero-tab">
                      <Globe size={16} /> Website URL
                    </span>
                  ),
                  children: (
                    <div className="hero-pane">
                      <label className="hero-label" htmlFor="url-input">
                        Website URL
                      </label>
                      <Input
                        id="url-input"
                        size="large"
                        placeholder="'https://www.trustlens.me' or 'www.trustlens.me'"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={onEnter}
                      />

                      {/* Privacy note directly under the input (US 11.2.1) */}
                      <PrivacyNoteInline />

                      <Button
                        type="primary"
                        size="large"
                        className="hero-cta"
                        onClick={handleCheck}
                        disabled={!canSubmit || loading}
                        loading={loading}
                        icon={<Shield size={18} />}
                      >
                        Check Website Security
                      </Button>

                      {urlRes && <RiskNotesCard kind="url" data={urlRes} />}
                    </div>
                  ),
                },
                {
                  key: "email",
                  label: (
                    <span className="hero-tab">
                      <Mail size={16} /> Email
                    </span>
                  ),
                  children: (
                    <div className="hero-pane">
                      <label className="hero-label" htmlFor="email-input">
                        Email Address
                      </label>
                      <Input
                        id="email-input"
                        size="large"
                        placeholder="user@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={onEnter}
                      />

                      {/* Privacy note directly under the input (US 11.2.1) */}
                      <PrivacyNoteInline />

                      <Button
                        type="primary"
                        size="large"
                        className="hero-cta"
                        onClick={handleCheck}
                        disabled={!canSubmit || loading}
                        loading={loading}
                        icon={<Mail size={18} />}
                      >
                        Check Email Safety
                      </Button>

                      {emailRes && <RiskNotesCard kind="email" data={emailRes} />}
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      </div>
    </section>
  );
}

export default Hero;
