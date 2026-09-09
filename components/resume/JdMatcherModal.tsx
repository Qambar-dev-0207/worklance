'use client';

import React, { useState } from 'react';
import { useResumeStore } from '@/lib/resume/store';
import { analyzeJobDescription } from '@/lib/resume/jdMatcher';

interface JdMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JdMatcherModal({ isOpen, onClose }: JdMatcherModalProps) {
  const { resume, applyJdTailoring } = useResumeStore();
  const [jdText, setJdText] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isTailoring, setIsTailoring] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  if (!isOpen) return null;

  const handleAnalyze = () => {
    if (!jdText || jdText.trim().length < 20) {
      alert('Please paste at least a few sentences of the job description.');
      return;
    }
    const res = analyzeJobDescription(jdText, resume);
    setAnalysis(res);
  };

  const handleTailor = () => {
    if (!analysis) {
      const res = analyzeJobDescription(jdText, resume);
      setAnalysis(res);
      applyJdTailoring(res, companyName);
    } else {
      applyJdTailoring(analysis, companyName);
    }

    setIsTailoring(true);
    setTimeout(() => {
      setIsTailoring(false);
      setSuccessBanner('✓ Resume tailored! Targeted summary generated and skills prioritized.');
      setTimeout(() => {
        setSuccessBanner('');
        onClose();
      }, 2000);
    }, 600);
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
          maxWidth: '680px',
          color: '#FFFFFF',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              TARGETED ROLE INTELLIGENCE
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '2px 0 0 0' }}>
              Job Description Matcher & Tailor
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '22px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '12.5px', color: '#A1A1AA', lineHeight: 1.4, margin: '0 0 16px 0' }}>
          Paste the target job description. The AI analyzes requirements, computes keyword match percentage, and tailors your professional summary and skill ordering without falsifying your real experience.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#D4D4D8', display: 'block', marginBottom: '4px' }}>
              Target Company Name (Optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Google, McKinsey, Health Care Service Corp"
              style={{
                width: '100%',
                background: '#18181B',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#FFFFFF',
                fontSize: '12.5px',
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#D4D4D8', display: 'block', marginBottom: '4px' }}>
              Action
            </label>
            <button
              onClick={handleAnalyze}
              style={{
                width: '100%',
                background: '#27272A',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔍 Analyze JD
            </button>
          </div>
        </div>

        <textarea
          rows={6}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste full job description requirements, qualifications, and role responsibilities here..."
          style={{
            width: '100%',
            background: '#111115',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '12px',
            color: '#FFFFFF',
            fontSize: '12.5px',
            outline: 'none',
            marginBottom: '16px',
            lineHeight: 1.4,
            resize: 'vertical',
          }}
        />

        {successBanner && (
          <div style={{ background: '#064E3B', color: '#6EE7B7', padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, marginBottom: '14px', textAlign: 'center' }}>
            {successBanner}
          </div>
        )}

        {analysis && (
          <div style={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#A1A1AA', textTransform: 'uppercase', fontWeight: 700 }}>ATS Keyword Alignment</span>
                <div style={{ fontSize: '15px', fontWeight: 800 }}>Role: {analysis.targetRole}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '32px', fontWeight: 900, color: analysis.matchScore >= 80 ? '#10B981' : '#F59E0B' }}>
                  {analysis.matchScore}%
                </span>
                <div style={{ fontSize: '10px', color: '#A1A1AA', fontWeight: 700 }}>ATS MATCH</div>
              </div>
            </div>

            {/* Matched Keywords */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                ✓ Matched Keywords Detected in Your Experience:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {analysis.matchedKeywords.map((kw: string) => (
                  <span
                    key={kw}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#A7F3D0',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing / Weak Keywords */}
            {analysis.missingKeywords.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  △ Missing / High-Priority JD Keywords:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {analysis.missingKeywords.map((kw: string) => (
                    <span
                      key={kw}
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#FDE68A',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      △ {kw}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: '10.5px', color: '#71717A', margin: '6px 0 0 0' }}>
                  Only add missing keywords if you have genuine academic or project exposure with them.
                </p>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleTailor}
            disabled={isTailoring}
            style={{
              flex: 1,
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
            {isTailoring ? '⚡ Tailoring Resume...' : '⚡ Tailor Resume to this JD'}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '100px',
              padding: '12px 20px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
