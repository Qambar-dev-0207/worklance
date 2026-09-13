'use client';

import React, { useState, useEffect } from 'react';

export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(Math.max((window.scrollY / totalHeight) * 100, 0), 100);
        setScrollProgress(progress);
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '2.5px',
        zIndex: 9999,
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      <div
        style={{
          width: `${scrollProgress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #18181B 0%, #3B82F6 50%, #06B6D4 100%)',
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.5), 0 0 4px rgba(6, 182, 212, 0.7)',
          transition: 'width 0.1s cubic-bezier(0.1, 0.9, 0.2, 1)',
        }}
      />
    </div>
  );
}
