'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  avatarText: string;
  badge: string;
  badgeColor: string;
  headline: string;
  detail: string;
  timestamp: string;
  href: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    avatarText: 'SP',
    badge: 'Direct HR Hire',
    badgeColor: '#10B981',
    headline: 'Sneha P. secured SDE-1 Offer',
    detail: 'Swiggy · 10-Min Fast-Track Pipeline',
    timestamp: 'Just now',
    href: '/jobs',
  },
  {
    id: '2',
    avatarText: 'RM',
    badge: 'ATS Score Boost',
    badgeColor: '#3B82F6',
    headline: 'Rahul M. optimized resume to 97%',
    detail: 'Passed Workday & Greenhouse checks',
    timestamp: '2m ago',
    href: '/resume-builder',
  },
  {
    id: '3',
    avatarText: 'G',
    badge: 'New Role Alert',
    badgeColor: '#8B5CF6',
    headline: 'Google opened 14 new tech roles',
    detail: 'Senior Cloud & Backend Engineers',
    timestamp: '4m ago',
    href: '/jobs?keyword=Google',
  },
  {
    id: '4',
    avatarText: 'AD',
    badge: 'Interview Scheduled',
    badgeColor: '#F59E0B',
    headline: 'Ananya D. shortlisted at Razorpay',
    detail: 'Full Stack Engineer · 98% Match',
    timestamp: '7m ago',
    href: '/interview-prep',
  },
  {
    id: '5',
    avatarText: 'WH',
    badge: 'Hackathon Live',
    badgeColor: '#EC4899',
    headline: 'Winter Hackathon 2026',
    detail: '1,240 participants · ₹3,00,000 prize',
    timestamp: '11m ago',
    href: '/hackathons',
  },
];

export default function LiveActivityTicker() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isDismissed || isPaused) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ACTIVITIES.length);
        setIsVisible(true);
      }, 350);
    }, 4800);

    return () => clearInterval(interval);
  }, [isDismissed, isPaused]);

  if (isDismissed) return null;

  const current = ACTIVITIES[index];

  return (
    <aside
      aria-label="Live platform activity notifications"
      className="worklance-activity-dock hidden sm:block"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 88,
        maxWidth: '360px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          background: 'rgba(18, 18, 22, 0.94)',
          backdropFilter: 'blur(18px) saturate(180%)',
          WebkitBackdropFilter: 'blur(18px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '16px',
          padding: '12px 14px',
          boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
          opacity: isVisible ? 1 : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: current.badgeColor,
                boxShadow: `0 0 8px ${current.badgeColor}`,
                display: 'inline-block',
                animation: 'pulseBeacon 1.8s infinite',
              }}
            />
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.65)',
              }}
            >
              {current.badge}
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.35)' }}>• {current.timestamp}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss notification"
            style={{
              color: 'rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={13} />
          </button>
        </div>

        <Link
          href={current.href}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px',
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            {current.avatarText}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {current.headline}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.55)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {current.detail}
            </div>
          </div>

          <ChevronRight size={14} style={{ color: 'rgba(255, 255, 255, 0.4)', flexShrink: 0 }} />
        </Link>
      </div>
    </aside>
  );
}
