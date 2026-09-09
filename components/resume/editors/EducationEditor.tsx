'use client';

import React from 'react';
import { useResumeStore } from '@/lib/resume/store';

export default function EducationEditor() {
  const { resume, addEducation, updateEducation, removeEducation } = useResumeStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#71717A', fontWeight: 600 }}>
          University degrees, GPA, and relevant coursework
        </span>
        <button
          type="button"
          onClick={() => addEducation()}
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
          + Add Education
        </button>
      </div>

      {resume.education.map((edu, idx) => (
        <div
          key={edu.id}
          style={{
            background: '#F8F8F9',
            border: '1px solid #E4E4E7',
            borderRadius: '10px',
            padding: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#71717A' }}>
              ENTRY #{idx + 1}
            </span>
            {resume.education.length > 1 && (
              <button
                type="button"
                onClick={() => removeEducation(edu.id)}
                style={{ color: '#EF4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'none' }}
              >
                ✕ Remove
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '2px' }}>
                University / Institution Name (Bold)
              </label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                placeholder="e.g. University of Illinois at Chicago"
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
                Graduation Date (Right-aligned)
              </label>
              <input
                type="text"
                value={edu.graduationDate}
                onChange={(e) => updateEducation(edu.id, { graduationDate: e.target.value })}
                placeholder="e.g. Jan 2022 – May 2023"
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

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.6fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '2px' }}>
                Degree Name (Italics)
              </label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                placeholder="e.g. Master of Science in Business Analytics"
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
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '2px' }}>
                Campus Location (Italics)
              </label>
              <input
                type="text"
                value={edu.location}
                onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                placeholder="e.g. Chicago, IL"
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
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '2px' }}>
                GPA (Optional)
              </label>
              <input
                type="text"
                value={edu.gpa || ''}
                onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                placeholder="3.91/4.0"
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

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '2px' }}>
              Relevant Coursework (Comma-separated)
            </label>
            <input
              type="text"
              value={edu.coursework || ''}
              onChange={(e) => updateEducation(edu.id, { coursework: e.target.value })}
              placeholder="e.g. Data Mining, Statistics, Healthcare Analytics, Strategy Consulting"
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
      ))}
    </div>
  );
}
