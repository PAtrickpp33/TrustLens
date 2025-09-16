import { useState, useCallback, useMemo } from "react";
import { Card, Tabs, Input, Button, Typography, Alert } from "antd";
import { Shield, Globe, Mail, Search } from "lucide-react";
import RiskCard from "./riskCard";
import LlmRecommendationCard from "@/components/ui/llmRecommendationCard";
import { checkEmail, llmRecommendUrl } from "@/lib/api";
import type { UrlRecommendResponse, EmailRiskData } from "@/lib/api";
import "./Hero.css";

type Tab = "url" | "email" ;

export function Hero() {
  const [activeTab, setActiveTab] = useState<Tab>("url");

  // inputs
  const [urlInput, setUrlInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  // status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // results
  const [urlRes, setUrlRes] = useState<UrlRecommendResponse | null>(null);
  const [emailRes, setEmailRes] = useState<EmailRiskData | null>(null);

  const canSubmit = useMemo(() => {
    if (activeTab === "url") return !!urlInput.trim();
    if (activeTab === "email") return !!emailInput.trim();
    return false;
  }, [activeTab, urlInput, emailInput]);

  const handleCheck = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      if (activeTab === "url") {
        setEmailRes(null);
        const data = await llmRecommendUrl(urlInput.trim());
        setUrlRes(data);
      } else if (activeTab === "email") {
        setUrlRes(null);
        const data = await checkEmail(emailInput.trim());
        setEmailRes(data);
      } 
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
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
            Protect yourself online by checking URLs, email addresses, and phone
            numbers for potential threats. Get instant security analysis with
            detailed explanations.
          </Typography.Paragraph>
        </div>

        <div className="hero-card-wrap">
          <Card className="hero-card" bordered>
            <div className="hero-card-head">
              <Search size={18} />
              <span>Security Scanner</span>
            </div>
            <div className="hero-card-desc">
              Enter a URL, email address, or phone number to check for security threats
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
                        placeholder="https://example.com"
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

                      {error && (
                        <Alert className="hero-alert" type="error" showIcon message={error} />
                      )}

                      {urlRes && <LlmRecommendationCard data={urlRes} />}
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

                      {error && activeTab === "email" && (
                        <Alert className="hero-alert" type="error" showIcon message={error} />
                      )}

                      {emailRes && <RiskCard kind="email" data={emailRes} />}
                    </div>
                  ),
                }
              ]}
            />
          </Card>
        </div>
      </div>
    </section>
  );
}

export default Hero;
