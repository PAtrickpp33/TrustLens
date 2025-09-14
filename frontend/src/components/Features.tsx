import { Card, Row, Col, Typography } from "antd";
import { Shield, Zap, Globe, AlertTriangle, Eye, BarChart3, type LucideIcon } from "lucide-react";
import "./Features.css";

const { Title, Paragraph } = Typography;

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: FeatureItem[] = [
  { icon: Shield,       title: "Advanced Threat Detection", description: "Detect malware, phishing, scams, and other security threats using advanced AI algorithms and real-time threat intelligence." },
  { icon: Zap,          title: "Instant Analysis",          description: "Get security results in seconds with our high-performance scanning engine that processes millions of queries daily." },
  { icon: Globe,        title: "Multi-Type Scanning",       description: "Comprehensive checking for websites, email addresses, and phone numbers all in one powerful platform." },
  { icon: AlertTriangle,title: "Risk Assessment",           description: "Detailed risk levels with clear explanations helping you understand potential threats and make informed decisions." },
  { icon: Eye,          title: "Privacy Protected",         description: "Your queries are processed securely and privately. We don't store personal information or track your activity." },
  { icon: BarChart3,    title: "Detailed Reports",          description: "Comprehensive security reports with actionable insights, threat breakdowns, and safety recommendations." },
];

export function Features() {
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
            return (
              <Col key={i} xs={24} md={12} lg={8}>
                <Card className="feat-card" bordered>
                  <div className="feat-card-head">
                    <div className="feat-icon">
                      <Icon size={20} />
                    </div>
                    <div className="feat-title-sm">{f.title}</div>
                  </div>
                  <Paragraph className="feat-desc">
                    {f.description}
                  </Paragraph>
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
