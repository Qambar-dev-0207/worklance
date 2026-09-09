'use client';

import React, { useState } from 'react';
import { POWER_VERBS } from '@/lib/resume/verbEngine';

interface FormulaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHEATSHEET_EXAMPLES = [
  {
    role: 'Software Developer',
    before: 'Worked on web application development.',
    after: 'Built & deployed a customer self-service dashboard using React and Node.js, reducing support dependency by 28%.',
  },
  {
    role: 'Product Manager',
    before: 'Worked with teams to launch features.',
    after: 'Led the launch of a user-requested analytics feature, driving a 17% increase in active feature usage across 45K MAUs.',
  },
  {
    role: 'Data Analyst',
    before: 'Created reports and dashboards.',
    after: 'Automated weekly ETL and reporting pipelines using SQL and Tableau, improving processing speed and cutting reporting time by 94%.',
  },
  {
    role: 'UI/UX Designer',
    before: 'Designed website pages.',
    after: 'Enhanced user onboarding flow through targeted Figma prototypes, increasing signup completion by 23%.',
  },
  {
    role: 'Marketing',
    before: 'Managed social media accounts.',
    after: 'Drove 42% engagement growth in 3 months with short-form technical content, generating 84K+ organic followers.',
  },
  {
    role: 'Sales Executive',
    before: 'Handled client relationships and sales.',
    after: 'Prospected & closed new enterprise opportunities, generating $2M in quarterly sales revenue.',
  },
  {
    role: 'Recruiter / HR',
    before: 'Managed recruitment process.',
    after: 'Optimized technical recruiting pipelines, cutting average time-to-hire from 45 to 28 days.',
  },
  {
    role: 'Accountant',
    before: 'Managed company finances and reports.',
    after: 'Implemented automated reconciliation processes in Python, reducing month-end closing time by 35%.',
  },
];

export default function FormulaGuideModal({ isOpen, onClose }: FormulaGuideModalProps) {
  const [copiedVerb, setCopiedVerb] = useState('');

  if (!isOpen) return null;

  const handleCopyVerb = (verb: string) => {
    navigator.clipboard.writeText(verb);
    setCopiedVerb(verb);
    setTimeout(() => setCopiedVerb(''), 1800);
  };

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#09090B',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          padding: '32px',
          width: '100%',
          maxWidth: '700px',
          color: '#FFFFFF',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              RECRUITER CHEATSHEET & FORMULA
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '2px 0 0 0' }}>
              Action + Impact + Metric Formula
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '22px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Formula Box */}
        <div
          style={{
            background: '#18181B',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '11px', color: '#60A5FA', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
            The Winning ATS Bullet Formula:
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
            👉 [Power Verb] + [Action] + [Method/Technology] + [Business/Technical Impact] + [Metric]
          </div>
          <p style={{ fontSize: '12px', color: '#A1A1AA', margin: 0, lineHeight: 1.4 }}>
            <em>"Responsibilities tell recruiters what your job was. Achievements tell recruiters why they should hire you."</em>
          </p>
        </div>

        {/* 25 Power Verbs Grid */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#A1A1AA' }}>
              25+ High-Impact Action Verbs (Click to copy)
            </span>
            {copiedVerb && (
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>
                Copied "{copiedVerb}"!
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {POWER_VERBS.map((verb) => (
              <button
                key={verb}
                onClick={() => handleCopyVerb(verb)}
                style={{
                  background: '#111115',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#E4E4E7',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 9px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Click to copy"
              >
                {verb}
              </button>
            ))}
          </div>
        </div>

        {/* Role Before vs After Examples */}
        <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#A1A1AA', marginBottom: '10px' }}>
          Role-Specific Before vs After Transformations
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {CHEATSHEET_EXAMPLES.map((ex, i) => (
            <div
              key={i}
              style={{
                background: '#111115',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '10px 14px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#A1A1AA', marginBottom: '4px' }}>
                {ex.role}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px', lineHeight: 1.35 }}>
                <div style={{ color: '#F87171' }}>
                  <span style={{ fontWeight: 700 }}>✕ Before: </span>
                  {ex.before}
                </div>
                <div style={{ color: '#34D399' }}>
                  <span style={{ fontWeight: 700 }}>✓ After: </span>
                  {ex.after}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            background: '#FFFFFF',
            color: '#000000',
            fontWeight: 800,
            fontSize: '13px',
            padding: '12px',
            borderRadius: '100px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Got It
        </button>
      </div>
    </div>
  );
}
