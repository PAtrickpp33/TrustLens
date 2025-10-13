import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "./Header.css";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link ${isActive ? "active" : ""}`;

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo + Brand */}
        <div className="brand">
          <img src="/logo/trustlens_logo.jpeg" alt="Dodgy Detector logo" />
          <span>Dodgy Detector</span>
        </div>

        {/* Desktop Nav */}
        <nav className="nav" aria-label="Main">
          <NavLink to="/" end className={linkClass} onClick={closeMenu}>
            ScamCheck
          </NavLink>
          <NavLink to="/landing" className={linkClass} onClick={closeMenu}>
            ScamHub
          </NavLink>
          {/*<NavLink to="/overview" className={linkClass} onClick={closeMenu}>
            Insights
          </NavLink>*/}
          <NavLink to="/features" className={linkClass} onClick={closeMenu}>
            Quiz
          </NavLink>
          <NavLink to="/about" className={linkClass} onClick={closeMenu}>
            About us
          </NavLink>
        </nav>

        {/* Mobile toggle */}
        <button
          className="menu-btn"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <nav className="mobile-nav" aria-label="Mobile">
          <NavLink to="/" end className={linkClass} onClick={closeMenu}>
            ScamCheck
          </NavLink>
          <NavLink to="/landing" className={linkClass} onClick={closeMenu}>
            ScamHub
          </NavLink>
          {/*<NavLink to="/overview" className={linkClass} onClick={closeMenu}>
            Insights
          </NavLink>*/}
          <NavLink to="/features" className={linkClass} onClick={closeMenu}>
            Quiz
          </NavLink>
          <NavLink to="/about" className={linkClass} onClick={closeMenu}>
            About us
          </NavLink>
        </nav>
      )}
    </header>
  );
};
