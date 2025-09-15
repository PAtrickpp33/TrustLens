import React from "react";
import { Card, Row, Col, Typography } from "antd";
import {
  Shield,
  Zap,
  Globe,
  AlertTriangle,
  Eye,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Features.css";

const { Title, Paragraph } = Typography;

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  to?: string; // مقصد کلیک
};

const features: FeatureItem[] = [
  {
    icon: Shield,
    title: "Advanced Threat Detection",
    description:
      "Detect malware, phishing, scams, and other security threats using advanced AI algorithms and real-time threat intelligence.",
    // چارت روند: Scans vs Detected
    to: "/overview#trend",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description:
      "Get security results in seconds with our high-performance scanning engine that processes millions of queries daily.",
    // ابزار اصلی اسکن (در روت، صفحه ScamCheck)
    to: "/",
  },
  {
    icon: Globe,
    title: "Multi-Type Scanning",
    description:
      "Comprehensive checking for websites, email addresses, and phone numbers all in one powerful platform.",
    // اگر در Overview سکشنی برای نوع ورودی داری:
    to: "/overview#multi-type-scanning",
  },
  {
    icon: AlertTriangle,
    title: "Risk Assessment",
    description:
      "Detailed risk levels with clear explanations helping you understand potential threats and make informed decisions.",
    // دوناتِ سهم دسته‌ها = ارزیابی ریسک
    to: "/overview#detection-share",
  },
  {
    icon: Eye,
    title: "Privacy Protected",
    description:
      "Your queries are processed securely and privately. We don't store personal information or track your activity.",
    // سیاست‌های حریم‌خصوصی
    to: "/about#privacy",
  },
  {
    icon: BarChart3,
    title: "Detailed Reports",
    description:
      "Comprehensive security reports with actionable insights, threat breakdowns, and safety recommendations.",
    // گزارش کلی Overview
    to: "/overview",
  },
];

export function Features() {
  const navigate = useNavigate();

  const handleKey = (e: React.KeyboardEvent, to?: string) => {
    if (!to) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(to);
    }
  };

  const handleClick = (to?: string) => {
    if (to) navigate(to);
  };

  const ctaLabel = (to?: string) => {
    if (!to) return "";
    if (to.startsWith("/overview#")) return "View in Overview →";
    if (to === "/overview") return "Open Overview →";
    if (to.startsWith("/about")) return "Read policy →";
    if (to === "/") return "Try ScamCheck →";
    return "Open →";
  };

  return (
    <section id="features" className="feat-root">
      <div className="feat-container">
        <div className="feat-head">
          <Title level={2} className="feat-title">Powerful Security ScamCheck</Title>
          <Paragraph className="feat-sub">
            Comprehensive protection against online threats with advanced detection capabilities
            and real-time security intelligence.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {features.map((f, i) => {
            const Icon = f.icon;
            const isLink = Boolean(f.to);
            return (
              <Col key={i} xs={24} md={12} lg={8}>
                <Card
                  className={`feat-card ${isLink ? "clickable" : ""}`}
                  bordered
                  hoverable={isLink}
                  onClick={() => handleClick(f.to)}
                  role={isLink ? "button" : undefined}
                  tabIndex={isLink ? 0 : -1}
                  onKeyDown={(e) => handleKey(e, f.to)}
                  bodyStyle={{ padding: 20 }}
                  aria-label={isLink ? `${f.title} – ${ctaLabel(f.to)}` : f.title}
                >
                  <div className="feat-card-head">
                    <div className="feat-icon" aria-hidden>
                      <Icon size={20} />
                    </div>
                    <div className="feat-title-sm">{f.title}</div>
                  </div>
                  <Paragraph className="feat-desc">{f.description}</Paragraph>
                  {isLink && <div className="feat-cta">{ctaLabel(f.to)}</div>}
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </section>
  );
}

export default Features;
