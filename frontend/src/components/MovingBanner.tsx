// components/MovingBanner.tsx
import React from "react";
import { Link } from "react-router-dom";
import "./MovingBanner.css";

const MovingBanner: React.FC = () => {
  return (
    <section className="banner-underlay" aria-label="Legal banner section">
      <div className="moving-banner" role="banner" aria-label="Dodgy Detector marquee">
        <div className="moving-banner-inner">
          <div className="moving-track">
            <div className="moving-seq">
              DODGY DETECTOR • DODGY DETECTOR • DODGY DETECTOR • DODGY DETECTOR • DODGY DETECTOR •
            </div>
            <div className="moving-seq" aria-hidden="true">
              DODGY DETECTOR • DODGY DETECTOR • DODGY DETECTOR • DODGY DETECTOR • DODGY DETECTOR •
            </div>
          </div>
        </div>

        {/* SPA-friendly links */}
        <nav className="banner-links" aria-label="Legal links">
          <Link to="/about" title="Learn more about us">Privacy Policy</Link>
          <Link to="/about" title="Learn more about us">Terms of Service</Link>
          <Link to="/about" title="Learn more about us">Cookie Policy</Link>
        </nav>
      </div>
    </section>
  );
};

export default MovingBanner;
