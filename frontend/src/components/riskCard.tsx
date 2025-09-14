import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getRiskUi } from "@/lib/riskUi";
import type { UrlRiskData, EmailRiskData, MobileRiskData } from "@/lib/api";
import { reportUrl, reportEmail, reportMobile } from "@/lib/api";
import { Flag } from "lucide-react";
import { message } from "antd";

type Props =
  | { kind: "url";    data: UrlRiskData }
  | { kind: "email";  data: EmailRiskData }
  | { kind: "mobile"; data: MobileRiskData };

export default function RiskCard(props: Props) {
  const { kind } = props;
  const level = props.data.risk_level as 0 | 1 | 2 | 3;
  const ui = getRiskUi(kind, level);
  const [isReporting, setIsReporting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const title = (() => {
    switch (kind) {
      case "url":    return "Website safety";
      case "email":  return "Email safety";
      case "mobile": return "Number safety";
    }
  })();

  const primaryLine = (() => {
    switch (kind) {
      case "url":    return (props as any).data.url;
      case "email":  return (props as any).data.address;
      case "mobile": return (props as any).data.e164;
    }
  })();

  const metaLine = (() => {
    switch (kind) {
      case "url": {
        const d = (props as any).data;
        return `risk=${d.risk_level} · phishing_flag=${d.phishing_flag} · reports=${d.report_count}`;
      }
      case "email": {
        const d = (props as any).data;
        return `risk=${d.risk_level} · mx_valid=${d.mx_valid} · disposable=${d.disposable} · reports=${d.report_count}`;
      }
      case "mobile": {
        const d = (props as any).data;
        return `risk=${d.risk_level} · reports=${d.report_count}`;
      }
    }
  })();

  async function onReportClick() {
    setReportError(null);
    setIsReporting(true);
    try {
      if (kind === "url") {
        const d = (props as any).data as UrlRiskData;
        await reportUrl(d.url);
      } else if (kind === "email") {
        const d = (props as any).data as EmailRiskData;
        await reportEmail(d.address);
      } else {
        const d = (props as any).data as MobileRiskData;
        // backend accepts either e164 or country_code + national_number
        await reportMobile({ e164: d.e164 });
      }
      message.success("Report successful");
    } catch (e: any) {
      setReportError(e?.message ?? "Failed to report");
      message.error(e?.message ?? "Failed to report");
    } finally {
      setIsReporting(false);
    }
  }

  return (
    <Card className={`mt-4 border-2 ${ui.border}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${ui.dot}`} />
          <span className={`${ui.text}`}>{title}: {ui.label}</span>
        </CardTitle>
        <CardDescription className="truncate">{primaryLine}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${ui.badge}`}>
          {ui.label}
        </div>

        <p className="text-sm text-muted-foreground">
          We compared this entry against <strong>300,000+ known signals</strong>.
          Based on our analysis, it appears <strong className={`${ui.text}`}>{ui.label.toLowerCase()}</strong>.
        </p>

        <p className="text-sm">{ui.note}</p>

        <div className="text-sm">
          <p className="font-medium mb-1">Recommended next steps:</p>
          <ul className="list-disc ml-5 space-y-1">
            {ui.tips.map((t) => (<li key={t}>{t}</li>))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">{metaLine}</p>

        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={onReportClick}
            disabled={isReporting}
            variant="default"
            size="sm"
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-600 border-blue-700 focus-visible:ring-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <Flag className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3" />
            {isReporting ? "Reporting..." : "Report"}
          </Button>
          {reportError ? (
            <span className="text-xs text-red-600">{reportError}</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
