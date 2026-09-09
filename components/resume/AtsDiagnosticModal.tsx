'use client';

import React from 'react';
import { useResumeStore } from '@/lib/resume/store';
import { computeAtsDiagnosticScore } from '@/lib/resume/atsValidator';

interface AtsDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AtsDiagnosticModal({ isOpen, onClose }: AtsDiagnosticModalProps) {
  const { resume } = useResumeStore();

  if (!isOpen) return null;

  const score = computeAtsDiagnosticScore(resume);

  const categories = [
    { name: 'ATS Compatibility', val: score.atsCompatibility, desc: 'Single-column structure, standard headings, machine-readable text' },
    { name: 'Keyword Match', val: score.keywordMatch, desc: 'Categorized technical competencies and domain alignment' },
    { name: 'Achievement Strength', val: score.achievementStrength, desc: 'Action verbs leading accomplishments rather than task descriptions' },
    { name: 'Quantification', val: score.quantification, desc: 'Measurable evidence: %, $, time, scale, volume, and throughput' },
    { name: 'Readability', val: score.readability, desc: 'Typography hierarchy, line length (85–115 chars), hanging indents' },
    { name: 'Formatting', val: score.formatting, desc: 'Consistent date em-dashes, dividers, and right-aligned baselines' },
    { name: 'Relevance', val: score.relevance, desc: 'Tailored terminology aligned with target career path' },
    { name: 'Conciseness', val: score.conciseness, desc: 'Zero filler words, dense high-impact bullet points' },
  ];

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
          maxWidth: '680px',
          color: '#FFFFFF',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              RECRUITER & ATS BENCHMARK DIAGNOSTIC
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '2px 0 0 0' }}>
              Resume Quality Scorecard
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '22px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Overall Score Banner */}
        <div
          style={{
            background: '#18181B',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '24px',
          }}
        >
          <div style={{ textAlign: 'center', minWidth: '100px' }}>
            <div style={{ fontSize: '46px', fontWeight: 900, lineHeight: 1, color: score.overallScore >= 90 ? '#10B981' : '#F59E0B' }}>
              {score.overallScore}
            </div>
            <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: 700, marginTop: '4px' }}>OVERALL SCORE</div>
          </div>

          <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              {score.overallScore >= 90 ? '✓ Top 5% ATS Compliant' : 'Diagnostic Feedback Active'}
            </div>
            <p style={{ fontSize: '12px', color: '#A1A1AA', margin: 0, lineHeight: 1.45 }}>
              Detected <strong>{score.powerVerbsCount} power verbs</strong> and <strong>{score.metricsDetectedCount} quantified metrics</strong>.
              Presented as a resume-quality diagnostic, not a hiring guarantee.
            </p>
          </div>
        </div>

        {/* Repetitive Verbs Alert if any */}
        {score.repetitiveVerbs.length > 0 && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#FCA5A5',
              fontSize: '12.5px',
            }}
          >
            <strong>⚠ Repetitive Bullet Openings:</strong> The verbs {score.repetitiveVerbs.map(v => `"${v}"`).join(', ')} appear multiple times. Consider varying with synonyms like <em>Architected</em>, <em>Engineered</em>, <em>Automated</em>, or <em>Spearheaded</em>.
          </div>
        )}

        {/* 8-Category Grid */}
        <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', color: '#A1A1AA' }}>
          Diagnostic Breakdown
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          {categories.map((c) => (
            <div
              key={c.name}
              style={{
                background: '#111115',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#E4E4E7' }}>{c.name}</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: c.val >= 90 ? '#10B981' : '#F59E0B' }}>
                  {c.val}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#71717A', lineHeight: 1.35 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* Actionable Recommendations */}
        <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', color: '#A1A1AA' }}>
          Actionable Suggestions
        </div>

        <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', fontSize: '12.5px', color: '#D4D4D8', lineHeight: 1.6 }}>
          {score.suggestions.map((sug, i) => (
            <li key={i} style={{ marginBottom: '6px' }}>{sug}</li>
          ))}
        </ul>

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
          Close Scorecard
        </button>
      </div>
    </div>
  );
}
