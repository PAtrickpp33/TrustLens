import React from "react";
import { Link } from "react-router-dom";
import "./InsightsPeek.css";

/**
 * InsightsPeek — minimal, metrics-only version
 * --------------------------------------------
 * Left card  : big number for total risk URLs (all time)
 * Middle card: big number for total risk Emails (all time)
 * Right card : helpful links ("Where to dig deeper")
 *
 * Numbers use thousands separators (e.g., 231,774 / 27,759).
 * You can override the defaults by passing props:
 *   <InsightsPeek urlCount={123456} emailCount={7890} />
 */

type Props = {
  /** Total number of URL rows (all time). Defaults to 231774. */
  urlCount?: number;
  /** Total number of Email rows (all time). Defaults to 27759. */
  emailCount?: number;
};

// Helper: format numbers with thousands separators
const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

const InsightsPeek: React.FC<Props> = ({
  urlCount = 231774,   // <- DB number you provided
  emailCount = 27759,  // <- DB number you provided
}) => {
  return (
    <section className="peek-root" aria-labelledby="peek-h">
      <div className="peek-container">
        <div className="peek-surface">
          <h2 id="peek-h" className="peek-title">
            What <span>Dodgy Detector</span> is Seeing Right Now
          </h2>

          <p className="peek-sub">
            Snapshot of scam patterns from community reports and open-data
            feeds. Explore hot domains, common email lures, and categories with
            the highest loss.
          </p>

          <div className="peek-grid">
            {/* LEFT: total URLs */}
            <div className="peek-card">
              <h3 className="peek-card-title">Risk URLs (all time)</h3>
              <div className="peek-metric">{fmt(urlCount)}</div>
            </div>

            {/* MIDDLE: total Emails */}
            <div className="peek-card">
              <h3 className="peek-card-title">Risk Emails (all time)</h3>
              <div className="peek-metric">{fmt(emailCount)}</div>
            </div>

            {/* RIGHT: helpful links */}
            <div className="peek-card">
              <h3 className="peek-card-title">Where to dig deeper</h3>
              <ul className="peek-list">
                <li>
                  <Link to="/features">Education Hub → Red flags</Link>
                </li>
                <li>
                  <Link to="/landing">ScamHub → Overview</Link>
                </li>
              </ul>
            </div>
          </div>

          <Link to="/landing" className="peek-cta">
            ScamHub
          </Link>
        </div>
      </div>
    </section>
  );
};

export default InsightsPeek;
