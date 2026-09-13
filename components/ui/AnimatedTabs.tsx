'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  layoutId?: string;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  pillColor?: string;
}

export default function AnimatedTabs({
  tabs,
  activeId,
  onChange,
  layoutId = 'worklance_active_tab',
  className = '',
  activeClassName = 'text-white font-semibold',
  inactiveClassName = 'text-zinc-400 hover:text-white',
  pillColor = '#18181B',
}: AnimatedTabsProps) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center p-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md relative ${className}`}
      style={{ isolation: 'isolate' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-2 text-xs md:text-sm font-medium rounded-full transition-colors duration-200 flex items-center gap-2 z-10 ${
              isActive ? activeClassName : inactiveClassName
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {/* Sliding Framer Motion Pill */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 32,
                }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: pillColor,
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                  zIndex: -1,
                }}
              />
            )}

            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
