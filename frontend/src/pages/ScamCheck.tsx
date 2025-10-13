import React from 'react';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { About } from '@/components/About';
import ScamIntro from '@/components/ScamIntro'; 
import InsightsPeek from "@/components/InsightsPeek";
import './ScamCheck.css'; 

const ScamCheck: React.FC = () => {
  return (
    <div className="scamcheck-page">
      <div className="scamcheck-container">
        <section className="scamcheck-section">
          <ScamIntro />
        </section>
        <section className="scamcheck-section">
          <InsightsPeek />
        </section>
        <section id="scam-hero" className="scamcheck-section">
          <Hero />
        </section>

        <section className="scamcheck-section">
          <Features />
        </section>

        <section className="scamcheck-section">
          <About />
        </section>
      </div>
    </div>
  );
};

export default ScamCheck;
