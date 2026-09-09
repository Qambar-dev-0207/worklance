'use client';

import React from 'react';
import { useResumeStore } from '@/lib/resume/store';

export default function PersonalInfoEditor() {
  const { resume, updatePersonal } = useResumeStore();
  const { personal } = resume;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '3px' }}>
            Full Name (Uppercase)
          </label>
          <input
            type="text"
            value={personal.fullName}
            onChange={(e) => updatePersonal({ fullName: e.target.value })}
            placeholder="e.g. SOHAN SETHI"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #E4E4E7',
              fontSize: '12.5px',
              outline: 'none',
              fontWeight: 600,
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '3px' }}>
            Target Role / Title
          </label>
          <input
            type="text"
            value={personal.targetTitle}
            onChange={(e) => updatePersonal({ targetTitle: e.target.value })}
            placeholder="e.g. Business Analyst"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #E4E4E7',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '3px' }}>
            Email Address
          </label>
          <input
            type="email"
            value={personal.email}
            onChange={(e) => updatePersonal({ email: e.target.value })}
            placeholder="e.g. sohan.sethi@example.com"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #E4E4E7',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '3px' }}>
            Phone Number
          </label>
          <input
            type="text"
            value={personal.phone}
            onChange={(e) => updatePersonal({ phone: e.target.value })}
            placeholder="e.g. +1 (312) 555-0199"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #E4E4E7',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '3px' }}>
            City, State / Country
          </label>
          <input
            type="text"
            value={personal.location}
            onChange={(e) => updatePersonal({ location: e.target.value })}
            placeholder="e.g. Chicago, IL"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #E4E4E7',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '3px' }}>
            LinkedIn (Handle or URL)
          </label>
          <input
            type="text"
            value={personal.linkedIn}
            onChange={(e) => updatePersonal({ linkedIn: e.target.value })}
            placeholder="e.g. linkedin.com/in/sohansethi"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #E4E4E7',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '3px' }}>
            GitHub (Handle or URL)
          </label>
          <input
            type="text"
            value={personal.github}
            onChange={(e) => updatePersonal({ github: e.target.value })}
            placeholder="e.g. github.com/sohansethi"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #E4E4E7',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '3px' }}>
            Portfolio URL (Optional)
          </label>
          <input
            type="text"
            value={personal.portfolio}
            onChange={(e) => updatePersonal({ portfolio: e.target.value })}
            placeholder="e.g. sohansethi.dev"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #E4E4E7',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}
