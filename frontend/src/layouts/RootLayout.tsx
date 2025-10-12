import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
//import { Footer } from '@/components/Footer';
import MovingBanner from "@/components/MovingBanner";

export const RootLayout: React.FC = () => {
  return (
    <div className="app-root">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <MovingBanner />
    </div>
  );
};


