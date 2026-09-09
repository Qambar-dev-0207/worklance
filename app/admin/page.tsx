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
  Filter
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);

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

  // 403 ACCESS DENIED SCREEN (NON-ADMIN USERS)
  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#09090B', color: '#FFF', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#121216',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '20px',
              padding: '36px',
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#EF4444',
              }}
            >
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                color: '#EF4444',
                letterSpacing: '0.12em',
                marginBottom: '6px',
              }}
            >
              403 Forbidden · Security Gate
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>
              Administrator Privileges Required
            </h2>
            <p style={{ fontSize: '14px', color: '#A1A1AA', lineHeight: 1.6, marginBottom: '24px' }}>
              The Worklance Operations Console and Autonomous Scraper Engine are restricted strictly to authorized platform administrators.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                href="/login?redirect=/admin"
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: '100px' }}
              >
                Sign in with Admin Account
              </Link>
              <Link
                href="/jobs"
                className="btn btn-outline"
                style={{ width: '100%', borderRadius: '100px', borderColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}
              >
                Return to Job Hub
              </Link>
            </div>
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
