'use client';

import React from 'react';
import { useResumeStore } from '@/lib/resume/store';
import { FontFamily, PageSize, TemplateId } from '@/types/resume';

export default function AdvancedSettingsControl() {
  const { resume, updateSettings, setTemplate } = useResumeStore();
  const { settings } = resume;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Template & Page Dimensions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '3px' }}>
            Template Design
          </label>
          <select
            value={settings.template}
            onChange={(e) => setTemplate(e.target.value as TemplateId)}
            style={{
              width: '100%',
              padding: '7px 9px',
              borderRadius: '6px',
              border: '1px solid #E4E4E7',
              fontSize: '12px',
              outline: 'none',
              background: '#FFFFFF',
            }}
          >
            <option value="classic">Template 1 — Classic ATS (Sohan Sethi Serif)</option>
            <option value="modern">Template 2 — Modern ATS (Inter Sans)</option>
            <option value="technical">Template 3 — Technical (Arial Compact)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '3px' }}>
            Paper Format
          </label>
          <select
            value={settings.pageSize}
            onChange={(e) => updateSettings({ pageSize: e.target.value as PageSize })}
            style={{
              width: '100%',
              padding: '7px 9px',
              borderRadius: '6px',
              border: '1px solid #E4E4E7',
              fontSize: '12px',
              outline: 'none',
              background: '#FFFFFF',
            }}
          >
            <option value="a4">A4 (210 × 297 mm — Global Standard)</option>
            <option value="letter">US Letter (8.5 × 11 in — North America)</option>
          </select>
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '3px' }}>
          Typography (ATS Safe System Fonts)
        </label>
        <select
          value={settings.fontFamily}
          onChange={(e) => updateSettings({ fontFamily: e.target.value as FontFamily })}
          style={{
            width: '100%',
            padding: '7px 9px',
            borderRadius: '6px',
            border: '1px solid #E4E4E7',
            fontSize: '12px',
            outline: 'none',
            background: '#FFFFFF',
          }}
        >
          <option value="Times New Roman">Times New Roman (Academic & Consulting Standard)</option>
          <option value="Georgia">Georgia (Clean High-Readability Serif)</option>
          <option value="Arial">Arial (Standard Clean Sans-Serif)</option>
          <option value="Helvetica">Helvetica (Modern Crisp Sans-Serif)</option>
          <option value="Inter">Inter (Contemporary High-Tech Sans)</option>
        </select>
      </div>

      {/* Controlled Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46' }}>Body Font Size</label>
            <span style={{ fontSize: '11px', fontWeight: 800 }}>{settings.fontSize} pt</span>
          </div>
          <input
            type="range"
            min="9.25"
            max="11"
            step="0.25"
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: '#000000' }}
          />
          <span style={{ fontSize: '9.5px', color: '#71717A' }}>ATS safe range: 9.5 – 10.5 pt</span>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46' }}>Section Headings</label>
            <span style={{ fontSize: '11px', fontWeight: 800 }}>{settings.headingSize} pt</span>
          </div>
          <input
            type="range"
            min="10.5"
            max="13"
            step="0.5"
            value={settings.headingSize}
            onChange={(e) => updateSettings({ headingSize: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: '#000000' }}
          />
          <span style={{ fontSize: '9.5px', color: '#71717A' }}>ATS safe range: 11 – 12.5 pt</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46' }}>Section Spacing</label>
            <span style={{ fontSize: '11px', fontWeight: 800 }}>{settings.sectionSpacing} px</span>
          </div>
          <input
            type="range"
            min="4"
            max="14"
            step="1"
            value={settings.sectionSpacing}
            onChange={(e) => updateSettings({ sectionSpacing: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#000000' }}
          />
          <span style={{ fontSize: '9.5px', color: '#71717A' }}>Compact: 6 – 10 px</span>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46' }}>Vertical Margin</label>
            <span style={{ fontSize: '11px', fontWeight: 800 }}>{settings.marginVertical} in</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="0.65"
            step="0.05"
            value={settings.marginVertical}
            onChange={(e) => updateSettings({ marginVertical: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: '#000000' }}
          />
          <span style={{ fontSize: '9.5px', color: '#71717A' }}>Standard: 0.45 – 0.55 in</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
        <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#18181B', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="checkbox"
            checked={settings.showSectionDividers}
            onChange={(e) => updateSettings({ showSectionDividers: e.target.checked })}
          />
          Thin Horizontal Underline
        </label>

        <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#18181B', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="checkbox"
            checked={settings.uppercaseHeadings}
            onChange={(e) => updateSettings({ uppercaseHeadings: e.target.checked })}
          />
          Uppercase Headings
        </label>
      </div>
    </div>
  );
}
