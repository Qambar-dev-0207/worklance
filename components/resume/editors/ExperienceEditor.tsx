'use client';

import React, { useState } from 'react';
import { useResumeStore } from '@/lib/resume/store';
import { detectMetrics } from '@/lib/resume/metricEngine';
import { analyzeBulletVerb } from '@/lib/resume/verbEngine';

export default function ExperienceEditor() {
  const {
    resume,
    addExperience,
    updateExperience,
    removeExperience,
    addExperienceBullet,
    updateExperienceBullet,
    removeExperienceBullet,
    improveExperienceBullet,
  } = useResumeStore();

  const [activeSuggestionBulletId, setActiveSuggestionBulletId] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#71717A', fontWeight: 600 }}>
          Quantified accomplishments following Action + Impact + Metric
        </span>
        <button
          type="button"
          onClick={() => addExperience()}
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
          + Add Role
        </button>
      </div>

      {resume.experience.map((exp, expIdx) => (
        <div
          key={exp.id}
          style={{
            background: '#F8F8F9',
            border: '1px solid #E4E4E7',
            borderRadius: '12px',
            padding: '14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#71717A' }}>
              ROLE #{expIdx + 1}
            </span>
            {resume.experience.length > 1 && (
              <button
                type="button"
                onClick={() => removeExperience(exp.id)}
                style={{ color: '#EF4444', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'none' }}
              >
                ✕ Remove Role
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '2px' }}>
                Company Name (Bold)
              </label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                placeholder="e.g. Health Care Service Corporation"
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
                Duration (Right-aligned)
              </label>
              <input
                type="text"
                value={`${exp.startDate}${exp.endDate ? ` – ${exp.endDate}` : ''}`}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes('–') || val.includes('-')) {
                    const [s, end] = val.split(/[–-]/);
                    updateExperience(exp.id, { startDate: s.trim(), endDate: end.trim() });
                  } else {
                    updateExperience(exp.id, { startDate: val, endDate: '' });
                  }
                }}
                placeholder="e.g. Aug 2023 – Present"
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

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '2px' }}>
                Job Title (Italics)
              </label>
              <input
                type="text"
                value={exp.role}
                onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                placeholder="e.g. Business Analyst II"
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
                Location (Italics)
              </label>
              <input
                type="text"
                value={exp.location}
                onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
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
          </div>

          {/* Bullets List */}
          <div style={{ borderTop: '1px solid #E4E4E7', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#27272A', textTransform: 'uppercase' }}>
                Achievement Bullets ({exp.bullets.length})
              </label>
              <button
                type="button"
                onClick={() => addExperienceBullet(exp.id)}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#000000',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
              >
                + Add Bullet
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {exp.bullets.map((b, bIdx) => {
                const metricResult = detectMetrics(b.text);
                const verbResult = analyzeBulletVerb(b.text);

                return (
                  <div
                    key={b.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E4E4E7',
                      borderRadius: '8px',
                      padding: '8px 10px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '14px', color: '#71717A', marginTop: '2px' }}>•</span>
                      <textarea
                        rows={2}
                        value={b.text}
                        onChange={(e) => updateExperienceBullet(exp.id, b.id, e.target.value)}
                        placeholder="[Power Verb] + [Action] + [Method/Tech] + [Business Impact] + [Metric]"
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          fontSize: '12px',
                          lineHeight: 1.4,
                          resize: 'vertical',
                          fontFamily: 'inherit',
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => improveExperienceBullet(exp.id, b.id)}
                          style={{
                            background: '#000000',
                            color: '#FFFFFF',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '100px',
                            cursor: 'pointer',
                            border: 'none',
                            whiteSpace: 'nowrap',
                          }}
                          title="Eliminates weak starters, enforces 25 Power Verbs, and prompts for metrics"
                        >
                          ✨ Improve
                        </button>
                        {exp.bullets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExperienceBullet(exp.id, b.id)}
                            style={{
                              color: '#A1A1AA',
                              fontSize: '11px',
                              cursor: 'pointer',
                              border: 'none',
                              background: 'none',
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Metric Intelligence Badges & Suggestions */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '6px',
                        paddingTop: '6px',
                        borderTop: '1px dashed #F4F4F5',
                        fontSize: '10.5px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {/* Power Verb badge */}
                        <span
                          style={{
                            background: verbResult.isPowerVerb ? '#ECFDF5' : '#FEF3C7',
                            color: verbResult.isPowerVerb ? '#065F46' : '#92400E',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: 700,
                          }}
                        >
                          {verbResult.isPowerVerb ? `✓ Verb: ${verbResult.firstWord}` : `⚠ Weak: ${verbResult.firstWord || 'None'}`}
                        </span>

                        {/* Detected Metrics */}
                        {metricResult.hasMetric ? (
                          metricResult.detectedMetrics.map((m, mIdx) => (
                            <span
                              key={mIdx}
                              style={{
                                background: '#ECFDF5',
                                color: '#047857',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: 700,
                              }}
                            >
                              ✓ Metric: {m}
                            </span>
                          ))
                        ) : (
                          <span
                            style={{
                              color: '#D97706',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            onClick={() =>
                              setActiveSuggestionBulletId(activeSuggestionBulletId === b.id ? null : b.id)
                            }
                          >
                            💡 Quantify this achievement
                          </span>
                        )}
                      </div>

                      <span style={{ color: '#A1A1AA', fontSize: '10px' }}>
                        {b.text.length} chars
                      </span>
                    </div>

                    {/* Expandable metric idea box if lacking metric */}
                    {!metricResult.hasMetric && activeSuggestionBulletId === b.id && (
                      <div
                        style={{
                          background: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          borderRadius: '6px',
                          padding: '8px',
                          marginTop: '6px',
                          fontSize: '11px',
                          color: '#92400E',
                        }}
                      >
                        <strong>Never fabricate numbers.</strong> Add genuine metrics if available:
                        <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                          <li>Percentage: efficiency gain, latency drop, cost saved (e.g. +30%)</li>
                          <li>Scale: users impacted, records processed, datasets analyzed (e.g. 100K records)</li>
                          <li>Time: hours saved per sprint, cycle-time reduction (e.g. 15 hrs/wk)</li>
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
