import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ScamIntro.css";

type Props = {
  /** Element id to scroll to (your scanner / hero card) */
  heroTargetId?: string;
  /** Background image path in /public */
  bg?: string; // e.g. "/bg/hero-security.jpg"
  /** Zoom factor for the background image (1 = normal, 1.1 = 10% wider) */
  zoom?: number;
  /** Background focal position (e.g. "center", "center right", "left", "right") */
  focal?: string;
  /** Offset for sticky header (px). If you have a fixed navbar, set ~60–100. */
  offset?: number;
};

const ScamIntro: React.FC<Props> = ({
  heroTargetId = "scam-hero",
  bg = "/bg/hero-security.jpg",
  zoom = 1.1,
  focal = "center",
  offset = 72, // scroll offset for sticky header
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // smooth scroll with offset (so content won't hide under fixed header)
  const scrollToIdWithOffset = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return false;
    const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
    return true;
  };

  const goToScanner = () => {
    const id = heroTargetId || "scam-hero";

    // If already on home page, try to scroll immediately
    if (location.pathname === "/") {
      if (scrollToIdWithOffset(id)) return;

      // Fallback: set hash, then try again on next frame
      window.location.hash = id;
      requestAnimationFrame(() => scrollToIdWithOffset(id));
      return;
    }

    // If on a different route, navigate to /#id and let the hash position us
    navigate(`/#${id}`);
    // Extra-safe: attempt to scroll after navigation (in case router doesn't)
    setTimeout(() => scrollToIdWithOffset(id), 60);
  };

  const goReport = () => {
    navigate("/report#report-form");
  };

  return (
    <section
      className="intro intro--fullbleed"
      style={{
        ["--intro-bg" as any]: `url('${bg}')`,
        ["--bg-zoom" as any]: zoom,
        ["--bg-pos" as any]: focal,
      }}
      aria-label="Scam intro"
    >
      {/* dark overlay for contrast over the image */}
      <div className="intro-overlay" />

      <div className="intro-container">
        <div className="intro-left">
          <h1 className="intro-title">
            Check shady <br />
            links & emails—<span className="intro-accent">fast.</span>
          </h1>

          <p className="intro-sub">
            We surface key legitimacy signals (SSL, domain age, ABN/ASIC, SPF/DKIM,
            crowd reports) and guide your next step.
          </p>

          <div className="intro-ctas">
            <button
              type="button"
              className="intro-btn intro-btn--primary"
              onClick={goToScanner}
            >
              ScamCheck
            </button>

            <button
              type="button"
              className="intro-btn intro-btn--ghost"
              onClick={goReport}
            >
              Report Scam
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScamIntro;
