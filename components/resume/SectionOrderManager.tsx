'use client';

import React from 'react';
import { useResumeStore } from '@/lib/resume/store';
import { SectionKey } from '@/types/resume';

const SECTION_LABELS: Record<SectionKey, string> = {
  summary: 'Professional Summary',
  education: 'Education',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  leadership: 'Leadership & Awards',
  certifications: 'Certifications',
  achievements: 'Achievements',
  publications: 'Publications',
  extracurricular: 'Extracurricular Activities',
};

export default function SectionOrderManager() {
  const { resume, moveSection, toggleSectionVisibility, reorderSections } = useResumeStore();
  const { sectionOrder, sectionVisibility } = resume;

  const handleStudentOrder = () => {
    reorderSections([
      'education',
      'skills',
      'projects',
      'experience',
      'leadership',
      'certifications',
      'achievements',
      'publications',
      'extracurricular',
    ]);
  };

  const handleExperiencedOrder = () => {
    reorderSections([
      'summary',
      'experience',
      'skills',
      'projects',
      'education',
      'leadership',
      'certifications',
      'achievements',
      'publications',
      'extracurricular',
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '11.5px', color: '#71717A', fontWeight: 600 }}>
          Reorder sections & manage visibility
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={handleStudentOrder}
            style={{
              background: '#F4F4F5',
              border: '1px solid #E4E4E7',
              color: '#18181B',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            title="Puts Education before Experience for freshers & students"
          >
            🎓 Student Order
          </button>
          <button
            type="button"
            onClick={handleExperiencedOrder}
            style={{
              background: '#F4F4F5',
              border: '1px solid #E4E4E7',
              color: '#18181B',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            title="Puts Experience before Education for seasoned professionals"
          >
            💼 Experienced Order
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {sectionOrder.map((key, index) => {
          const isVisible = sectionVisibility ? sectionVisibility[key] : true;
          return (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: isVisible ? '#FFFFFF' : '#F4F4F5',
                border: '1px solid #E4E4E7',
                borderRadius: '8px',
                padding: '6px 10px',
                opacity: isVisible ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => toggleSectionVisibility(key, e.target.checked)}
                />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#18181B' }}>
                  {SECTION_LABELS[key]}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveSection('up', key)}
                  style={{
                    background: index === 0 ? '#F4F4F5' : '#18181B',
                    color: index === 0 ? '#A1A1AA' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    width: '24px',
                    height: '24px',
                    fontSize: '11px',
                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Move section up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={index === sectionOrder.length - 1}
                  onClick={() => moveSection('down', key)}
                  style={{
                    background: index === sectionOrder.length - 1 ? '#F4F4F5' : '#18181B',
                    color: index === sectionOrder.length - 1 ? '#A1A1AA' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    width: '24px',
                    height: '24px',
                    fontSize: '11px',
                    cursor: index === sectionOrder.length - 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Move section down"
                >
                  ▼
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
