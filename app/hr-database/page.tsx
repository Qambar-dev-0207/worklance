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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-soft)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* BANNER */}
      <div style={{ background: 'var(--navy-deep)', color: '#fff', padding: '50px 0 40px' }}>
        <div className="container">
          <div className="eyebrow" style={{ color: 'var(--orange-2)' }}>Verified Directory</div>
          <h1 style={{ fontSize: '38px', color: '#fff', marginBottom: '10px' }}>
            Reach HR Managers & Talent Leads Directly
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15.5px', maxWidth: '650px', marginBottom: '24px' }}>
            Skip black-hole job applications. Connect with verified talent leads across software, SaaS, fintech, and enterprise IT.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '10px',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <input
              type="text"
              placeholder="Search by HR Name, Company, or Designation (e.g. Zenith Tech, Recruiter)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 2,
                minWidth: '240px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--line)',
                fontSize: '14px',
                outline: 'none',
                color: 'var(--navy)',
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              Search HR Directory
            </button>
          </form>
        </div>
      </div>

      {/* FILTER & HR CONTACT GRID */}
      <div className="container" style={{ padding: '40px 32px 80px', flex: 1 }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              CITY
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px' }}
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
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              INDUSTRY
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px' }}
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
          <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '20px', color: 'var(--text-muted)' }}>
            Searching HR directory...
          </div>
        ) : contacts.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '20px', border: '1px solid var(--line)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No HR contacts found</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Try broadening your search query or city filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {contacts.map((c) => (
              <div
                key={c._id}
                style={{
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
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
                          background: 'linear-gradient(135deg, var(--navy-deep), var(--navy-2))',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {c.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{c.name}</h4>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{c.designation}</div>
                      </div>
                    </div>
                    {c.verified && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          background: '#DCFCE7',
                          color: '#166534',
                          padding: '3px 9px',
                          borderRadius: '100px',
                        }}
                      >
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '12px 0', borderTop: '1px solid var(--line)', fontSize: '13.5px' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Company:</strong> {c.company}
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Industry:</strong> {c.industry}
                    </div>
                    <div>
                      <strong>Location:</strong> {c.city}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <a
                    href={`mailto:${c.email}?subject=Inquiry%20from%20Worklance%20Candidate`}
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '12.5px', padding: '8px' }}
                  >
                    ✉ Contact HR
                  </a>
                  {c.linkedIn && (
                    <a
                      href={c.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{ fontSize: '12.5px', padding: '8px 12px' }}
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
