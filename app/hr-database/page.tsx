'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface HrContactItem {
  _id: string;
  name: string;
  company: string;
  designation: string;
  email: string;
  linkedIn: string;
  industry: string;
  city: string;
  verified: boolean;
}

export default function HrDatabasePage() {
  const [contacts, setContacts] = useState<HrContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All');
  const [industry, setIndustry] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Recruiter Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [contactIndustry, setContactIndustry] = useState('Software & SaaS');
  const [contactCity, setContactCity] = useState('Bengaluru');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (city !== 'All') params.set('city', city);
      if (industry !== 'All') params.set('industry', industry);

      const res = await fetch(`/api/hr-database?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [city, industry]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContacts();
  };

  const handleCopyEmail = (contact: HrContactItem) => {
    navigator.clipboard.writeText(contact.email);
    setCopiedId(contact._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/hr-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          company,
          designation,
          email,
          linkedIn,
          industry: contactIndustry,
          city: contactCity,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add HR contact');
      }

      alert('✓ Verified recruiter contact successfully added to the Worklance Directory!');
      setAddModalOpen(false);
      setName('');
      setCompany('');
      setDesignation('');
      setEmail('');
      setLinkedIn('');
      fetchContacts();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* BANNER (MONOTONE) */}
      <div style={{ background: '#000000', color: '#fff', padding: '54px 0 44px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div className="eyebrow" style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
              Verified Directory
            </div>
            <h1 style={{ fontSize: '38px', color: '#fff', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.02em' }}>
              Reach HR Managers & Talent Leads Directly
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15.5px', maxWidth: '650px', marginBottom: '24px' }}>
              Direct connection with verified tech talent acquisition partners across high-growth startups and enterprises.
            </p>

            <form
              onSubmit={handleSearchSubmit}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '8px',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                maxWidth: '740px',
              }}
            >
              <input
                type="text"
                placeholder="Search by HR Name, Company, or Title (e.g. Zenith Tech, Technical Recruiter)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 2,
                  minWidth: '240px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #E4E4E7',
                  fontSize: '14px',
                  outline: 'none',
                  color: '#000000',
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: 700 }}>
                Search HR Directory
              </button>
            </form>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="btn btn-primary"
            style={{ background: '#FFFFFF', color: '#000000', borderRadius: '100px', padding: '12px 22px', fontWeight: 800, fontSize: '13.5px' }}
          >
            + Join Directory / Add HR Contact
          </button>
        </div>
      </div>

      {/* FILTER & HR CONTACT GRID */}
      <div className="container" style={{ padding: '40px 32px 80px', flex: 1 }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 800, color: '#71717A', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CITY
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid #E4E4E7', background: '#fff', fontSize: '13.5px', fontWeight: 600, outline: 'none' }}
            >
              <option value="All">All Cities</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Gurugram">Gurugram</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 800, color: '#71717A', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              INDUSTRY
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid #E4E4E7', background: '#fff', fontSize: '13.5px', fontWeight: 600, outline: 'none' }}
            >
              <option value="All">All Industries</option>
              <option value="Software">Software & SaaS</option>
              <option value="Fintech">Fintech</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Banking">Banking & Financial</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '20px', color: '#71717A', border: '1px solid #E4E4E7' }}>
            Searching HR directory...
          </div>
        ) : contacts.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '20px', border: '1px solid #E4E4E7' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>No HR contacts found</h3>
            <p style={{ fontSize: '14px', color: '#71717A' }}>Try broadening your search query or city filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {contacts.map((c) => (
              <div
                key={c._id}
                style={{
                  background: '#fff',
                  border: '1px solid #E4E4E7',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: '#000000',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #E4E4E7',
                        }}
                      >
                        {c.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#000000' }}>{c.name}</h4>
                        <div style={{ fontSize: '13px', color: '#71717A' }}>{c.designation}</div>
                      </div>
                    </div>
                    {c.verified && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          background: '#000000',
                          color: '#FFFFFF',
                          padding: '3px 10px',
                          borderRadius: '100px',
                        }}
                      >
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '12px 0', borderTop: '1px solid #F4F4F5', fontSize: '13.5px' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <strong style={{ color: '#000000' }}>Company:</strong> {c.company}
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <strong style={{ color: '#000000' }}>Industry:</strong> {c.industry}
                    </div>
                    <div>
                      <strong style={{ color: '#000000' }}>Location:</strong> {c.city}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button
                    onClick={() => handleCopyEmail(c)}
                    className="btn btn-outline"
                    style={{ flex: 1, fontSize: '12.5px', padding: '8px', borderRadius: '100px', fontWeight: 700 }}
                  >
                    {copiedId === c._id ? '✓ Copied!' : '📋 Copy Email'}
                  </button>
                  <a
                    href={`mailto:${c.email}?subject=Candidate%20Inquiry%20via%20Worklance`}
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '12.5px', padding: '8px', borderRadius: '100px', textAlign: 'center', fontWeight: 700 }}
                  >
                    ✉ Email
                  </a>
                  {c.linkedIn && (
                    <a
                      href={c.linkedIn}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline"
                      style={{ fontSize: '12.5px', padding: '8px 12px', borderRadius: '100px', fontWeight: 700 }}
                    >
                      🔗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD RECRUITER CONTACT MODAL */}
      {addModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setAddModalOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '540px',
              width: '100%',
              padding: '36px',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAddModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '20px', fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none', color: '#71717A' }}
            >
              ✕
            </button>

            <span className="eyebrow" style={{ marginBottom: '8px' }}>Talent Network</span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px', color: '#000000' }}>
              Join the Verified HR Directory
            </h2>
            <p style={{ fontSize: '13.5px', color: '#71717A', marginBottom: '20px' }}>
              List your recruiter profile so top developers and engineers can reach out to you directly for open roles.
            </p>

            {errorMsg && (
              <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#18181B' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Nair"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#18181B' }}>Company Name</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Razorpay / Swiggy"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#18181B' }}>Designation / Title</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Lead Technical Recruiter"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#18181B' }}>Work Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#18181B' }}>LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#18181B' }}>Industry</label>
                  <select
                    value={contactIndustry}
                    onChange={(e) => setContactIndustry(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="Software & SaaS">Software & SaaS</option>
                    <option value="Fintech">Fintech</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Banking & Financial">Banking & Financial</option>
                    <option value="E-Commerce">E-Commerce</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: '#18181B' }}>City</label>
                  <select
                    value={contactCity}
                    onChange={(e) => setContactCity(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7', fontSize: '13.5px', background: '#fff', outline: 'none' }}
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Gurugram">Gurugram</option>
                    <option value="Pune">Pune</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setAddModalOpen(false)} className="btn btn-outline" style={{ borderRadius: '100px' }}>Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ borderRadius: '100px', fontWeight: 700 }}>
                  {submitting ? 'Submitting...' : 'Register as Verified Recruiter'}
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
