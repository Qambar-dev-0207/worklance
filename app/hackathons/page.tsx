'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface HackathonItem {
  _id: string;
  title: string;
  organizer: string;
  organizerBadge?: string;
  description: string;
  prizePool: string;
  status: 'Live' | 'Upcoming' | 'Completed';
  teamSize: string;
  tags: string[];
  duration: string;
  participantsCount: number;
  teamsCount: number;
  deadline: string;
}

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<HackathonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedHackathon, setSelectedHackathon] = useState<HackathonItem | null>(null);
  const [registerModal, setRegisterModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hackathons?status=${filterStatus}`);
      const data = await res.json();
      if (data.success) {
        setHackathons(data.hackathons);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [filterStatus]);

  const handleTeamRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/hackathons/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hackathonId: selectedHackathon._id,
          teamName,
          members,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to register team');
      }

      setSuccessMsg('🎉 Team registered successfully! Details logged to the platform.');
      fetchHackathons();
      setTimeout(() => {
        setRegisterModal(false);
        setSuccessMsg('');
        setTeamName('');
        setMembers('');
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO SECTION (MONOTONE) */}
      <div style={{ background: '#000000', color: '#fff', padding: '54px 0 50px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container">
          <div className="eyebrow" style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
            Tech Competitions
          </div>
          <h1 style={{ fontSize: '40px', color: '#fff', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Compete, build projects, and land dream roles
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', maxWidth: '640px', marginBottom: '28px' }}>
            Participate in top engineering hackathons, win cash prizes, and showcase verified skills directly to hiring managers.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['All', 'Live', 'Upcoming', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '100px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  background: filterStatus === st ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
                  color: filterStatus === st ? '#000000' : '#FFFFFF',
                  border: filterStatus === st ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {st} Hackathons
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* HACKATHON CARDS GRID */}
      <div className="container" style={{ padding: '48px 32px 80px', flex: 1 }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '20px', color: '#71717A', border: '1px solid #E4E4E7' }}>
            Loading hackathons...
          </div>
        ) : hackathons.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '20px', border: '1px solid #E4E4E7' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>No hackathons found</h3>
            <p style={{ fontSize: '14px', color: '#71717A' }}>Try selecting a different status filter.</p>
          </div>
        ) : (
          <div className="hack-grid">
            {hackathons.map((h) => (
              <div key={h._id} className="hack-card" style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E4E4E7', padding: '28px', display: 'flex', flexDirection: 'column' }}>
                <div className="hack-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div className="hack-logo-badge" style={{ width: '40px', height: '40px', background: '#000000', color: '#FFFFFF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                    {h.organizerBadge || h.organizer.slice(0, 2).toUpperCase()}
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: '100px',
                      background: h.status === 'Live' ? '#000000' : '#F4F4F5',
                      color: h.status === 'Live' ? '#FFFFFF' : '#71717A',
                      border: '1px solid #E4E4E7',
                    }}
                  >
                    {h.status === 'Live' ? '● Live Now' : h.status}
                  </span>
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.02em', color: '#000000' }}>{h.title}</h4>
                <div className="org" style={{ fontSize: '13px', color: '#71717A', marginBottom: '12px', fontWeight: 500 }}>Hosted by {h.organizer}</div>

                <p style={{ fontSize: '13.5px', color: '#52525B', marginBottom: '16px', lineHeight: 1.5, flexGrow: 1 }}>
                  {h.description}
                </p>

                <div className="tags" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {h.tags.map((t, idx) => (
                    <span key={idx} style={{ background: '#F4F4F5', color: '#18181B', fontSize: '12px', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>
                      {t}
                    </span>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #F4F4F5', paddingTop: '14px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#71717A' }}>Prize Pool</span>
                    <span style={{ fontWeight: 800, color: '#000000' }}>{h.prizePool}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#71717A' }}>Registered Teams</span>
                    <span style={{ fontWeight: 600, color: '#18181B' }}>{h.teamsCount || 0} teams ({h.participantsCount || 0} builders)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#71717A' }}>Timeline</span>
                    <span style={{ fontWeight: 600, color: '#18181B' }}>{h.deadline}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedHackathon(h);
                    setRegisterModal(true);
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', borderRadius: '100px', padding: '12px', fontSize: '13.5px', fontWeight: 700 }}
                >
                  {h.status === 'Live' ? 'Register Team' : 'View Challenge'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REGISTER TEAM MODAL (MONOTONE) */}
      {registerModal && selectedHackathon && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setRegisterModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '36px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setRegisterModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '20px', fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none', color: '#71717A' }}
            >
              ✕
            </button>

            <div style={{ marginBottom: '20px' }}>
              <span className="eyebrow" style={{ marginBottom: '8px' }}>Registration Portal</span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.02em' }}>{selectedHackathon.title}</h2>
              <p style={{ fontSize: '13.5px', color: '#71717A' }}>
                Prize Pool: {selectedHackathon.prizePool} · {selectedHackathon.teamSize}
              </p>
            </div>

            {successMsg ? (
              <div style={{ background: '#F4F4F5', border: '1px solid #E4E4E7', color: '#000000', padding: '16px', borderRadius: '16px', textAlign: 'center', fontWeight: 700, fontSize: '14px' }}>
                {successMsg}
              </div>
            ) : (
              <form onSubmit={handleTeamRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {errorMsg && (
                  <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: '10px', fontSize: '13px' }}>
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#18181B' }}>
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ByteCraft Innovators"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#18181B' }}>
                    Team Member Names / Emails (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex (alex@dev.io), Sarah (sarah@dev.io)"
                    value={members}
                    onChange={(e) => setMembers(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: '100%', borderRadius: '100px', padding: '13px', fontSize: '14px', fontWeight: 700, marginTop: '8px' }}
                >
                  {submitting ? 'Registering Team...' : 'Confirm Team Registration'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
