'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('worklance_user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {}
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Job Hub', href: '/jobs' },
    { label: 'Hackathons', href: '/hackathons' },
    { label: 'HR Directory', href: '/hr-database' },
    { label: 'Interview Prep', href: '/interview-prep' },
    { label: 'Resume Builder', href: '/resume-builder' },
  ];

  return (
    <nav className={`nav ${isScrolled ? 'scrolled' : ''}`} style={{ position: 'relative' }}>
      <div className="container nav-inner">
        <Link href="/" className="logo">
          <img src="/logo.png" alt="Worklance Logo" className="logo-mark-img" width={34} height={34} />
          Worklance
        </Link>
        <div className="nav-links">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--orange-2)' : 'var(--navy)',
                  borderBottom: isActive ? '2px solid var(--orange-2)' : '2px solid transparent',
                  paddingBottom: '4px',
                  transition: 'all 0.2s ease',
                }}
              >
                {item.label}
              </Link>
            );
          })}
          {currentUser?.role === 'recruiter' && (
            <Link
              href="/jobs/post"
              style={{
                fontWeight: pathname === '/jobs/post' ? 700 : 600,
                color: 'var(--orange-2)',
              }}
            >
              + Post Job
            </Link>
          )}
        </div>
        <div className="nav-cta">
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--navy-deep)' }}>
                Hi, {currentUser.name}
              </span>
              <Link href="/profile" className="btn btn-outline" style={{ padding: '7px 16px', fontSize: '13px' }}>
                My Profile
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">Log in</Link>
              <Link href="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
