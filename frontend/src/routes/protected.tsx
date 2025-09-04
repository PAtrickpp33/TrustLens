import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '@/store/session';

type ProtectedRouteProps = {
  children: React.ReactElement;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useSessionStore((s) => Boolean(s.accessToken));

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};


type SiteGateProps = {
  children: React.ReactElement;
};

const GATE_KEY = 'site_gate_ok';
const PASSWORD = 'team18';

export const SiteGate: React.FC<SiteGateProps> = ({ children }) => {
  const [isAllowed, setIsAllowed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GATE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAllowed) {
      try {
        localStorage.setItem(GATE_KEY, 'true');
      } catch {}
    }
  }, [isAllowed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      setIsAllowed(true);
      setError(null);
    } else {
      setError('Incorrect password');
    }
  };

  if (isAllowed) return children;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm border rounded-lg p-6 shadow-sm bg-card">
        <h1 className="text-xl font-semibold mb-2">Protected</h1>
        <p className="text-sm text-muted-foreground mb-4">Enter password to continue.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Password"
            className="w-full border rounded-md px-3 py-2 bg-background"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="w-full bg-primary text-primary-foreground rounded-md h-9">Enter</button>
        </form>
      </div>
    </div>
  );
};


