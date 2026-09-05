'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // 1. Initial check from localStorage for fast initial render
    const userStr = localStorage.getItem('worklance_user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {}
    }

    // 2. Synchronize verified session with backend /api/auth/me
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('worklance_user', JSON.stringify(data.user));
        } else if (data.status === 401 || !data.success) {
          localStorage.removeItem('worklance_user');
          setCurrentUser(null);
        }
      })
      .catch(() => {});

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('worklance_user');
    setCurrentUser(null);
    setLoggingOut(false);
    window.location.href = '/login';
  };

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

        {/* NAVIGATION LINKS — ONLY VISIBLE FOR LOGGED-IN USERS */}
        <div className="nav-links">
          {currentUser && (
            <>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#000000' : 'var(--navy)',
                      borderBottom: isActive ? '2px solid #000000' : '2px solid transparent',
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
                    color: '#000000',
                  }}
                >
                  + Post Job
                </Link>
              )}
            </>
          )}
        </div>

        {/* RIGHT CTA / USER SESSION */}
        <div className="nav-cta">
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--navy-deep)' }}>
                Hi, {currentUser.name}
              </span>
              <Link href="/profile" className="btn btn-outline" style={{ padding: '7px 16px', fontSize: '13px' }}>
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="btn btn-ghost"
                style={{ padding: '7px 12px', fontSize: '13px', color: '#DC2626', cursor: 'pointer' }}
                title="Log out of your session"
              >
                {loggingOut ? 'Logging out...' : 'Log out'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link href="/login" className="btn btn-ghost">Log in</Link>
              <Link href="/register" className="btn btn-primary">Get Started</Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            flexDirection: 'column',
            gap: '5px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            zIndex: 110,
          }}
        >
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#000000', transition: '0.3s' }}></span>
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#000000', transition: '0.3s' }}></span>
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#000000', transition: '0.3s' }}></span>
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            borderBottom: '1px solid #E4E4E7',
            padding: '20px 32px 30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            zIndex: 105,
          }}
        >
          {currentUser ? (
            <>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontSize: '16px',
                    fontWeight: pathname === item.href ? 800 : 500,
                    color: pathname === item.href ? '#000000' : '#3F3F46',
                  }}
                >
                  {item.label}
                </Link>
              ))}
              {currentUser?.role === 'recruiter' && (
                <Link
                  href="/jobs/post"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#000000',
                  }}
                >
                  + Post a New Job
                </Link>
              )}
              <div style={{ paddingTop: '12px', borderTop: '1px solid #E4E4E7', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#18181B' }}>Signed in as {currentUser.name}</div>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%', borderRadius: '100px' }}>
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline"
                  style={{ width: '100%', borderRadius: '100px', color: '#DC2626', borderColor: '#FCA5A5' }}
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13.5px', color: '#71717A', lineHeight: 1.5 }}>
                Log in to access Job Hub, Hackathons, HR Directory, Interview Prep, and ATS Resume Builder.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline" style={{ flex: 1, borderRadius: '100px' }}>
                  Log In
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ flex: 1, borderRadius: '100px' }}>
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
