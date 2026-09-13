'use client';

import React, { useState, useEffect } from 'react';

interface TextRotatorProps {
  texts: string[];
  interval?: number;
  className?: string;
  shimmer?: boolean;
}

export default function TextRotator({
  texts,
  interval = 3200,
  className = '',
  shimmer = true,
}: TextRotatorProps) {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (texts.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % texts.length);
        setIsTransitioning(false);
      }, 350); // half-way swap duration
    }, interval);

    return () => clearInterval(timer);
  }, [texts.length, interval, isPaused]);

  const currentText = texts[index] || texts[0] || '';

  return (
    <span
      className={`inline-block relative overflow-hidden align-baseline ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-live="polite"
      style={{ minWidth: '1ch' }}
    >
      <span
        className={`inline-block transition-all duration-350 ease-out transform ${
          isTransitioning
            ? 'opacity-0 -translate-y-4 filter blur-sm scale-95'
            : 'opacity-100 translate-y-0 filter blur-0 scale-100'
        } ${shimmer ? 'worklance-shimmer-text' : ''}`}
        style={{
          display: 'inline-block',
          willChange: 'transform, opacity, filter',
        }}
      >
        {currentText}
      </span>
    </span>
  );
}
