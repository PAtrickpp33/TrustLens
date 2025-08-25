import React from 'react';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { About } from '@/components/About';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <Features />
      <About />
    </>
  );
};

export default Home;


