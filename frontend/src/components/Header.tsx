import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "./Header.css"; 

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo + Brand */}
        <div className="brand">
          <img src="/logo/trustlens_logo.jpeg" alt="TrustLens logo" />
          <span>TrustLens</span>
        </div>

        {/* Desktop Nav */}
        <nav className="nav">
          <NavLink to="/" end className="nav-link" onClick={closeMenu}>
            ScamCheck
          </NavLink>
          <NavLink to="/landing" className="nav-link" onClick={closeMenu}>
            Dashboard
          </NavLink>
          <NavLink to="/overview" className="nav-link" onClick={closeMenu}>
            Insights
          </NavLink>
          <NavLink to="/features" className="nav-link" onClick={closeMenu}>
            Quiz
          </NavLink>
          <NavLink to="/about" className="nav-link" onClick={closeMenu}>
            About us
          </NavLink>
        </nav>

        {/* Mobile menu toggle */}
        <button className="menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="mobile-nav">
          <NavLink to="/" end className="nav-link" onClick={closeMenu}>
            ScamCheck
          </NavLink>
          <NavLink to="/landing" className="nav-link" onClick={closeMenu}>
            Dashboard
          </NavLink>
          <NavLink to="/overview" className="nav-link" onClick={closeMenu}>
            Insights
          </NavLink>
          <NavLink to="/features" className="nav-link" onClick={closeMenu}>
            Quiz
          </NavLink>
          <NavLink to="/about" className="nav-link" onClick={closeMenu}>
            About us
          </NavLink>
        </div>
      )}
    </header>
  );
};
