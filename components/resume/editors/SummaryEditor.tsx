'use client';

import React from 'react';
import { useResumeStore } from '@/lib/resume/store';
import { generateProfessionalSummary } from '@/lib/resume/summaryGenerator';

export default function SummaryEditor() {
  const { resume, updateSummary } = useResumeStore();

  const handleGenerateSummary = () => {
    const generated = generateProfessionalSummary({
      resumeData: resume,
      targetRole: resume.personal.targetTitle,
    });
    updateSummary(generated, true);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <label
          style={{
            fontSize: '12.5px',
            fontWeight: 700,
            color: '#18181B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <input
            type="checkbox"
            checked={resume.showSummary}
            onChange={(e) => updateSummary(resume.summary, e.target.checked)}
          />
          Include Professional Summary (2–4 lines)
        </label>

        <button
          type="button"
          onClick={handleGenerateSummary}
          style={{
            background: '#000000',
            color: '#FFFFFF',
            fontSize: '11.5px',
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: '100px',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          ✨ Auto-Generate Tailored Summary
        </button>
      </div>

      {resume.showSummary && (
        <div>
          <textarea
            rows={4}
            value={resume.summary}
            onChange={(e) => updateSummary(e.target.value)}
            placeholder="Targeted 2-4 line executive summary highlighting target role, key skills, and strongest evidence..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #E4E4E7',
              fontSize: '12.5px',
              lineHeight: 1.45,
              outline: 'none',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#71717A',
              marginTop: '4px',
            }}
          >
            <span>Target: 2–4 lines max. Avoid generic clichés.</span>
            <span>{resume.summary.length} characters</span>
          </div>
        </div>
      )}
    </div>
  );
}
