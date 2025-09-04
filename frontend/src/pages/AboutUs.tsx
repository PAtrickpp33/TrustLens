import React from "react";

const team = [
  { name: "Khadijeh", degree: "Master of Business Information Systems", role: "Product & UX", image: "/images/khadijeh.jpeg" },
  { name: "Richard",  degree: "Master of Data Science", role: "Data & Analytics", image: "/images/richard.jpeg" },
  { name: "Yungyang", degree: "Master of IT", role: "Full-stack Development", image: "/images/yungyang.jpeg" },
  { name: "Khushi",   degree: "Master of Data Science", role: "AI & Education Hub", image: "/images/khushi.jpeg" },
  { name: "Jiahao",   degree: "Master of AI", role: "Machine Learning", image: "/images/jiahao.jpeg" },
];

const AboutUs: React.FC = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      {/* Header & mission */}
      <div className="text-center mb-2">
        <span className="inline-block text-xs tracking-wide rounded-full px-3 py-1 border">
          Safer clicks. Smarter decisions.
        </span>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
        About <span className="text-primary">TrustLens</span>
      </h1>
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
        <p>
          TrustLens helps people recognise scams, understand online risks, and act with
          confidence — using clear explanations, practical education, and transparent checks.
        </p>
      </div>

      {/* What we do */}
      <h2 className="text-2xl font-semibold text-center mb-6">What We Do</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="rounded-xl border p-5 text-center">
          <div className="text-2xl mb-2">🛡️</div>
          <h3 className="font-medium mb-1">Risk Checks</h3>
          <p className="text-sm text-muted-foreground">
            Quick checks for <strong>URLs, emails, and phone numbers</strong> with plain-language explanations.
          </p>
        </div>
        <div className="rounded-xl border p-5 text-center">
          <div className="text-2xl mb-2">📘</div>
          <h3 className="font-medium mb-1">Education Hub</h3>
          <p className="text-sm text-muted-foreground">
            Red flags by category and bite-size guides you can trust.
          </p>
        </div>
        <div className="rounded-xl border p-5 text-center">
          <div className="text-2xl mb-2">🧾</div>
          <h3 className="font-medium mb-1">Case Studies</h3>
          <p className="text-sm text-muted-foreground">
            Real incidents distilled into 3–5 key lessons.
          </p>
        </div>
      </div>

      {/* Team */}
      <h2 className="text-2xl font-semibold text-center mb-6">Meet The Team</h2>
      <p className="text-center text-sm text-muted-foreground mb-6">
        We are a cross-disciplinary group combining product, data, AI, and engineering.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {team.map((m) => (
          <div key={m.name} className="rounded-xl border p-4 text-center">
            <div className="mx-auto h-32 w-32 rounded-lg overflow-hidden mb-3 bg-muted">
              <img
                src={m.image}
                alt={m.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://via.placeholder.com/128x128.png?text=TL";
                }}
              />
            </div>
            <div className="font-medium">{m.name}</div>
            <div className="text-xs text-muted-foreground">{m.degree}</div>
            <div className="text-sm mt-1">{m.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutUs;
