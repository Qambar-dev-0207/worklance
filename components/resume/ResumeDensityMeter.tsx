'use client';

import React from 'react';
import { useResumeStore } from '@/lib/resume/store';
import { evaluateResumeDensity } from '@/lib/resume/autoFit';

export default function ResumeDensityMeter() {
  const { contentHeightPx, resume, autoFitToOnePage } = useResumeStore();
  const density = evaluateResumeDensity(contentHeightPx, resume.settings.pageSize);

  const getBarColor = () => {
    if (density.densityStatus === 'low') return '#3B82F6';
    if (density.densityStatus === 'optimal') return '#10B981';
    if (density.densityStatus === 'dense') return '#F59E0B';
    return '#EF4444';
  };

  const getStatusBadge = () => {
    if (density.densityStatus === 'low') return 'Low Content';
    if (density.densityStatus === 'optimal') return '100% Recruiter Ready';
    if (density.densityStatus === 'dense') return 'Borderline Fit';
    return `+${density.overflowPercentage}% Overflow`;
  };

  return (
    <div
      className="no-print"
      style={{
        background: '#18181B',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '12px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        color: '#FFFFFF',
      }}
    >
      <div style={{ minWidth: '130px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: 600 }}>PAGE 1 DENSITY</span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: getBarColor() }}>
            {density.fillPercentage}%
          </span>
        </div>

        {/* Meter progress bar */}
        <div
          style={{
            height: '6px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '100px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(density.fillPercentage, 100)}%`,
              background: getBarColor(),
              transition: 'width 0.3s ease, background 0.3s ease',
              borderRadius: '100px',
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span
            style={{
              background: getBarColor(),
              color: '#000000',
              fontSize: '10px',
              fontWeight: 800,
              padding: '1px 7px',
              borderRadius: '100px',
              textTransform: 'uppercase',
            }}
          >
            {getStatusBadge()}
          </span>
          <span style={{ fontSize: '11px', color: '#E4E4E7', fontWeight: 600 }}>
            {density.isOverflowing ? 'Spills onto Page 2' : 'Fits Cleanly on 1 Page'}
          </span>
        </div>
        <p style={{ fontSize: '10.5px', color: '#A1A1AA', margin: 0, lineHeight: 1.3 }}>
          {density.recommendation}
        </p>
      </div>

      {density.isOverflowing && (
        <button
          onClick={() => autoFitToOnePage(density.overflowPercentage)}
          style={{
            background: '#FFFFFF',
            color: '#000000',
            fontWeight: 800,
            fontSize: '11.5px',
            padding: '6px 14px',
            borderRadius: '100px',
            cursor: 'pointer',
            border: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(255,255,255,0.2)',
          }}
          title="Micro-adjusts vertical spacing and margins within ATS tolerances to snap resume onto 1 page"
        >
          ⚡ Auto-Fit to 1 Page
        </button>
      )}
    </div>
  );
}
