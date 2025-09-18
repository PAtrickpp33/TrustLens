import { Link, useSearchParams } from "react-router-dom";

export default function ReportSuccess() {
  const [params] = useSearchParams();
  const ref = decodeURIComponent(params.get("ref") || "RPT-XXXX");

  return (
    <main
      style={{
        minHeight: "70vh",
        background: "linear-gradient(180deg,#f8fafc 0%, #ffffff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 860,
          background: "#fff",
          borderRadius: 24,
          padding: "48px 32px 40px",
          boxShadow: "0 24px 60px rgba(2,6,23,.08)",
          textAlign: "center",
        }}
      >
        {/* success icon */}
        <div
          style={{
            width: 88,
            height: 88,
            margin: "0 auto 18px",
            borderRadius: "50%",
            background: "#eafff3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 0 0 10px #f3fff8",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            style={{ width: 44, height: 44, color: "#16a34a" }}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        {/* heading */}
        <h1
          style={{
            margin: 0,
            fontSize: 34,
            lineHeight: 1.2,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "#0f172a",
          }}
        >
          Thanks for your report!
        </h1>

        {/* reference pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
            padding: "8px 14px",
            borderRadius: 999,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: 14,
            fontWeight: 700,
            color: "#334155",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#22c55e",
              display: "inline-block",
            }}
          />
          <span>Reference:&nbsp;{ref}</span>
        </div>

        {/* subtitle */}
        <p
          style={{
            margin: "16px auto 0",
            maxWidth: 580,
            fontSize: 16,
            color: "#475569",
            lineHeight: 1.6,
          }}
        >
          Your submission was added to our moderation queue. We’ll use it to
          improve <strong>ScamCheck</strong>.
        </p>

        {/* actions */}
        <div
          style={{
            marginTop: 28,
            display: "flex",
            justifyContent: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          {/* Primary button (gradient) */}
          <Link
            to="/"
            style={{
              padding: "12px 24px",
              borderRadius: 14,
              background: "linear-gradient(90deg,#2563eb,#06b6d4)", // blue → cyan
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(37,99,235,0.45)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(37,99,235,0.35)";
            }}
          >
            Back to ScamCheck
          </Link>

          {/* Secondary button (soft) */}
          <Link
            to="/report"
            style={{
              padding: "12px 24px",
              borderRadius: 14,
              background: "#f1f5f9",
              border: "1px solid #d1d5db",
              color: "#0f172a",
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
              transition: "background 0.2s ease, border-color 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#e2e8f0";
              e.currentTarget.style.borderColor = "#cbd5e1";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
          >
            Report another
          </Link>
        </div>
      </div>
    </main>
  );
}
