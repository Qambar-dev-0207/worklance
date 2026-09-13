'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface MotionCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function MotionCard({
  children,
  className = '',
  delay = 0,
  ...props
}: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -5,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.985 }}
      className={`worklance-motion-card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
