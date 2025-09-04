import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Richard: Placed TrustLens logo from public/logo */}
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
          {/* Richard: Changed font color to dark blue */}
          <span className="font-bold text-xl text-[#123972]">TrustLens</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" className={({isActive}) => isActive ? "text-primary" : "text-foreground hover:text-primary transition-colors"}>ScamCheck</NavLink>
          <NavLink to="/features" className={({isActive}) => isActive ? "text-primary" : "text-foreground hover:text-primary transition-colors"}>Quiz</NavLink>
          <NavLink to="/about" className={({isActive}) => isActive ? "text-primary" : "text-foreground hover:text-primary transition-colors"}>About us</NavLink>
        </nav>

        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <NavLink to="/" className="text-foreground hover:text-primary transition-colors">ScamCheck</NavLink>
            <NavLink to="/features" className="text-foreground hover:text-primary transition-colors">Quiz</NavLink>
            <NavLink to="/about" className="text-foreground hover:text-primary transition-colors">About us</NavLink>
            
          </nav>
        </div>
      )}
    </header>
  );
};


