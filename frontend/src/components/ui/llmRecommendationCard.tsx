// src/components/LlmRecommendationCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Button, message } from "antd";
import { Flag, CheckCircle2 } from "lucide-react";
import type { UrlRecommendResponse } from "@/lib/api";
import { reportUrl } from "@/lib/api";
import { AlertOctagon, AlertTriangle, AlertCircle, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = { data: UrlRecommendResponse };

type Ui = {
  label: string;
  text: string;         // text color
  border: string;       // border color
  dot: string;          // small colored dot/bg
  badge: string;        // pill style
  Icon: LucideIcon;
};

function bandToUi(bandRaw: string): Ui {
  const band = (bandRaw || "").toUpperCase();
  if (band === "UNSAFE" || band === "HIGH") {
    return {
      label: "UNSAFE",
      text: "text-red-700",
      border: "border-red-300",
      dot: "bg-red-600",
      badge: "bg-red-50 text-red-700 border border-red-200",
      Icon: AlertOctagon,
    };
  }
  if (band === "MEDIUM RISK" || band === "MEDIUM") {
    return {
      label: "MEDIUM RISK",
      text: "text-orange-700",
      border: "border-orange-300",
      dot: "bg-orange-600",
      badge: "bg-orange-50 text-orange-700 border border-orange-200",
      Icon: AlertTriangle,
    };
  }
  if (band === "LOW RISK" || band === "LOW") {
    return {
      label: "LOW RISK",
      text: "text-amber-700",
      border: "border-amber-300",
      dot: "bg-amber-600",
      badge: "bg-amber-50 text-amber-700 border border-amber-200",
      Icon: AlertCircle,
    };
  }
  // SAFE default
  return {
    label: "SAFE",
    text: "text-green-700",
    border: "border-green-300",
    dot: "bg-green-600",
    badge: "bg-green-50 text-green-700 border border-green-200",
    Icon: ShieldCheck,
  };
}

export default function LlmRecommendationCard({ data }: Props) {
  // --- new state for reporting UX (ported from RiskCard) ---
  const [isReporting, setIsReporting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isReported, setIsReported] = useState(false);

  const band = data?.llm?.risk_band || data?.risk_band || "SAFE";
  const ui = bandToUi(band);
  const { Icon } = ui;

  const actionLabel = (data.llm?.action ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase()); // "allow_with_warning" -> "Allow With Warning"

  // display vs. report URL
  const displayUrl = data.url || data.ascii_safe_url;
  const reportableUrl = data.url || data.ascii_safe_url; // prefer raw if present
  const canReport = typeof reportableUrl === "string" && reportableUrl.length > 0;

  async function onReportClick() {
    if (!canReport) {
      message.error("No URL available to report");
      return;
    }
    setReportError(null);
    setIsReporting(true);
    try {
      await reportUrl(reportableUrl as string);
      message.success("Report successful");
      setIsReported(true);
    } catch (e: any) {
      const err = e?.message ?? "Failed to report";
      setReportError(err);
      message.error(err);
    } finally {
      setIsReporting(false);
    }
  }

  return (
    <Card className={`mt-4 border-2 ${ui.border}`}>
      <CardHeader>
        <CardTitle className="leading-snug">
          {data.llm?.user_safe_message ?? "Security recommendation"}
        </CardTitle>
        <CardDescription className="truncate">{displayUrl}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Big risk band row */}
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${ui.dot}`} />
          <Icon className={`${ui.text}`} size={22} />
          <div className={`text-2xl font-semibold tracking-tight ${ui.text}`}>
            {ui.label}
          </div>
          <div className="ml-auto">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ui.badge}`}>
              Recommended action: {actionLabel}
            </span>
          </div>
        </div>

        {/* Evidence */}
        {data.llm?.evidence && (
          <div className="text-sm">
            <p className="font-medium mb-1">Why this recommendation:</p>
            <p className="text-muted-foreground">{data.llm.evidence}</p>
          </div>
        )}

        {/* Next steps */}
        {Array.isArray(data.llm?.recommended_next_steps) && data.llm!.recommended_next_steps.length > 0 && (
          <div className="text-sm">
            <p className="font-medium mb-1">What you should do next:</p>
            <ul className="list-disc ml-5 space-y-1">
              {data.llm!.recommended_next_steps.map((t, i) => (
                <li key={`${i}-${t.slice(0, 16)}`}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Confidence note */}
        {data.llm?.confidence_note && (
          <p className="text-xs text-muted-foreground">{data.llm.confidence_note}</p>
        )}
        
        {/* Report button row (ported from RiskCard) */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            type={isReported ? "default" : "primary"}
            size="small"
            icon={isReported ? <CheckCircle2 size={16} /> : <Flag size={16} />}
            loading={isReporting}
            disabled={isReported || isReporting || !canReport}
            onClick={onReportClick}
          >
            {isReported ? "Reported" : isReporting ? "Reporting..." : "Report"}
          </Button>
          {reportError ? (
            <span className="text-xs text-red-600">{reportError}</span>
          ) : null}
        </div>
        
      </CardContent>
    </Card>
  );
}
