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
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleTeamRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Team registered successfully! Details have been sent to your email.');
    setTimeout(() => {
      setRegisterModal(false);
      setSuccessMsg('');
      setTeamName('');
      setMembers('');
    }, 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-soft)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO SECTION */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy-deep) 0%, #1A1A1A 100%)', color: '#fff', padding: '50px 0 60px' }}>
        <div className="container">
          <div className="eyebrow" style={{ color: 'var(--orange-2)' }}>Unstop-Style Competitions</div>
          <h1 style={{ fontSize: '40px', color: '#fff', marginBottom: '12px' }}>
            Compete, build projects, and land dream roles
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', maxWidth: '640px', marginBottom: '28px' }}>
            Participate in top company hackathons, win cash prizes, and showcase your skills directly to hiring managers.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            {['All', 'Live', 'Upcoming', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '100px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  background: filterStatus === st ? '#fff' : 'rgba(255,255,255,0.1)',
                  color: filterStatus === st ? 'var(--navy-deep)' : '#fff',
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
      <div className="container" style={{ padding: '50px 32px 80px', flex: 1 }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '20px', color: 'var(--text-muted)' }}>
            Loading hackathons...
          </div>
        ) : hackathons.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '20px', border: '1px solid var(--line)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No hackathons found</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Try selecting a different status filter.</p>
          </div>
        ) : (
          <div className="hack-grid">
            {hackathons.map((h) => (
              <div key={h._id} className="hack-card">
                <div className="hack-card-top">
                  <div className="hack-logo-badge">{h.organizerBadge || h.organizer.slice(0, 2).toUpperCase()}</div>
                  <span className={`hack-status ${h.status.toLowerCase()}`}>{h.status}</span>
                </div>
                <h4>{h.title}</h4>
                <div className="org">Hosted by {h.organizer}</div>

                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                  {h.description}
                </p>

                <div className="tags">
                  {h.tags.map((t, idx) => (
                    <span key={idx}>{t}</span>
                  ))}
                </div>

                <div className="hack-meta-row">
                  <span>Prize Pool</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{h.prizePool}</span>
                </div>
                <div className="hack-meta-row">
                  <span>Team Size</span>
                  <span>{h.teamSize}</span>
                </div>
                <div className="hack-meta-row">
                  <span>Status</span>
                  <span>{h.deadline}</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedHackathon(h);
                    setRegisterModal(true);
                  }}
                  className={`btn ${h.status === 'Live' ? 'btn-primary' : 'btn-dark'}`}
                  style={{ width: '100%', marginTop: '18px' }}
                >
                  {h.status === 'Live' ? 'Register Team' : 'View Challenge'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REGISTER TEAM MODAL */}
      {registerModal && selectedHackathon && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '32px',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setRegisterModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '20px', fontWeight: 700, cursor: 'pointer' }}
            >
              ✕
            </button>

            <div style={{ marginBottom: '20px' }}>
              <span className="eyebrow">Hackathon Registration</span>
              <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>{selectedHackathon.title}</h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                Prize Pool: {selectedHackathon.prizePool} · {selectedHackathon.teamSize}
              </p>
            </div>

            {successMsg && (
              <div
                style={{
                  background: '#DCFCE7',
                  color: '#166534',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13.5px',
                  marginBottom: '16px',
                }}
              >
                {successMsg}
              </div>
            )}

            <form onSubmit={handleTeamRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Team Name</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Code Ninja Squad"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--line)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>
                  Team Members (Name & Emails)
                </label>
                <textarea
                  rows={3}
                  required
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  placeholder="Riya Sharma (riya@gmail.com)&#10;Ankit Kapoor (ankit@gmail.com)"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--line)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setRegisterModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
