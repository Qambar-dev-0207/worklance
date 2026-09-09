'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, FileText, Sparkles, User } from 'lucide-react';

interface MobileBottomDockProps {
  currentUser?: any;
}

export default function MobileBottomDock({ currentUser }: MobileBottomDockProps) {
  const pathname = usePathname();

  const dockItems = [
    { label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Jobs', href: '/jobs', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Resume', href: '/resume-builder', icon: <FileText className="w-4 h-4" /> },
    { label: 'Prep', href: '/interview-prep', icon: <Sparkles className="w-4 h-4" /> },
    {
      label: currentUser ? 'Profile' : 'Log in',
      href: currentUser ? '/profile' : '/login',
      icon: <User className="w-4 h-4" />,
    },
  ];

  return (
    <div className="mobile-bottom-dock">
      <div className="mobile-bottom-dock-inner">
        {dockItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-dock-item ${isActive ? 'active' : ''}`}
            >
              <div className="mobile-dock-icon">{item.icon}</div>
              <span className="mobile-dock-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
