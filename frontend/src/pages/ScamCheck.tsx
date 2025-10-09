import React from "react";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { About } from "@/components/About";
import { UsageCounter } from "@/components/UsageCounter";

const ScamCheck: React.FC = () => {
  return (
    <>
      <Hero />
      {/* Above the fold, directly under the hero */}
      <section style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
        <UsageCounter />
      </section>
      <Features />
      <About />
    </>
  );
};

export default ScamCheck;
