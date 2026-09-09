'use client';

import React from 'react';
import { useResumeStore } from '@/lib/resume/store';

export default function SkillsEditor() {
  const { resume, addSkillCategory, updateSkillCategory, removeSkillCategory } = useResumeStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#71717A', fontWeight: 600 }}>
          Categorized text-based skills (zero ATS-breaking skill bars)
        </span>
        <button
          type="button"
          onClick={() => addSkillCategory()}
          style={{
            background: '#000000',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '100px',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          + Add Category
        </button>
      </div>

      {resume.skills.map((cat, idx) => (
        <div
          key={cat.id}
          style={{
            background: '#F8F8F9',
            border: '1px solid #E4E4E7',
            borderRadius: '10px',
            padding: '10px 12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#71717A' }}>
              CATEGORY #{idx + 1}
            </span>
            {resume.skills.length > 1 && (
              <button
                type="button"
                onClick={() => removeSkillCategory(cat.id)}
                style={{ color: '#EF4444', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'none' }}
              >
                ✕ Remove
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '2px' }}>
                Category Name (Bold)
              </label>
              <input
                type="text"
                value={cat.categoryName}
                onChange={(e) => updateSkillCategory(cat.id, { categoryName: e.target.value })}
                placeholder="e.g. Programming Languages"
                style={{
                  width: '100%',
                  padding: '7px 9px',
                  borderRadius: '6px',
                  border: '1px solid #E4E4E7',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '2px' }}>
                Skills List (Comma-separated)
              </label>
              <input
                type="text"
                value={cat.skillsList}
                onChange={(e) => updateSkillCategory(cat.id, { skillsList: e.target.value })}
                placeholder="e.g. SQL, Python, R, Java, SAS"
                style={{
                  width: '100%',
                  padding: '7px 9px',
                  borderRadius: '6px',
                  border: '1px solid #E4E4E7',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
