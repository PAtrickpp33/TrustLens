import { useState, useCallback, useMemo } from "react";
import { Card, Tabs, Input, Button, Typography } from "antd";
import { Shield, Globe, Mail, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import RiskNotesCard from "@/components/ui/riskNotesCard";
import { scamcheckEmail, scamcheckUrl } from "@/lib/api";
import type { UrlRiskData, EmailRiskData } from "@/lib/api";

import "./Hero.css";

type Tab = "url" | "email";

// ----- keep both named and default export to avoid import errors elsewhere
export function Hero() {
  const [activeTab, setActiveTab] = useState<Tab>("url");
  const navigate = useNavigate();

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
      // friendly placeholder on backend error
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

  // ----- Report CTA
  const hasResult = activeTab === "url" ? !!urlRes : !!emailRes;

  const prefillValue =
    activeTab === "url"
      ? (urlRes?.url ?? urlInput).trim()
      : (emailRes?.address ?? emailInput).trim();

  const goReport = () => {
    if (!hasResult || !prefillValue) return;
    navigate(
      `/report?type=${encodeURIComponent(activeTab)}&value=${encodeURIComponent(
        prefillValue
      )}#report-form`
    );
  };

  const ReportCTA = () => (
    <div className="report-cta mt-4 border border-slate-200 bg-white shadow-sm">
      <p className="report-cta__lead">
        Think this looks suspicious? Report it anonymously to help protect others.
      </p>
      <Button
        type="primary"
        size="large"
        onClick={goReport}
        disabled={!hasResult}
        className="w-full font-semibold"
        style={{ height: 56, borderRadius: 12, background: "#111827" }}
        icon={<Shield size={18} />}
      >
        Report this
      </Button>
      <p className="report-cta__foot">
        We use anonymous summaries for statistics. No account required.
      </p>
    </div>
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
            Protect yourself online by checking links, messages, or emails for potential scams.
            Get a trusted AI-driven safety report in seconds.
          </Typography.Paragraph>
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

                      {urlRes && (
                        <RiskNotesCard
                          kind="url"
                          data={urlRes}
                          showReportButton={false} // hide legacy inline report button
                        />
                      )}

                      {hasResult && activeTab === "url" && <ReportCTA />}
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

                      {emailRes && (
                        <RiskNotesCard
                          kind="email"
                          data={emailRes}
                          showReportButton={false}
                        />
                      )}

                      {hasResult && activeTab === "email" && <ReportCTA />}
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
