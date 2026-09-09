'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, 
  Command, 
  User, 
  LogOut, 
  FileText, 
  Briefcase, 
  ChevronDown, 
  PlusCircle, 
  Sparkles,
  ShieldCheck 
} from 'lucide-react';
import CommandPalette from './CommandPalette';
import MobileBottomDock from './MobileBottomDock';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isHomePage = pathname === '/';

  useEffect(() => {
    // 1. Initial check from localStorage for instant zero-latency hydration
    const loadUserFromStorage = () => {
      const userStr = localStorage.getItem('worklance_user');
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (e) {}
      } else {
        setCurrentUser(null);
      }
    };

    loadUserFromStorage();

    // 2. Synchronize verified session with backend /api/auth/me using Bearer header fallback
    const token = typeof window !== 'undefined' ? localStorage.getItem('worklance_token') : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('/api/auth/me', {
      headers,
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.status === 401) {
          // Only clear if server explicitly rejects authentication and no local session
          const userStr = localStorage.getItem('worklance_user');
          if (!userStr) {
            localStorage.removeItem('worklance_token');
            setCurrentUser(null);
          }
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('worklance_user', JSON.stringify(data.user));
        }
      })
      .catch((err) => {
        // Network or offline glitch - preserve localStorage user state
        console.warn('Navbar auth check transient error:', err);
      });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleUserUpdate = () => {
      loadUserFromStorage();
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('worklance-user-updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('worklance-user-updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, [pathname]);

  // Close menus on route change or outside click
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('worklance_user');
    localStorage.removeItem('worklance_token');
    setCurrentUser(null);
    setLoggingOut(false);
    window.dispatchEvent(new Event('worklance-user-updated'));
    window.location.href = '/login';
  };

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  const navItems = [
    { label: 'Job Hub', href: '/jobs' },
    { label: 'Hackathons', href: '/hackathons' },
    { label: 'HR Directory', href: '/hr-database' },
    { label: 'Interview Prep', href: '/interview-prep' },
    { label: 'Resume Builder', href: '/resume-builder' },
  ];

  return (
    <>
      {/* GLOBAL RAYCAST-STYLE COMMAND PALETTE */}
      <CommandPalette />

      {/* PRIMARY DESKTOP & MOBILE HEADER */}
      <nav 
        className={`nav ${isScrolled ? 'scrolled' : ''}`}
        style={{
          position: isHomePage ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }}
      >
        <div className="container nav-inner">
          {/* BRAND LOGO */}
          <Link href="/" className="logo">
            <img src="/logo.png" alt="Worklance Logo" className="logo-mark-img" width={34} height={34} />
            <span>Worklance</span>
          </Link>

          {/* UNIVERSAL NAVIGATION LINKS (VISIBLE TO EVERYONE) */}
          <div className="nav-links">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#000000' : 'var(--navy)',
                    opacity: isActive ? 1 : 0.72,
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Post Job
              </Link>
            )}
          </div>

          {/* RIGHT ACTION CLUSTER: COMMAND TRIGGER & AUTH */}
          <div className="nav-cta" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* COMMAND PALETTE QUICK LAUNCH BADGE */}
            <button
              onClick={openCommandPalette}
              className="nav-command-btn"
              title="Open Command Palette (⌘K or Ctrl+K)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: '#F4F4F5',
                border: '1px solid #E4E4E7',
                borderRadius: '100px',
                color: '#52525B',
                fontSize: '12.5px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline" style={{ color: '#71717A' }}>Search</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  background: '#FFFFFF',
                  border: '1px solid #D4D4D8',
                  borderRadius: '4px',
                  padding: '1px 5px',
                  fontSize: '10.5px',
                  fontFamily: 'monospace',
                  color: '#3F3F46',
                }}
              >
                ⌘K
              </span>
            </button>

            {/* AUTHENTICATED USER DROPDOWN */}
            {currentUser ? (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: profileDropdownOpen ? '#F4F4F5' : 'transparent',
                    border: '1px solid #E4E4E7',
                    padding: '5px 12px',
                    borderRadius: '100px',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#000000',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#18181B' }}>
                    {currentUser.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="nav-profile-menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '220px',
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E4E4E7',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      zIndex: 120,
                      animation: 'paletteScaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid #F4F4F5' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090B' }}>
                        {currentUser.name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#71717A', wordBreak: 'break-all' }}>
                        {currentUser.email}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: currentUser.role === 'recruiter' ? '#F4F4F5' : '#ECFDF5',
                            color: currentUser.role === 'recruiter' ? '#18181B' : '#059669',
                          }}
                        >
                          {currentUser.role || 'Candidate'}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="nav-dropdown-item"
                    >
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      <span>My Profile & Applications</span>
                    </Link>

                    <Link
                      href="/resume-builder"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="nav-dropdown-item"
                    >
                      <FileText className="w-3.5 h-3.5 text-zinc-500" />
                      <span>ATS Resume Builder</span>
                    </Link>

                    <Link
                      href="/jobs"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="nav-dropdown-item"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Explore Jobs</span>
                    </Link>

                    {(currentUser.role === 'admin' || currentUser.email === 'admin@worklance.com') && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="nav-dropdown-item"
                        style={{ color: '#09090B', fontWeight: 600, background: '#F4F4F5' }}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div style={{ height: '1px', background: '#F4F4F5', margin: '4px 0' }}></div>

                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="nav-dropdown-item text-red-600 hover:bg-red-50"
                      style={{ color: '#DC2626', width: '100%', textAlign: 'left' }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{loggingOut ? 'Logging out...' : 'Log out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* GUEST BUTTONS */
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link href="/login" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '13.5px' }}>
                  Log in
                </Link>
                <Link href="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13.5px' }}>
                  Get Started
                </Link>
              </div>
            )}

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
              <span
                style={{
                  display: 'block',
                  width: '22px',
                  height: '2px',
                  background: '#000000',
                  transition: 'all 0.3s ease',
                  transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
                }}
              ></span>
              <span
                style={{
                  display: 'block',
                  width: '22px',
                  height: '2px',
                  background: '#000000',
                  transition: 'all 0.3s ease',
                  opacity: mobileMenuOpen ? 0 : 1,
                }}
              ></span>
              <span
                style={{
                  display: 'block',
                  width: '22px',
                  height: '2px',
                  background: '#000000',
                  transition: 'all 0.3s ease',
                  transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
                }}
              ></span>
            </button>
          </div>
        </div>

        {/* MOBILE TOP DRAWER */}
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
              padding: '20px 24px 28px',
              boxShadow: '0 16px 36px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              zIndex: 105,
              animation: 'paletteFadeIn 0.15s ease-out',
            }}
          >
            {/* Command search trigger inside mobile menu */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openCommandPalette();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#F4F4F5',
                borderRadius: '8px',
                border: '1px solid #E4E4E7',
                color: '#52525B',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search className="w-4 h-4 text-zinc-500" />
                <span>Search jobs, tools & PYQs...</span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', background: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', border: '1px solid #D4D4D8' }}>
                ⌘K
              </span>
            </button>

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '15.5px',
                  fontWeight: pathname === item.href ? 700 : 500,
                  color: pathname === item.href ? '#000000' : '#3F3F46',
                  padding: '6px 0',
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
                  fontSize: '15.5px',
                  fontWeight: 700,
                  color: '#000000',
                  padding: '6px 0',
                }}
              >
                + Post a New Job
              </Link>
            )}

            <div style={{ height: '1px', background: '#F4F4F5', margin: '4px 0' }}></div>

            {currentUser ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#18181B' }}>
                  Signed in as {currentUser.name}
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-outline"
                  style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                >
                  My Profile
                </Link>
                {(currentUser.role === 'admin' || currentUser.email === 'admin@worklance.com') && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary"
                    style={{ width: '100%', textAlign: 'center', justifyContent: 'center', background: '#09090B' }}
                  >
                    Admin Operations Console
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn btn-ghost"
                  style={{ width: '100%', textAlign: 'center', justifyContent: 'center', color: '#DC2626' }}
                >
                  Log out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-ghost"
                  style={{ width: '100%', textAlign: 'center', justifyContent: 'center', border: '1px solid #E4E4E7' }}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* MOBILE BOTTOM FLOATING DOCK (VISIBLE ON SCREENS <= 640px) */}
      <MobileBottomDock currentUser={currentUser} />
    </>
  );
}
