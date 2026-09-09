'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useResumeStore } from '@/lib/resume/store';
import { detectMetrics } from '@/lib/resume/metricEngine';

interface ResumeSheetProps {
  isPrintPreview?: boolean;
}

export default function ResumeSheet({ isPrintPreview = false }: ResumeSheetProps) {
  const {
    resume,
    setContentHeightPx,
    updatePersonal,
    updateSummary,
    updateEducation,
    updateSkillCategory,
    updateExperience,
    updateExperienceBullet,
    updateProject,
    updateProjectBullet,
    updateSimpleItem,
  } = useResumeStore();

  const sheetRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Measure content height and notify store for density meter
  useEffect(() => {
    if (!sheetRef.current) return;

    const measureHeight = () => {
      if (sheetRef.current) {
        const height = sheetRef.current.scrollHeight;
        setContentHeightPx(height);
      }
    };

    measureHeight();
    const observer = new ResizeObserver(measureHeight);
    observer.observe(sheetRef.current);

    return () => observer.disconnect();
  }, [resume, setContentHeightPx]);

  const { settings, personal, sectionOrder, sectionVisibility } = resume;
  const isLetter = settings.pageSize === 'letter';

  // Physical page dimensions at 96 DPI:
  // A4: 794px x 1123px (210mm x 297mm)
  // Letter: 816px x 1056px (8.5in x 11in)
  const pageHeight = isLetter ? 1056 : 1123;
  const pageWidth = isLetter ? 816 : 794;

  const fontStyle = {
    fontFamily:
      settings.fontFamily === 'Times New Roman'
        ? '"Times New Roman", Times, "Nimbus Roman No9 L", Georgia, serif'
        : settings.fontFamily === 'Georgia'
        ? 'Georgia, serif'
        : settings.fontFamily === 'Arial'
        ? 'Arial, "Helvetica Neue", sans-serif'
        : settings.fontFamily === 'Helvetica'
        ? '"Helvetica Neue", Helvetica, Arial, sans-serif'
        : 'Inter, system-ui, -apple-system, sans-serif',
  };

  const bodyPt = settings.fontSize || 10;
  const headingPt = settings.headingSize || 11.5;
  const namePt = settings.nameSize || 20;
  const lineHeight = settings.lineHeight || 1.35;
  const sectionSpacingPx = settings.sectionSpacing || 8;
  const entrySpacingPx = settings.entrySpacing || 6;
  const bulletSpacingPx = settings.bulletSpacing || 2;
  const marginV = settings.marginVertical || 0.5;
  const marginH = settings.marginHorizontal || 0.6;

  // Inline editable handler
  const handleInlineBlur = (id: string, e: React.FocusEvent<HTMLElement>, callback: (val: string) => void) => {
    const text = e.currentTarget.innerText.trim();
    callback(text);
    setEditingId(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <div
        id="resume-document-root"
        ref={sheetRef}
        className={`ats-resume-sheet ats-template-${settings.template}`}
        style={{
          width: `${pageWidth}px`,
          minHeight: `${pageHeight}px`,
          background: '#FFFFFF',
          color: '#000000',
          padding: `${marginV}in ${marginH}in`,
          boxShadow: isPrintPreview ? 'none' : '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0,0,0,0.05)',
          borderRadius: isPrintPreview ? '0' : '4px',
          boxSizing: 'border-box',
          position: 'relative',
          fontSize: `${bodyPt}pt`,
          lineHeight: lineHeight,
          ...fontStyle,
        }}
      >
        {/* Visual Page Break Marker for Multi-Page Detection */}
        <div
          className="no-print page-break-guide"
          style={{
            position: 'absolute',
            top: `${pageHeight}px`,
            left: 0,
            right: 0,
            height: '2px',
            borderTop: '2px dashed #EF4444',
            opacity: 0.85,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <span
            style={{
              position: 'absolute',
              right: '12px',
              top: '-18px',
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 700,
              padding: '1px 8px',
              borderRadius: '4px',
            }}
          >
            Page 1 Boundary (End of Page 1)
          </span>
        </div>

        {/* 1. MINIMAL CENTERED HEADER */}
        <header style={{ textAlign: 'center', marginBottom: `${sectionSpacingPx}px` }}>
          <h1
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleInlineBlur('fullName', e, (val) => updatePersonal({ fullName: val }))}
            style={{
              fontSize: `${namePt}pt`,
              fontWeight: 700,
              textTransform: settings.uppercaseHeadings ? 'uppercase' : 'none',
              letterSpacing: '0.04em',
              margin: '0 0 2px 0',
              lineHeight: 1.1,
              outline: 'none',
              cursor: 'text',
            }}
            title="Click to edit name"
          >
            {personal.fullName || 'YOUR NAME'}
          </h1>

          {/* Contact Line (Single Line, Pipe Delimited) */}
          <div
            style={{
              fontSize: `${Math.max(bodyPt - 0.75, 8.5)}pt`,
              color: '#18181B',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '6px',
              marginTop: '3px',
            }}
          >
            {personal.location && (
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleInlineBlur('location', e, (val) => updatePersonal({ location: val }))}
                style={{ outline: 'none', cursor: 'text' }}
              >
                {personal.location}
              </span>
            )}

            {personal.location && (personal.email || personal.phone) && <span style={{ color: '#555' }}>|</span>}

            {personal.email && (
              <a
                href={`mailto:${personal.email}`}
                style={{ color: '#000000', textDecoration: 'none', outline: 'none' }}
              >
                {personal.email}
              </a>
            )}

            {personal.email && personal.phone && <span style={{ color: '#555' }}>|</span>}

            {personal.phone && (
              <a href={`tel:${personal.phone}`} style={{ color: '#000000', textDecoration: 'none' }}>
                {personal.phone}
              </a>
            )}

            {personal.linkedIn && (
              <>
                <span style={{ color: '#555' }}>|</span>
                <a
                  href={personal.linkedIn.startsWith('http') ? personal.linkedIn : `https://${personal.linkedIn}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#000000', textDecoration: 'none' }}
                >
                  {personal.linkedIn.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'linkedin.com/in/')}
                </a>
              </>
            )}

            {personal.github && (
              <>
                <span style={{ color: '#555' }}>|</span>
                <a
                  href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#000000', textDecoration: 'none' }}
                >
                  {personal.github.replace(/^https?:\/\/(www\.)?github\.com\//i, 'github.com/')}
                </a>
              </>
            )}

            {personal.portfolio && (
              <>
                <span style={{ color: '#555' }}>|</span>
                <a
                  href={personal.portfolio.startsWith('http') ? personal.portfolio : `https://${personal.portfolio}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#000000', textDecoration: 'none' }}
                >
                  Portfolio
                </a>
              </>
            )}
          </div>
        </header>

        {/* 2. REORDERABLE SECTIONS */}
        {sectionOrder.map((secKey) => {
          if (sectionVisibility && sectionVisibility[secKey] === false) return null;

          switch (secKey) {
            case 'summary':
              if (!resume.showSummary || !resume.summary) return null;
              return (
                <section key="summary" style={{ marginBottom: `${sectionSpacingPx}px` }}>
                  <div
                    style={{
                      fontSize: `${headingPt}pt`,
                      fontWeight: 700,
                      textTransform: settings.uppercaseHeadings ? 'uppercase' : 'none',
                      borderBottom: settings.showSectionDividers ? '1px solid #18181b' : 'none',
                      paddingBottom: '1px',
                      marginBottom: '4px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Professional Summary
                  </div>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleInlineBlur('summary', e, (val) => updateSummary(val))}
                    style={{
                      margin: 0,
                      textAlign: 'justify',
                      lineHeight: lineHeight,
                      outline: 'none',
                      cursor: 'text',
                    }}
                  >
                    {resume.summary}
                  </p>
                </section>
              );

            case 'education':
              if (resume.education.length === 0) return null;
              return (
                <section key="education" style={{ marginBottom: `${sectionSpacingPx}px` }}>
                  <div
                    style={{
                      fontSize: `${headingPt}pt`,
                      fontWeight: 700,
                      textTransform: settings.uppercaseHeadings ? 'uppercase' : 'none',
                      borderBottom: settings.showSectionDividers ? '1px solid #18181b' : 'none',
                      paddingBottom: '1px',
                      marginBottom: '4px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Education
                  </div>
                  {resume.education.map((edu) => (
                    <div key={edu.id} style={{ marginBottom: `${entrySpacingPx}px` }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                        }}
                      >
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleInlineBlur(edu.id, e, (val) => updateEducation(edu.id, { institution: val }))
                          }
                          style={{ fontWeight: 700, outline: 'none', cursor: 'text' }}
                        >
                          {edu.institution}
                        </span>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleInlineBlur(edu.id, e, (val) => updateEducation(edu.id, { graduationDate: val }))
                          }
                          style={{
                            fontWeight: 700,
                            textAlign: 'right',
                            outline: 'none',
                            cursor: 'text',
                            fontSize: `${Math.max(bodyPt - 0.5, 9)}pt`,
                          }}
                        >
                          {edu.graduationDate}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                        }}
                      >
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleInlineBlur(edu.id, e, (val) => updateEducation(edu.id, { degree: val }))
                          }
                          style={{ fontStyle: 'italic', outline: 'none', cursor: 'text' }}
                        >
                          {edu.degree}
                          {edu.gpa ? `, GPA: ${edu.gpa}` : ''}
                        </span>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleInlineBlur(edu.id, e, (val) => updateEducation(edu.id, { location: val }))
                          }
                          style={{
                            fontStyle: 'italic',
                            textAlign: 'right',
                            outline: 'none',
                            cursor: 'text',
                            fontSize: `${Math.max(bodyPt - 0.5, 9)}pt`,
                          }}
                        >
                          {edu.location}
                        </span>
                      </div>

                      {edu.coursework && (
                        <div style={{ fontSize: `${Math.max(bodyPt - 0.5, 8.8)}pt`, marginTop: '1px' }}>
                          <span style={{ fontWeight: 600 }}>Coursework: </span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleInlineBlur(edu.id, e, (val) => updateEducation(edu.id, { coursework: val }))
                            }
                            style={{ outline: 'none', cursor: 'text' }}
                          >
                            {edu.coursework}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              );

            case 'skills':
              if (resume.skills.length === 0) return null;
              return (
                <section key="skills" style={{ marginBottom: `${sectionSpacingPx}px` }}>
                  <div
                    style={{
                      fontSize: `${headingPt}pt`,
                      fontWeight: 700,
                      textTransform: settings.uppercaseHeadings ? 'uppercase' : 'none',
                      borderBottom: settings.showSectionDividers ? '1px solid #18181b' : 'none',
                      paddingBottom: '1px',
                      marginBottom: '4px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Skills
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {resume.skills.map((skill) => (
                      <div key={skill.id} style={{ lineHeight: 1.3 }}>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleInlineBlur(skill.id, e, (val) =>
                              updateSkillCategory(skill.id, { categoryName: val })
                            )
                          }
                          style={{ fontWeight: 700, outline: 'none', cursor: 'text' }}
                        >
                          {skill.categoryName}
                        </span>
                        <span>: </span>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleInlineBlur(skill.id, e, (val) =>
                              updateSkillCategory(skill.id, { skillsList: val })
                            )
                          }
                          style={{ outline: 'none', cursor: 'text' }}
                        >
                          {skill.skillsList}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'experience':
              if (resume.experience.length === 0) return null;
              return (
                <section key="experience" style={{ marginBottom: `${sectionSpacingPx}px` }}>
                  <div
                    style={{
                      fontSize: `${headingPt}pt`,
                      fontWeight: 700,
                      textTransform: settings.uppercaseHeadings ? 'uppercase' : 'none',
                      borderBottom: settings.showSectionDividers ? '1px solid #18181b' : 'none',
                      paddingBottom: '1px',
                      marginBottom: '4px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Experience
                  </div>
                  {resume.experience.map((exp) => (
                    <div key={exp.id} style={{ marginBottom: `${entrySpacingPx}px` }}>
                      {/* Company Name & Date */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                        }}
                      >
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleInlineBlur(exp.id, e, (val) => updateExperience(exp.id, { company: val }))
                          }
                          style={{
                            fontWeight: 700,
                            fontSize: `${bodyPt + 0.5}pt`,
                            outline: 'none',
                            cursor: 'text',
                          }}
                        >
                          {exp.company}
                        </span>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const val = e.currentTarget.innerText.trim();
                            if (val.includes('–') || val.includes('-')) {
                              const [start, end] = val.split(/[–-]/);
                              updateExperience(exp.id, { startDate: start.trim(), endDate: end.trim() });
                            }
                          }}
                          style={{
                            fontWeight: 700,
                            textAlign: 'right',
                            outline: 'none',
                            cursor: 'text',
                            fontSize: `${Math.max(bodyPt - 0.5, 9)}pt`,
                          }}
                        >
                          {exp.startDate} – {exp.endDate}
                        </span>
                      </div>

                      {/* Job Title & Location */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          marginBottom: '2px',
                        }}
                      >
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleInlineBlur(exp.id, e, (val) => updateExperience(exp.id, { role: val }))
                          }
                          style={{ fontStyle: 'italic', outline: 'none', cursor: 'text' }}
                        >
                          {exp.role}
                        </span>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleInlineBlur(exp.id, e, (val) => updateExperience(exp.id, { location: val }))
                          }
                          style={{
                            fontStyle: 'italic',
                            textAlign: 'right',
                            outline: 'none',
                            cursor: 'text',
                            fontSize: `${Math.max(bodyPt - 0.5, 9)}pt`,
                          }}
                        >
                          {exp.location}
                        </span>
                      </div>

                      {/* Bullets with hanging indent */}
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: '16px',
                          listStyleType: 'disc',
                        }}
                      >
                        {exp.bullets.map((b) => (
                          <li
                            key={b.id}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleInlineBlur(b.id, e, (val) => updateExperienceBullet(exp.id, b.id, val))
                            }
                            style={{
                              marginBottom: `${bulletSpacingPx}px`,
                              textAlign: 'justify',
                              lineHeight: lineHeight,
                              outline: 'none',
                              cursor: 'text',
                            }}
                          >
                            {b.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>
              );

            case 'projects':
              if (resume.projects.length === 0) return null;
              return (
                <section key="projects" style={{ marginBottom: `${sectionSpacingPx}px` }}>
                  <div
                    style={{
                      fontSize: `${headingPt}pt`,
                      fontWeight: 700,
                      textTransform: settings.uppercaseHeadings ? 'uppercase' : 'none',
                      borderBottom: settings.showSectionDividers ? '1px solid #18181b' : 'none',
                      paddingBottom: '1px',
                      marginBottom: '4px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Projects
                  </div>
                  {resume.projects.map((proj) => (
                    <div key={proj.id} style={{ marginBottom: `${entrySpacingPx}px` }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          marginBottom: '2px',
                        }}
                      >
                        <div>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleInlineBlur(proj.id, e, (val) => updateProject(proj.id, { name: val }))
                            }
                            style={{ fontWeight: 700, outline: 'none', cursor: 'text' }}
                          >
                            {proj.name}
                          </span>
                          <span style={{ color: '#000000' }}> | </span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleInlineBlur(proj.id, e, (val) => updateProject(proj.id, { tech: val }))
                            }
                            style={{ fontStyle: 'italic', outline: 'none', cursor: 'text' }}
                          >
                            {proj.tech}
                          </span>
                          {proj.link && (
                            <>
                              <span> | </span>
                              <a
                                href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#000000', textDecoration: 'underline' }}
                              >
                                {proj.linkText || 'Link'}
                              </a>
                            </>
                          )}
                        </div>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleInlineBlur(proj.id, e, (val) => updateProject(proj.id, { date: val }))
                          }
                          style={{
                            fontWeight: 700,
                            textAlign: 'right',
                            outline: 'none',
                            cursor: 'text',
                            fontSize: `${Math.max(bodyPt - 0.5, 9)}pt`,
                          }}
                        >
                          {proj.date}
                        </span>
                      </div>

                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: '16px',
                          listStyleType: 'disc',
                        }}
                      >
                        {proj.bullets.map((b) => (
                          <li
                            key={b.id}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleInlineBlur(b.id, e, (val) => updateProjectBullet(proj.id, b.id, val))
                            }
                            style={{
                              marginBottom: `${bulletSpacingPx}px`,
                              textAlign: 'justify',
                              lineHeight: lineHeight,
                              outline: 'none',
                              cursor: 'text',
                            }}
                          >
                            {b.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>
              );

            case 'leadership':
              if (resume.leadership.length === 0) return null;
              return (
                <section key="leadership" style={{ marginBottom: `${sectionSpacingPx}px` }}>
                  <div
                    style={{
                      fontSize: `${headingPt}pt`,
                      fontWeight: 700,
                      textTransform: settings.uppercaseHeadings ? 'uppercase' : 'none',
                      borderBottom: settings.showSectionDividers ? '1px solid #18181b' : 'none',
                      paddingBottom: '1px',
                      marginBottom: '4px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Leadership & Awards
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '16px',
                      listStyleType: 'disc',
                    }}
                  >
                    {resume.leadership.map((item) => (
                      <li
                        key={item.id}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleInlineBlur(item.id, e, (val) => updateSimpleItem('leadership', item.id, val))
                        }
                        style={{
                          marginBottom: `${bulletSpacingPx}px`,
                          textAlign: 'justify',
                          lineHeight: lineHeight,
                          outline: 'none',
                          cursor: 'text',
                        }}
                      >
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </section>
              );

            case 'certifications':
              if (resume.certifications.length === 0) return null;
              return (
                <section key="certifications" style={{ marginBottom: `${sectionSpacingPx}px` }}>
                  <div
                    style={{
                      fontSize: `${headingPt}pt`,
                      fontWeight: 700,
                      textTransform: settings.uppercaseHeadings ? 'uppercase' : 'none',
                      borderBottom: settings.showSectionDividers ? '1px solid #18181b' : 'none',
                      paddingBottom: '1px',
                      marginBottom: '4px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Certifications
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '16px',
                      listStyleType: 'disc',
                    }}
                  >
                    {resume.certifications.map((item) => (
                      <li
                        key={item.id}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleInlineBlur(item.id, e, (val) => updateSimpleItem('certifications', item.id, val))
                        }
                        style={{
                          marginBottom: `${bulletSpacingPx}px`,
                          textAlign: 'justify',
                          lineHeight: lineHeight,
                          outline: 'none',
                          cursor: 'text',
                        }}
                      >
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </section>
              );

            case 'achievements':
              if (resume.achievements.length === 0) return null;
              return (
                <section key="achievements" style={{ marginBottom: `${sectionSpacingPx}px` }}>
                  <div
                    style={{
                      fontSize: `${headingPt}pt`,
                      fontWeight: 700,
                      textTransform: settings.uppercaseHeadings ? 'uppercase' : 'none',
                      borderBottom: settings.showSectionDividers ? '1px solid #18181b' : 'none',
                      paddingBottom: '1px',
                      marginBottom: '4px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Achievements
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '16px',
                      listStyleType: 'disc',
                    }}
                  >
                    {resume.achievements.map((item) => (
                      <li
                        key={item.id}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleInlineBlur(item.id, e, (val) => updateSimpleItem('achievements', item.id, val))
                        }
                        style={{
                          marginBottom: `${bulletSpacingPx}px`,
                          textAlign: 'justify',
                          lineHeight: lineHeight,
                          outline: 'none',
                          cursor: 'text',
                        }}
                      >
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </section>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
