import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Shield, Zap, Globe, AlertTriangle, Eye, BarChart3 } from "lucide-react";

const features = [
  { icon: Shield, title: "Advanced Threat Detection", description: "Detect malware, phishing, scams, and other security threats using advanced AI algorithms and real-time threat intelligence." },
  { icon: Zap, title: "Instant Analysis", description: "Get security results in seconds with our high-performance scanning engine that processes millions of queries daily." },
  { icon: Globe, title: "Multi-Type Scanning", description: "Comprehensive checking for websites, email addresses, and phone numbers all in one powerful platform." },
  { icon: AlertTriangle, title: "Risk Assessment", description: "Detailed risk levels with clear explanations helping you understand potential threats and make informed decisions." },
  { icon: Eye, title: "Privacy Protected", description: "Your queries are processed securely and privately. We don't store personal information or track your activity." },
  { icon: BarChart3, title: "Detailed Reports", description: "Comprehensive security reports with actionable insights, threat breakdowns, and safety recommendations." },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold">Powerful Security Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive protection against online threats with advanced detection capabilities 
            and real-time security intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}


