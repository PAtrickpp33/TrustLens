import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-primary"
      : "text-foreground hover:text-primary transition-colors";

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Brand */}
        <div className="flex items-center space-x-2">
          <div
            className="w-8 h-8 rounded-2xl overflow-hidden border border-foreground/10 ring-1 ring-black/5 bg-card"
            aria-label="TrustLens"
          >
            <img
              src="/logo/trustlens_logo.jpeg"
              alt="TrustLens logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-xl text-[#123972]">TrustLens</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" end className={linkClass}>
            ScamCheck
          </NavLink>
          {/* 🔹 Dashboard link */}
          <NavLink to="/landing" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/features" className={linkClass}>
            Quiz
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About us
          </NavLink>
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <NavLink to="/" end className={linkClass} onClick={closeMenu}>
              ScamCheck
            </NavLink>
            {/* 🔹 Dashboard link (mobile) */}
            <NavLink to="/landing" className={linkClass} onClick={closeMenu}>
              Dashboard
            </NavLink>
            <NavLink to="/features" className={linkClass} onClick={closeMenu}>
              Quiz
            </NavLink>
            <NavLink to="/about" className={linkClass} onClick={closeMenu}>
              About us
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
};
