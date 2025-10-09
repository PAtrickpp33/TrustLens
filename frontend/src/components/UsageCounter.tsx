import React, { useEffect, useMemo, useState } from "react";
import { Tooltip, Typography } from "antd";
import { Info } from "lucide-react";

const { Text } = Typography;

type CountResponse = { count?: number; asOf?: string };

const formatInt = (n: number) =>
  new Intl.NumberFormat().format(Math.max(0, Math.floor(n)));

const timeAgo = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

export function UsageCounter({
  endpoint = "/api/metrics/checks?window=7d",
}: {
  endpoint?: string;
}) {
  const [data, setData] = useState<CountResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        // AC: request contains NO user input; GET only; no body
        const res = await fetch(endpoint, {
          method: "GET",
          signal: ctrl.signal,
          // choose one that fits your app; both avoid sending extra data
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: CountResponse = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e?.message || "error");
      }
    })();
    return () => ctrl.abort();
  }, [endpoint]);

  const display = useMemo(() => {
    if (error) return "—";
    if (typeof data?.count !== "number") return "—";
    return formatInt(data.count);
  }, [data, error]);

  const updated = timeAgo(data?.asOf);

  return (
    <div
      aria-live="polite"
      className="usage-counter"
      style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase" }}>
          Checks in the last 7 days
        </Text>
        <Tooltip
          title={
            <>
              Anonymous, aggregate count. Inputs aren’t stored.
              {updated ? <><br />Updated {updated}</> : null}
            </>
          }
          placement="right"
        >
          <span
            role="img"
            aria-label="Usage info"
            tabIndex={0}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 18,
              height: 18,
              borderRadius: 999,
              border: "1px solid #cbd5e1",
              cursor: "help",
              outline: "none",
            }}
          >
            <Info size={12} aria-hidden />
          </span>
        </Tooltip>
      </div>

      {/* Value: fixed height & minWidth to avoid layout shift; tabular numerals for stable glyphs */}
      <div
        className="usage-value"
        style={{
          fontSize: 28,
          fontWeight: 600,
          lineHeight: 1.2,
          fontVariantNumeric: "tabular-nums",
          minWidth: "6ch", // keeps width stable even when showing "—"
          height: "1.2em", // keeps height stable
        }}
      >
        {display}
      </div>

      {updated && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Updated {updated}
        </Text>
      )}
    </div>
  );
}

export default UsageCounter;
