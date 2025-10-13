import React, { useState, useCallback, useMemo } from "react";
import { Card, Tabs, Input, Button, Typography, Upload, message } from "antd";
import {
  Shield,
  Globe,
  Mail,
  Search,
  MessageSquare,
  Upload as UploadIcon,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import RiskNotesCard from "@/components/ui/riskNotesCard";
import MarkdownReportCard from "@/components/ui/markdownReportCard";
import {
  scamcheckEmail,
  scamcheckUrl,
  analyzeTextContent,
  analyzeUploadedContent,
} from "@/lib/api";
import type {
  UrlRiskData,
  EmailRiskData,
  ContentAnalysisResponse,
} from "@/lib/api";

import "./Hero.css";

const { TextArea } = Input;
type Tab = "url" | "email" | "content";

export function Hero() {
  const [activeTab, setActiveTab] = useState<Tab>("url");
  const navigate = useNavigate();

  // inputs
  const [urlInput, setUrlInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [uploadMode, setUploadMode] = useState<"text" | "file">("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // status
  const [loading, setLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // results
  const [urlRes, setUrlRes] = useState<UrlRiskData | null>(null);
  const [emailRes, setEmailRes] = useState<EmailRiskData | null>(null);
  const [contentRes, setContentRes] = useState<ContentAnalysisResponse | null>(
    null
  );

  const canSubmit = useMemo(() => {
    if (activeTab === "url") return !!urlInput.trim();
    if (activeTab === "email") return !!emailInput.trim();
    if (activeTab === "content") {
      if (uploadMode === "text") return !!contentInput.trim();
      if (uploadMode === "file") return !!selectedFile;
    }
    return false;
  }, [activeTab, urlInput, emailInput, contentInput, uploadMode, selectedFile]);

  const handleCheck = useCallback(async () => {
    setLoading(true);
    setContentError(null);
    try {
      if (activeTab === "url") {
        setEmailRes(null);
        setContentRes(null);
        const data = await scamcheckUrl(urlInput.trim());
        setUrlRes(data);
      } else if (activeTab === "email") {
        setUrlRes(null);
        setContentRes(null);
        const data = await scamcheckEmail(emailInput.trim());
        setEmailRes(data);
      } else if (activeTab === "content") {
        setUrlRes(null);
        setEmailRes(null);
        if (uploadMode === "text") {
          const data = await analyzeTextContent(contentInput.trim());
          setContentRes(data);
        } else if (uploadMode === "file" && selectedFile) {
          const data = await analyzeUploadedContent(
            selectedFile,
            contentInput.trim() || undefined
          );
          setContentRes(data);
        }
      }
    } catch (error) {
      // Friendly placeholder on backend error
      if (activeTab === "url") {
        setEmailRes(null);
        setContentRes(null);
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
      } else if (activeTab === "email") {
        setUrlRes(null);
        setContentRes(null);
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
      } else if (activeTab === "content") {
        setUrlRes(null);
        setEmailRes(null);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Analysis failed. Please try again.";
        setContentError(errorMessage);
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    urlInput,
    emailInput,
    contentInput,
    uploadMode,
    selectedFile,
  ]);

  const onEnter = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && canSubmit && !loading) handleCheck();
    },
    [canSubmit, loading, handleCheck]
  );

  // file upload handlers
  const handleFileChange = useCallback((file: File) => {
    const isValidType =
      file.type === "image/jpeg" ||
      file.type === "image/jpg" ||
      file.type === "image/png" ||
      file.type === "application/pdf";
    if (!isValidType) {
      message.error("Only JPEG, PNG, and PDF files are supported");
      return false;
    }

    const maxSize =
      file.type === "application/pdf" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      message.error(`File size must be under ${maxSizeMB}MB`);
      return false;
    }
    setSelectedFile(file);
    setContentRes(null);
    setContentError(null);
    return false; // prevent automatic upload
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setContentRes(null);
    setContentError(null);
  }, []);

  // report CTA
  const hasResult = activeTab === "url" ? !!urlRes : !!emailRes;
  const prefillValue =
    activeTab === "url"
      ? (urlRes?.url ?? urlInput).trim()
      : (emailRes?.address ?? emailInput).trim();

  const goReport = () => {
    if (!hasResult || !prefillValue) return;
    navigate(
      `/report?type=${encodeURIComponent(
        activeTab
      )}&value=${encodeURIComponent(prefillValue)}#report-form`
    );
  };

  const ReportCTA = () => (
    <div className="report-cta">
      <p className="report-cta__lead">
        Think this looks suspicious? Report it anonymously to help protect
        others.
      </p>
      <p id="content-privacy-note" className="privacy-note">
        We don’t store your input. Checks run momentarily; only anonymous totals are kept.{" "}
        <a href="/about" aria-label="Privacy & Governance">Privacy &amp; Governance</a>
      </p>


      <Button
        type="primary"
        size="large"
        onClick={goReport}
        disabled={!hasResult}
        className="report-btn"
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
          <Typography.Title level={1} className="hero-title">
            Check for <span className="hero-title-accent">Malicious</span>
            <br /> Content Instantly
          </Typography.Title>

          <Typography.Paragraph className="hero-sub">
            Protect yourself online by checking links, messages, or emails for
            potential scams. Get a trusted AI-driven safety report in seconds.
          </Typography.Paragraph>
        </div>

        <div className="hero-card-wrap">
          <Card className="hero-card" bordered>
            <div className="hero-card-head">
              <Search size={18} />
              <span>Security Scanner</span>
            </div>
            <div className="hero-card-desc">
              Enter a URL, email address, or analyze message content for
              security threats
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
                        placeholder="'https://www.dodgydetector.shop/' or 'www.dodgydetector.shop'"
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
                        <div className="result-card light-surface">
                          <RiskNotesCard
                            kind="url"
                            data={urlRes}
                            showReportButton={false}
                          />
                        </div>
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
                        <div className="result-card light-surface">
                          <RiskNotesCard
                            kind="email"
                            data={emailRes}
                            showReportButton={false}
                          />
                        </div>
                      )}
                      {hasResult && activeTab === "email" && <ReportCTA />}
                    </div>
                  ),
                },
                {
                  key: "content",
                  label: (
                    <span className="hero-tab">
                      <MessageSquare size={16} /> SMS/Email Content
                    </span>
                  ),
                  children: (
                    <div className="hero-pane">
                      <label className="hero-label" htmlFor="content-mode">
                        Analysis Mode
                      </label>

                      <div className="hero-mode-switch">
                        <Button
                          type={uploadMode === "text" ? "primary" : "default"}
                          onClick={() => {
                            setUploadMode("text");
                            setSelectedFile(null);
                            setContentRes(null);
                            setContentError(null);
                          }}
                          icon={<FileText size={16} />}
                        >
                          Paste Text
                        </Button>

                        <Button
                          type={uploadMode === "file" ? "primary" : "default"}
                          onClick={() => {
                            setUploadMode("file");
                            setContentInput("");
                            setContentRes(null);
                            setContentError(null);
                          }}
                          icon={<UploadIcon size={16} />}
                        >
                          Upload File
                        </Button>
                      </div>

                      {uploadMode === "text" ? (
                        <>
                          <label
                            className="hero-label"
                            htmlFor="content-input"
                          >
                            Message Content
                          </label>
                          <TextArea
                            id="content-input"
                            size="large"
                            placeholder="Paste your suspicious SMS or email content here..."
                            value={contentInput}
                            onChange={(e) => setContentInput(e.target.value)}
                            rows={6}
                            maxLength={10000}
                            showCount
                          />
                        </>
                      ) : (
                        <>
                          <label
                            className="hero-label"
                            htmlFor="file-upload"
                          >
                            Upload Screenshot or PDF
                          </label>
                          <Upload.Dragger
                            name="file"
                            multiple={false}
                            beforeUpload={handleFileChange}
                            onRemove={handleRemoveFile}
                            fileList={
                              selectedFile
                                ? [
                                    {
                                      uid: "-1",
                                      name: selectedFile.name,
                                      status: "done",
                                      url: "",
                                    },
                                  ]
                                : []
                            }
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hero-uploader"
                          >
                            <p className="ant-upload-drag-icon">
                              <UploadIcon size={48} className="upload-icon" />
                            </p>
                            <p className="ant-upload-text">
                              Click or drag file to upload
                            </p>
                            <p className="ant-upload-hint">
                              Support JPEG, PNG (max 10MB) or PDF (max 5MB)
                            </p>
                          </Upload.Dragger>

                          <label
                            className="hero-label"
                            htmlFor="context-input"
                          >
                            Additional Context (Optional)
                          </label>
                          <Input
                            id="context-input"
                            size="large"
                            placeholder="Add any additional context about the file..."
                            value={contentInput}
                            onChange={(e) => setContentInput(e.target.value)}
                            className="hero-context"
                          />
                        </>
                      )}

                      <Button
                        type="primary"
                        size="large"
                        className="hero-cta"
                        onClick={handleCheck}
                        disabled={!canSubmit || loading}
                        loading={loading}
                        icon={<Shield size={18} />}
                      >
                        Analyze Content
                      </Button>

                      {contentRes && (
                        <div className="result-card light-surface">
                          <MarkdownReportCard
                            markdown={contentRes.markdown_report}
                            loading={loading}
                            error={contentError}
                          />
                        </div>
                      )}
                      {contentError && !contentRes && (
                        <div className="result-card light-surface">
                          <MarkdownReportCard
                            markdown=""
                            loading={false}
                            error={contentError}
                          />
                        </div>
                      )}
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
