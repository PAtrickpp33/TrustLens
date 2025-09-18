// src/components/RiskNotesCard.tsx
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "antd";
import { Flag, HelpCircle, ShieldCheck, AlertCircle, AlertTriangle, AlertOctagon, LucideIcon } from "lucide-react";
import type { UrlRiskData, EmailRiskData, MobileRiskData } from "@/lib/api";
import { useNavigate } from "react-router-dom";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

type Props =
  | { kind: "url";    data: UrlRiskData }
  | { kind: "email";  data: EmailRiskData }
  | { kind: "mobile"; data: MobileRiskData };

type Ui = {
  label: "UNKNOWN" | "SAFE" | "LOW RISK" | "MEDIUM RISK" | "UNSAFE";
  text: string;   // text color
  border: string; // border color
  dot: string;    // small colored dot/bg
  badge: string;  // pill style
  Icon: LucideIcon;
};

function levelToUi(level: 0 | 1 | 2 | 3 | 4): Ui {
  switch (level) {
    case 1:
      return {
        label: "SAFE",
        text: "text-green-700",
        border: "border-green-300",
        dot: "bg-green-600",
        badge: "bg-green-50 text-green-700 border border-green-200",
        Icon: ShieldCheck,
      };
    case 2:
      return {
        label: "LOW RISK",
        text: "text-amber-700",
        border: "border-amber-300",
        dot: "bg-amber-600",
        badge: "bg-amber-50 text-amber-700 border border-amber-200",
        Icon: AlertCircle,
      };
    case 3:
      return {
        label: "MEDIUM RISK",
        text: "text-orange-700",
        border: "border-orange-300",
        dot: "bg-orange-600",
        badge: "bg-orange-50 text-orange-700 border border-orange-200",
        Icon: AlertTriangle,
      };
    case 4:
      return {
        label: "UNSAFE",
        text: "text-red-700",
        border: "border-red-300",
        dot: "bg-red-600",
        badge: "bg-red-50 text-red-700 border border-red-200",
        Icon: AlertOctagon,
      };
    default:
      return {
        label: "UNKNOWN",
        text: "text-gray-700",
        border: "border-gray-300",
        dot: "bg-gray-400",
        badge: "bg-gray-50 text-gray-700 border border-gray-200",
        Icon: HelpCircle,
      };
  }
}

export default function RiskNotesCard(props: Props) {
  const { kind } = props;
  const navigate = useNavigate();

  const level = (props.data.risk_level ?? 0) as 0 | 1 | 2 | 3 | 4;
  const ui = levelToUi(level);
  const { Icon } = ui;

  // Title (same semantics as RiskCard)
  const title = useMemo(() => {
    switch (kind) {
      case "url":    return "Website safety";
      case "email":  return "Email safety";
      case "mobile": return "Number safety";
    }
  }, [kind]);

  // Primary line to display + to prefill report page
  const primaryLine = useMemo(() => {
    switch (kind) {
      case "url":    return (props as any).data.url as string;
      case "email":  return (props as any).data.address as string;
      case "mobile": return (props as any).data.e164 as string;
    }
  }, [kind, props]);

//   // Small meta line (kept, since it’s handy)
//   const metaLine = useMemo(() => {
//     switch (kind) {
//       case "url": {
//         const d = (props as any).data as UrlRiskData;
//         return `risk=${d.risk_level} · phishing_flag=${d.phishing_flag} · reports=${d.report_count}`;
//       }
//       case "email": {
//         const d = (props as any).data as EmailRiskData;
//         return `risk=${d.risk_level} · mx_valid=${d.mx_valid} · disposable=${d.disposable} · reports=${d.report_count}`;
//       }
//       case "mobile": {
//         const d = (props as any).data as MobileRiskData;
//         return `risk=${d.risk_level} · reports=${d.report_count}`;
//       }
//     }
//   }, [kind, props]);

  const notes = (props.data as any)?.notes as string | null | undefined;

  const onGoToReport = () => {
    const type = kind === "url" ? "url" : kind === "email" ? "email" : "phone";
    navigate(`/report?type=${type}&value=${encodeURIComponent(primaryLine)}`);
  };

  return (
    <Card className={`mt-4 border-2 ${ui.border}`}>
      <CardHeader>
        <CardTitle className="leading-snug">{title}</CardTitle>
        <CardDescription className="truncate">{primaryLine}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Big band row (styled like LlmRecommendationCard) */}
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${ui.dot}`} />
          <Icon className={`${ui.text}`} size={22} />
          <div className={`text-2xl font-semibold tracking-tight ${ui.text}`}>
            {ui.label}
          </div>
          {/* <div className="ml-auto">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ui.badge}`}>
              Risk level: {level}
            </span>
          </div> */}
        </div>

        {/* LLM markdown notes */}
        {notes ? (
          <div className="text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
              }}
              className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0"
            >
              {notes}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No AI notes were provided for this result.
          </p>
        )}

        {/* Meta */}
        {/* <p className="text-xs text-muted-foreground">{metaLine}</p> */}

        {/* Report CTA (same UX as RiskCard: go to report page) */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            type="primary"
            size="small"
            icon={<Flag size={16} />}
            onClick={onGoToReport}
          >
            Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
