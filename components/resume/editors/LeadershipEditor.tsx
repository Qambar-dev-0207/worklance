'use client';

import React from 'react';
import { useResumeStore } from '@/lib/resume/store';

export default function LeadershipEditor() {
  const { resume, addSimpleItem, updateSimpleItem, removeSimpleItem } = useResumeStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#71717A', fontWeight: 600 }}>
          Compact leadership roles, university awards, and volunteering initiatives
        </span>
        <button
          type="button"
          onClick={() => addSimpleItem('leadership')}
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
          + Add Item
        </button>
      </div>

      {resume.leadership.map((item, idx) => (
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
            onChange={(e) => updateSimpleItem('leadership', item.id, e.target.value)}
            placeholder="e.g. Nominated for Chancellor's Award for academic excellence and outstanding contribution..."
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
          {resume.leadership.length > 1 && (
            <button
              type="button"
              onClick={() => removeSimpleItem('leadership', item.id)}
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
          )}
        </div>
      ))}
    </div>
  );
}
