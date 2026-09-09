'use client';

import React from 'react';
import { useResumeStore } from '@/lib/resume/store';
import { SectionKey } from '@/types/resume';

interface AdditionalSectionsEditorProps {
  sectionKey: 'certifications' | 'achievements' | 'publications' | 'extracurricular';
  title: string;
}

export default function AdditionalSectionsEditor({ sectionKey, title }: AdditionalSectionsEditorProps) {
  const { resume, addSimpleItem, updateSimpleItem, removeSimpleItem, toggleSectionVisibility } = useResumeStore();

  const isVisible = resume.sectionVisibility ? resume.sectionVisibility[sectionKey] : true;
  const items = (resume[sectionKey] as any[]) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#18181B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => toggleSectionVisibility(sectionKey, e.target.checked)}
          />
          Show {title} on Resume
        </label>

        {isVisible && (
          <button
            type="button"
            onClick={() => addSimpleItem(sectionKey)}
            style={{
              background: '#000000',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '100px',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            + Add Entry
          </button>
        )}
      </div>

      {isVisible && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item, idx) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
                background: '#F8F8F9',
                border: '1px solid #E4E4E7',
                borderRadius: '8px',
                padding: '8px 10px',
              }}
            >
              <span style={{ fontSize: '14px', color: '#71717A', marginTop: '2px' }}>•</span>
              <textarea
                rows={2}
                value={item.text}
                onChange={(e) => updateSimpleItem(sectionKey, item.id, e.target.value)}
                placeholder={`Enter ${title.toLowerCase()} item...`}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '12px',
                  lineHeight: 1.4,
                  resize: 'vertical',
                }}
              />
              <button
                type="button"
                onClick={() => removeSimpleItem(sectionKey, item.id)}
                style={{
                  color: '#EF4444',
                  fontSize: '12px',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ fontSize: '11.5px', color: '#71717A', fontStyle: 'italic' }}>
              No entries added. Click "+ Add Entry" to include items.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
