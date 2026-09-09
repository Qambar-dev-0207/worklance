'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  Server,
  Database,
  Cpu,
  RefreshCw,
  Play,
  Pause,
  Terminal,
  Users,
  Briefcase,
  Building2,
  Code,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  LogOut,
  Clock,
  Sparkles,
  Search,
  Filter,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);

  // Admin Login Gate State
  const [adminLoginId, setAdminLoginId] = useState('WL-ADMIN-2026');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPin, setAdminPin] = useState('8842');
  const [showPassword, setShowPassword] = useState(false);
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  // Scraper control inputs
  const [scraperLoading, setScraperLoading] = useState(false);
  const [activeScraperType, setActiveScraperType] = useState<'jobs' | 'hr' | 'hackathons'>('jobs');
  const [jobsKeyword, setJobsKeyword] = useState('Frontend');
  const [jobsLocation, setJobsLocation] = useState('Remote');
  const [jobsLimit, setJobsLimit] = useState(8);

  const [hrCompany, setHrCompany] = useState('');
  const [hrCity, setHrCity] = useState('');
  const [hrLimit, setHrLimit] = useState(6);

  const [hackathonsLimit, setHackathonsLimit] = useState(4);
  const [seedLoading, setSeedLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Initial Authentication & Admin Role Verification
  useEffect(() => {
    async function verifyAdminSession() {
      try {
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();

        if (authData.success && authData.user) {
          setCurrentUser(authData.user);
          const hasAdminPrivileges = authData.user.role === 'admin' || authData.user.email === 'admin@worklance.com';
          setIsAdmin(hasAdminPrivileges);

          if (hasAdminPrivileges) {
            await fetchAdminTelemetry();
          }
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    verifyAdminSession();
  }, []);

  const fetchAdminTelemetry = async () => {
    try {
      const res = await fetch('/api/admin');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setAdminData(json.data);
        }
      }
    } catch (e) {}
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle Master Scraper Switch
  const toggleScraperMaster = async () => {
    if (!adminData) return;
    const nextState = !adminData.scraper.isEnabled;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_scraper', enabled: nextState }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, nextState ? 'success' : 'error');
        await fetchAdminTelemetry();
      } else {
        showToast(data.error || 'Failed to toggle scraper', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Trigger Scraper Ingestion
  const handleExecuteScraper = async (type: 'jobs' | 'hr' | 'hackathons') => {
    if (!adminData?.scraper.isEnabled) {
      showToast('Scraper Engine is currently PAUSED. Activate the Master Switch first.', 'error');
      return;
    }

    setScraperLoading(true);
    try {
      let bodyPayload: any = { type };
      if (type === 'jobs') {
        bodyPayload.keyword = jobsKeyword;
        bodyPayload.location = jobsLocation;
        bodyPayload.limit = jobsLimit;
      } else if (type === 'hr') {
        bodyPayload.company = hrCompany;
        bodyPayload.city = hrCity;
        bodyPayload.limit = hrLimit;
      } else if (type === 'hackathons') {
        bodyPayload.limit = hackathonsLimit;
      }

      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Scraped ${type} successfully!`, 'success');
      } else {
        showToast(data.error || 'Scraper execution failed', 'error');
      }
      await fetchAdminTelemetry();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setScraperLoading(false);
    }
  };

  // Clear Logs
  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_logs' }),
      });
      if (res.ok) {
        showToast('Telemetry logs cleared.', 'success');
        await fetchAdminTelemetry();
      }
    } catch (e) {}
  };

  // Run Database Seed
  const handleSeedDatabase = async () => {
    const confirm = window.confirm(
      'CAUTION: Running the Database Seed will reset collections and reload canonical sample records. Proceed?'
    );
    if (!confirm) return;

    setSeedLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Database reset and seeded successfully!', 'success');
        await fetchAdminTelemetry();
      } else {
        showToast(data.error || 'Seeding failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSeedLoading(false);
    }
  };

  // 2. Safe Admin Login Handlers
  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminLoginId || !adminPassword) {
      setAdminLoginError('Admin Login ID and Master Passkey are required.');
      return;
    }

    setAdminLoginLoading(true);
    setAdminLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: adminLoginId,
          password: adminPassword,
          pin: adminPin,
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem('worklance_user', JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem('worklance_token', data.token);
        }
        window.dispatchEvent(new Event('worklance-user-updated'));

        setCurrentUser(data.user);
        setIsAdmin(true);
        showToast('✓ Welcome, Administrator. Operations Console Unlocked.', 'success');
        await fetchAdminTelemetry();
      } else {
        setAdminLoginError(data.error || 'Authentication rejected. Access denied.');
      }
    } catch (err: any) {
      setAdminLoginError(err.message || 'Connection error during administrative handshake.');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' });
    } catch (e) {}

    localStorage.removeItem('worklance_user');
    localStorage.removeItem('worklance_token');
    window.dispatchEvent(new Event('worklance-user-updated'));
    setCurrentUser(null);
    setIsAdmin(false);
    setAdminPassword('');
    showToast('Administrator session locked.', 'error');
  };

  const autofillCredentials = () => {
    setAdminLoginId('WL-ADMIN-2026');
    setAdminPassword('Worklance@Admin#2026');
    setAdminPin('8842');
    setAdminLoginError('');
  };

  // LOADING STATE
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#09090B', color: '#FFF', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <RefreshCw className="w-5 h-5 text-zinc-400 animate-spin" />
            <span style={{ fontSize: '14.5px', color: '#A1A1AA', fontFamily: 'monospace' }}>
              AUTHENTICATING OPERATOR PRIVILEGES...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // SAFE ADMIN LOGIN GATE (WHEN NOT AUTHENTICATED AS ADMIN)
  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#09090B', color: '#FFF', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        {/* TOAST ALERT */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '80px',
              right: '24px',
              zIndex: 9999,
              padding: '12px 20px',
              borderRadius: '100px',
              background: toastMessage.type === 'success' ? '#059669' : '#DC2626',
              color: '#FFFFFF',
              fontSize: '13.5px',
              fontWeight: 600,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{toastMessage.text}</span>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
          <div
            style={{
              maxWidth: '460px',
              width: '100%',
              background: '#121216',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              padding: '36px 32px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 40px rgba(16, 185, 129, 0.06)',
            }}
          >
            {/* Top Shield Emblem */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '18px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#10B981',
                  boxShadow: '0 0 24px rgba(16, 185, 129, 0.2)',
                }}
              >
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div
                style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  color: '#10B981',
                  letterSpacing: '0.12em',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '100px',
                  display: 'inline-block',
                  marginBottom: '10px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                RESTRICTED AREA // SECURE ADMIN GATEWAY
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
                Operations Console Login
              </h2>
              <p style={{ fontSize: '13px', color: '#A1A1AA', lineHeight: 1.5, margin: 0 }}>
                Enter your designated Secure Admin ID, Master Passkey, and 4-Digit Security PIN to access platform controls.
              </p>
            </div>

            {/* Error Message Box */}
            {adminLoginError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  color: '#F87171',
                  fontSize: '12.5px',
                  lineHeight: 1.4,
                }}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{adminLoginError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Secure Login ID */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Secure Admin Login ID
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#10B981', display: 'flex', alignItems: 'center' }}>
                    <Terminal className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={adminLoginId}
                    onChange={(e) => setAdminLoginId(e.target.value)}
                    placeholder="e.g. WL-ADMIN-2026"
                    required
                    style={{
                      width: '100%',
                      background: '#18181D',
                      border: '1px solid #27272A',
                      borderRadius: '12px',
                      padding: '12px 14px 12px 42px',
                      color: '#FFFFFF',
                      fontSize: '13.5px',
                      outline: 'none',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Master Passkey */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Master Passkey
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717A', display: 'flex', alignItems: 'center' }}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin passkey..."
                    required
                    style={{
                      width: '100%',
                      background: '#18181D',
                      border: '1px solid #27272A',
                      borderRadius: '12px',
                      padding: '12px 42px 12px 42px',
                      color: '#FFFFFF',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#71717A',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Secondary Security PIN */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    4-Digit Security PIN
                  </label>
                  <span style={{ fontSize: '10.5px', color: '#10B981', fontFamily: 'monospace' }}>2FA PROTECTED</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717A', display: 'flex', alignItems: 'center' }}>
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    maxLength={6}
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="4-digit PIN (e.g. 8842)"
                    required
                    style={{
                      width: '100%',
                      background: '#18181D',
                      border: '1px solid #27272A',
                      borderRadius: '12px',
                      padding: '12px 14px 12px 42px',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      letterSpacing: '0.25em',
                      outline: 'none',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Demo Credentials Quick Pill */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px dashed rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  fontSize: '11.5px',
                  color: '#A1A1AA',
                }}
              >
                <div>
                  <span style={{ color: '#71717A' }}>Default: </span>
                  <span style={{ fontFamily: 'monospace', color: '#FFFFFF', fontWeight: 700 }}>WL-ADMIN-2026</span>
                  <span style={{ color: '#71717A' }}> · PIN: </span>
                  <span style={{ fontFamily: 'monospace', color: '#10B981', fontWeight: 700 }}>8842</span>
                </div>
                <button
                  type="button"
                  onClick={autofillCredentials}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10B981',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ⚡ Autofill
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={adminLoginLoading}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '13px 20px',
                  borderRadius: '12px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: adminLoginLoading ? 'not-allowed' : 'pointer',
                  opacity: adminLoginLoading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.35)',
                  marginTop: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                {adminLoginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials & Clearance...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize & Unlock Console</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <Link
                  href="/jobs"
                  style={{
                    fontSize: '12px',
                    color: '#71717A',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Return to Public Job Hub</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isScraperActive = adminData?.scraper?.isEnabled ?? true;

  // AUTHORIZED ADMIN DASHBOARD
  return (
    <div style={{ minHeight: '100vh', background: '#09090B', color: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* TOAST ALERT */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '100px',
            background: toastMessage.type === 'success' ? '#059669' : '#DC2626',
            color: '#FFFFFF',
            fontSize: '13.5px',
            fontWeight: 600,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'paletteScaleUp 0.15s ease',
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(to bottom, #121216, #09090B)',
          padding: '40px 0 32px',
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontFamily: 'monospace',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#D4D4D8',
                    letterSpacing: '0.1em',
                  }}
                >
                  SYS_OPS // SECURITY_LVL_0
                </span>
                <span style={{ fontSize: '12px', color: '#71717A' }}>
                  Operator: <strong style={{ color: '#FFF' }}>{currentUser?.name || 'Administrator'}</strong> ({currentUser?.email})
                </span>
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                Operations Console & Scraper Engine
              </h1>
              <p style={{ color: '#A1A1AA', fontSize: '14.5px', marginTop: '6px' }}>
                Autonomous job ingestion, verified recruiter directory crawlers, and platform infrastructure.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* OPERATOR STATUS BADGE */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '16px',
                  padding: '10px 16px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 10px #10B981',
                  }}
                />
                <div>
                  <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#71717A', textTransform: 'uppercase' }}>
                    SECURE ACCESS ID
                  </div>
                  <div style={{ fontSize: '12.5px', fontFamily: 'monospace', fontWeight: 800, color: '#10B981' }}>
                    WL-ADMIN-2026
                  </div>
                </div>
              </div>

              {/* MASTER SCRAPER SWITCH */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '12px 20px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#71717A', textTransform: 'uppercase' }}>
                    Scraper Master Switch
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: isScraperActive ? '#10B981' : '#F59E0B',
                        boxShadow: isScraperActive ? '0 0 8px #10B981' : 'none',
                      }}
                    ></span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: isScraperActive ? '#10B981' : '#F59E0B' }}>
                      {isScraperActive ? 'ACTIVE (Enabled)' : 'PAUSED (Blocked)'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={toggleScraperMaster}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '100px',
                    background: isScraperActive ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                    border: isScraperActive ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                    color: isScraperActive ? '#EF4444' : '#10B981',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isScraperActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isScraperActive ? 'Pause Engine' : 'Turn On Scraper'}</span>
                </button>
              </div>

              {/* LOCK CONSOLE BUTTON */}
              <button
                onClick={handleAdminLogout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#EF4444',
                  padding: '12px 18px',
                  borderRadius: '16px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
                title="Lock Console & Clear Admin Session"
              >
                <LogOut className="w-4 h-4" />
                <span>Lock Console</span>
              </button>
            </div>
          </div>

          {/* TELEMETRY CARDS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              marginTop: '28px',
            }}
          >
            {/* Total Jobs */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#71717A' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 500 }}>Active Jobs</span>
                <Briefcase className="w-4 h-4 text-zinc-400" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: '#FFFFFF' }}>
                {adminData?.counts?.jobs?.toLocaleString() ?? '...'}
              </div>
              <div style={{ fontSize: '11px', color: '#71717A', marginTop: '4px' }}>In repository database</div>
            </div>

            {/* Total HRs */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#71717A' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 500 }}>Recruiter Directory</span>
                <Users className="w-4 h-4 text-zinc-400" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: '#FFFFFF' }}>
                {adminData?.counts?.hrContacts?.toLocaleString() ?? '...'}
              </div>
              <div style={{ fontSize: '11px', color: '#71717A', marginTop: '4px' }}>Verified talent leads</div>
            </div>

            {/* Total Hackathons */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#71717A' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 500 }}>Hackathons</span>
                <Code className="w-4 h-4 text-zinc-400" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: '#FFFFFF' }}>
                {adminData?.counts?.hackathons?.toLocaleString() ?? '...'}
              </div>
              <div style={{ fontSize: '11px', color: '#71717A', marginTop: '4px' }}>Active events indexed</div>
            </div>

            {/* Total Users */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#71717A' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 500 }}>Registered Users</span>
                <Building2 className="w-4 h-4 text-zinc-400" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: '#FFFFFF' }}>
                {adminData?.counts?.users?.total?.toLocaleString() ?? '...'}
              </div>
              <div style={{ fontSize: '11px', color: '#71717A', marginTop: '4px' }}>
                {adminData?.counts?.users?.seekers ?? 0} seekers · {adminData?.counts?.users?.recruiters ?? 0} recruiters
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN OPERATIONS INTERFACE */}
      <div className="container" style={{ padding: '40px 16px 80px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '28px' }}>
          
          {/* LEFT: SCRAPER LAUNCHER CONTROLS */}
          <div
            style={{
              background: '#121216',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Scraper Dispatch Center</h3>
                <p style={{ fontSize: '13px', color: '#71717A', margin: '4px 0 0' }}>
                  Execute live crawls against external sources and seed jobs into the platform.
                </p>
              </div>
              <Cpu className="w-5 h-5 text-zinc-400" />
            </div>

            {/* TYPE TABS */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '4px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {(['jobs', 'hr', 'hackathons'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveScraperType(tab)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeScraperType === tab ? '#FFFFFF' : 'transparent',
                    color: activeScraperType === tab ? '#000000' : '#A1A1AA',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab === 'hr' ? 'HR Recruiter' : tab}
                </button>
              ))}
            </div>

            {/* TAB CONTENT 1: JOBS */}
            {activeScraperType === 'jobs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', color: '#A1A1AA', marginBottom: '6px' }}>
                    Keyword / Stack Focus
                  </label>
                  <input
                    type="text"
                    value={jobsKeyword}
                    onChange={(e) => setJobsKeyword(e.target.value)}
                    placeholder="e.g. React, Next.js, Golang, Python"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#09090B',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#FFF',
                      fontSize: '13.5px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', color: '#A1A1AA', marginBottom: '6px' }}>
                      Location Filter
                    </label>
                    <input
                      type="text"
                      value={jobsLocation}
                      onChange={(e) => setJobsLocation(e.target.value)}
                      placeholder="e.g. Remote, India, Bengaluru"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: '#09090B',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#FFF',
                        fontSize: '13.5px',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', color: '#A1A1AA', marginBottom: '6px' }}>
                      Batch Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={jobsLimit}
                      onChange={(e) => setJobsLimit(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: '#09090B',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#FFF',
                        fontSize: '13.5px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: HR */}
            {activeScraperType === 'hr' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', color: '#A1A1AA', marginBottom: '6px' }}>
                    Target Company Filter (Optional)
                  </label>
                  <input
                    type="text"
                    value={hrCompany}
                    onChange={(e) => setHrCompany(e.target.value)}
                    placeholder="e.g. Google, Razorpay, Zepto, Swiggy"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#09090B',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#FFF',
                      fontSize: '13.5px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', color: '#A1A1AA', marginBottom: '6px' }}>
                      City (Optional)
                    </label>
                    <input
                      type="text"
                      value={hrCity}
                      onChange={(e) => setHrCity(e.target.value)}
                      placeholder="e.g. Bengaluru, Mumbai"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: '#09090B',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#FFF',
                        fontSize: '13.5px',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', color: '#A1A1AA', marginBottom: '6px' }}>
                      Batch Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={hrLimit}
                      onChange={(e) => setHrLimit(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: '#09090B',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#FFF',
                        fontSize: '13.5px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: HACKATHONS */}
            {activeScraperType === 'hackathons' && (
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', color: '#A1A1AA', marginBottom: '6px' }}>
                  Batch Event Limit
                </label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={hackathonsLimit}
                  onChange={(e) => setHackathonsLimit(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#09090B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#FFF',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {/* EXECUTION BUTTON */}
            <button
              onClick={() => handleExecuteScraper(activeScraperType)}
              disabled={scraperLoading || !isScraperActive}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: 700,
                opacity: !isScraperActive ? 0.5 : 1,
                cursor: !isScraperActive ? 'not-allowed' : 'pointer',
              }}
            >
              {scraperLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Ingesting Data from Feeds...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run {activeScraperType.toUpperCase()} Ingestion Now</span>
                </>
              )}
            </button>

            {!isScraperActive && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#F59E0B',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                ⚠️ Scraper Engine is currently PAUSED. Turn on the Master Switch above to enable runs.
              </div>
            )}

            {/* DATABASE MAINTENANCE & SEED */}
            <div
              style={{
                marginTop: '16px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#E4E4E7' }}>
                  Database Maintenance
                </div>
                <div style={{ fontSize: '11.5px', color: '#71717A' }}>
                  Target: {adminData?.database?.target || 'MongoDB'}
                </div>
              </div>

              <button
                onClick={handleSeedDatabase}
                disabled={seedLoading}
                style={{
                  padding: '7px 14px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#D4D4D8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {seedLoading ? 'Seeding...' : 'Seed Clean DB'}
              </button>
            </div>
          </div>

          {/* RIGHT: LIVE TELEMETRY LOG TERMINAL */}
          <div
            style={{
              background: '#050507',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              height: '520px',
              fontFamily: 'monospace',
            }}
          >
            {/* TERMINAL HEADER */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#E4E4E7' }}>
                  Ingestion Runtime Logs
                </span>
              </div>
              <button
                onClick={handleClearLogs}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#71717A',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Clear Log
              </button>
            </div>

            {/* LOG STREAM */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              {adminData?.scraper?.logs?.length === 0 ? (
                <div style={{ color: '#52525B', textAlign: 'center', marginTop: '40px' }}>
                  No logs recorded yet.
                </div>
              ) : (
                adminData?.scraper?.logs?.map((log: any) => {
                  let tagColor = '#71717A';
                  if (log.type === 'success') tagColor = '#10B981';
                  if (log.type === 'warn') tagColor = '#F59E0B';
                  if (log.type === 'error') tagColor = '#EF4444';

                  const timeStr = new Date(log.timestamp).toLocaleTimeString();

                  return (
                    <div key={log.id} style={{ display: 'flex', gap: '8px', wordBreak: 'break-all' }}>
                      <span style={{ color: '#52525B', flexShrink: 0 }}>[{timeStr}]</span>
                      <span style={{ color: tagColor, fontWeight: 700, flexShrink: 0 }}>
                        [{log.type.toUpperCase()}]
                      </span>
                      <span style={{ color: '#D4D4D8' }}>{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* TERMINAL FOOTER */}
            <div
              style={{
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#52525B',
              }}
            >
              <span>SYS STATUS: SECURE</span>
              <span>NODE_ENV: {adminData?.system?.nodeEnv || 'production'}</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
