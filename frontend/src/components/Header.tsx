import { Button } from "antd";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">L</span>
          </div>
          <span className="font-bold text-xl">Logo</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" className={({isActive}) => isActive ? "text-primary" : "text-foreground hover:text-primary transition-colors"}>Home</NavLink>
          <NavLink to="/features" className={({isActive}) => isActive ? "text-primary" : "text-foreground hover:text-primary transition-colors"}>Features</NavLink>
          <NavLink to="/about" className={({isActive}) => isActive ? "text-primary" : "text-foreground hover:text-primary transition-colors"}>About</NavLink>
        </nav>

        <div className="hidden md:flex items-center">
          <Button type="primary" size="middle">Get Started</Button>
        </div>

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
            <NavLink to="/" className="text-foreground hover:text-primary transition-colors">Home</NavLink>
            <NavLink to="/features" className="text-foreground hover:text-primary transition-colors">Features</NavLink>
            <NavLink to="/about" className="text-foreground hover:text-primary transition-colors">About</NavLink>
            <div className="pt-4 border-t">
              <Button type="primary" size="middle" style={{ width: '100%' }}>Get Started</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};


