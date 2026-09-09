'use client';

import React from 'react';
import { useResumeStore } from '@/lib/resume/store';
import { runAtsValidation } from '@/lib/resume/atsValidator';

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChecklistModal({ isOpen, onClose }: ChecklistModalProps) {
  const { resume } = useResumeStore();

  if (!isOpen) return null;

  const checks = runAtsValidation(resume);
  const passedCount = checks.filter((c) => c.passed).length;
  const isAtsReady = passedCount === checks.length;

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
          maxWidth: '620px',
          color: '#FFFFFF',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              PRE-EXPORT ATS COMPLIANCE AUDIT
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '2px 0 0 0' }}>
              10-Point ATS Verification
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '22px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Readiness Badge Banner */}
        <div
          style={{
            background: isAtsReady ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${isAtsReady ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: isAtsReady ? '#34D399' : '#FCD34D' }}>
              {isAtsReady ? '✓ 100% ATS READY FOR EXPORT' : '⚠ ATS Action Items Found'}
            </div>
            <div style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '2px' }}>
              {passedCount} of {checks.length} compliance benchmarks satisfied.
            </div>
          </div>
          <div
            style={{
              background: isAtsReady ? '#10B981' : '#F59E0B',
              color: '#000000',
              fontWeight: 900,
              fontSize: '12px',
              padding: '6px 14px',
              borderRadius: '100px',
            }}
          >
            {isAtsReady ? 'APPROVED' : 'IN REVIEW'}
          </div>
        </div>

        {/* Checks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {checks.map((chk) => (
            <div
              key={chk.id}
              style={{
                background: '#111115',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  color: chk.passed ? '#10B981' : '#EF4444',
                  fontSize: '16px',
                  fontWeight: 800,
                  marginTop: '-1px',
                }}
              >
                {chk.passed ? '✓' : '✕'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{chk.title}</div>
                <div style={{ fontSize: '11.5px', color: '#A1A1AA', marginTop: '2px', lineHeight: 1.35 }}>
                  {chk.description}
                </div>
                {!chk.passed && chk.fixSuggestion && (
                  <div style={{ fontSize: '11px', color: '#FCD34D', marginTop: '4px', fontWeight: 600 }}>
                    Fix: {chk.fixSuggestion}
                  </div>
                )}
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
