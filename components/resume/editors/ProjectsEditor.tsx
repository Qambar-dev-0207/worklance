'use client';

import React from 'react';
import { useResumeStore } from '@/lib/resume/store';
import { detectMetrics } from '@/lib/resume/metricEngine';
import { analyzeBulletVerb } from '@/lib/resume/verbEngine';

export default function ProjectsEditor() {
  const {
    resume,
    addProject,
    updateProject,
    removeProject,
    addProjectBullet,
    updateProjectBullet,
    removeProjectBullet,
    improveProjectBullet,
  } = useResumeStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#71717A', fontWeight: 600 }}>
          Project accomplishments communicating Problem, Action, Tech, and Result
        </span>
        <button
          type="button"
          onClick={() => addProject()}
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
          + Add Project
        </button>
      </div>

      {resume.projects.map((proj, projIdx) => (
        <div
          key={proj.id}
          style={{
            background: '#F8F8F9',
            border: '1px solid #E4E4E7',
            borderRadius: '12px',
            padding: '14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#71717A' }}>
              PROJECT #{projIdx + 1}
            </span>
            {resume.projects.length > 1 && (
              <button
                type="button"
                onClick={() => removeProject(proj.id)}
                style={{ color: '#EF4444', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'none' }}
              >
                ✕ Remove Project
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '2px' }}>
                Project Title (Bold)
              </label>
              <input
                type="text"
                value={proj.name}
                onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                placeholder="e.g. Bank Loan Default Prediction"
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
                Date / Period (Right-aligned)
              </label>
              <input
                type="text"
                value={proj.date}
                onChange={(e) => updateProject(proj.id, { date: e.target.value })}
                placeholder="e.g. Aug 2022 – Dec 2022"
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

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#3F3F46', display: 'block', marginBottom: '2px' }}>
                Technologies Used (Italics)
              </label>
              <input
                type="text"
                value={proj.tech}
                onChange={(e) => updateProject(proj.id, { tech: e.target.value })}
                placeholder="e.g. Python, SQL, Tableau, Spark"
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
                Live Link URL (Optional)
              </label>
              <input
                type="text"
                value={proj.link || ''}
                onChange={(e) => updateProject(proj.id, { link: e.target.value })}
                placeholder="e.g. github.com/user/project"
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

          {/* Project Bullets */}
          <div style={{ borderTop: '1px solid #E4E4E7', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#27272A', textTransform: 'uppercase' }}>
                Project Bullets ({proj.bullets.length})
              </label>
              <button
                type="button"
                onClick={() => addProjectBullet(proj.id)}
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
              {proj.bullets.map((b) => {
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
                        onChange={(e) => updateProjectBullet(proj.id, b.id, e.target.value)}
                        placeholder="[Action] + [Method/Tech] + [Result/Accuracy] + [Scale/Records]"
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
                          onClick={() => improveProjectBullet(proj.id, b.id)}
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
                        >
                          ✨ Improve
                        </button>
                        {proj.bullets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProjectBullet(proj.id, b.id)}
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

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '4px',
                        fontSize: '10.5px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
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
                          <span style={{ color: '#D97706', fontWeight: 600 }}>
                            💡 Quantify this project achievement
                          </span>
                        )}
                      </div>
                    </div>
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
