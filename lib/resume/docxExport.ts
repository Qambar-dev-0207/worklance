import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  ExternalHyperlink,
  convertInchesToTwip,
  TabStopType,
  TabStopPosition,
} from 'docx';
import { ResumeData } from '@/types/resume';

export async function generateDocxResume(resume: ResumeData): Promise<Blob> {
  const font = resume.settings.fontFamily === 'Inter' ? 'Calibri' : resume.settings.fontFamily;
  const bodySizeHalfPt = Math.round(resume.settings.fontSize * 2); // 10pt = 20 half-points
  const headingSizeHalfPt = Math.round(resume.settings.headingSize * 2);
  const nameSizeHalfPt = Math.round(resume.settings.nameSize * 2);

  const paragraphs: Paragraph[] = [];

  // 1. CANDIDATE NAME (Centered, Bold)
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60, before: 0 },
      children: [
        new TextRun({
          text: resume.personal.fullName.toUpperCase(),
          bold: true,
          size: nameSizeHalfPt,
          font,
        }),
      ],
    })
  );

  // 2. CONTACT INFORMATION (Centered, 1 line)
  const contactRuns: (TextRun | ExternalHyperlink)[] = [];
  const contactItems: { text: string; url?: string }[] = [];

  if (resume.personal.location) contactItems.push({ text: resume.personal.location });
  if (resume.personal.email) {
    contactItems.push({
      text: resume.personal.email,
      url: `mailto:${resume.personal.email}`,
    });
  }
  if (resume.personal.phone) {
    contactItems.push({
      text: resume.personal.phone,
      url: `tel:${resume.personal.phone}`,
    });
  }
  if (resume.personal.linkedIn) {
    const cleanLi = resume.personal.linkedIn.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '');
    contactItems.push({
      text: `linkedin.com/in/${cleanLi}`,
      url: resume.personal.linkedIn.startsWith('http')
        ? resume.personal.linkedIn
        : `https://www.linkedin.com/in/${cleanLi}`,
    });
  }
  if (resume.personal.github) {
    const cleanGh = resume.personal.github.replace(/^https?:\/\/(www\.)?github\.com\//i, '');
    contactItems.push({
      text: `github.com/${cleanGh}`,
      url: resume.personal.github.startsWith('http')
        ? resume.personal.github
        : `https://github.com/${cleanGh}`,
    });
  }

  contactItems.forEach((item, index) => {
    if (index > 0) {
      contactRuns.push(
        new TextRun({
          text: ' | ',
          size: Math.max(bodySizeHalfPt - 2, 16),
          font,
          color: '555555',
        })
      );
    }
    if (item.url) {
      contactRuns.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: item.text,
              size: Math.max(bodySizeHalfPt - 2, 16),
              font,
              color: '111111',
              underline: {},
            }),
          ],
          link: item.url,
        })
      );
    } else {
      contactRuns.push(
        new TextRun({
          text: item.text,
          size: Math.max(bodySizeHalfPt - 2, 16),
          font,
          color: '222222',
        })
      );
    }
  });

  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 140, before: 0 },
      children: contactRuns,
    })
  );

  // Helper for Section Heading with thin bottom border
  const addSectionHeading = (title: string) => {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 140, after: 60 },
        border: {
          bottom: {
            color: '222222',
            space: 2,
            style: BorderStyle.SINGLE,
            size: 8, // 1pt border
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: headingSizeHalfPt,
            font,
            color: '000000',
          }),
        ],
      })
    );
  };

  // 3. RENDER SECTIONS IN USER SPECIFIED ORDER
  resume.sectionOrder.forEach((sectionKey) => {
    if (resume.sectionVisibility && resume.sectionVisibility[sectionKey] === false) {
      return;
    }

    switch (sectionKey) {
      case 'summary':
        if (resume.showSummary && resume.summary) {
          addSectionHeading('Professional Summary');
          paragraphs.push(
            new Paragraph({
              spacing: { after: 80, before: 40 },
              children: [
                new TextRun({
                  text: resume.summary,
                  size: bodySizeHalfPt,
                  font,
                }),
              ],
            })
          );
        }
        break;

      case 'education':
        if (resume.education.length > 0) {
          addSectionHeading('Education');
          resume.education.forEach((edu) => {
            // Line 1: School (Bold, Left) | Date (Right)
            paragraphs.push(
              new Paragraph({
                spacing: { before: 40, after: 10 },
                tabStops: [{ type: TabStopType.RIGHT, position: 9800 }],
                children: [
                  new TextRun({
                    text: edu.institution,
                    bold: true,
                    size: bodySizeHalfPt,
                    font,
                  }),
                  new TextRun({
                    children: ['\t', edu.graduationDate],
                    bold: true,
                    size: bodySizeHalfPt,
                    font,
                  }),
                ],
              })
            );

            // Line 2: Degree (Italic, Left) | Location (Right)
            paragraphs.push(
              new Paragraph({
                spacing: { before: 0, after: 20 },
                tabStops: [{ type: TabStopType.RIGHT, position: 9800 }],
                children: [
                  new TextRun({
                    text: `${edu.degree}${edu.gpa ? `, GPA: ${edu.gpa}` : ''}`,
                    italics: true,
                    size: bodySizeHalfPt,
                    font,
                  }),
                  new TextRun({
                    children: ['\t', edu.location],
                    italics: true,
                    size: bodySizeHalfPt,
                    font,
                  }),
                ],
              })
            );

            // Line 3: Coursework
            if (edu.coursework) {
              paragraphs.push(
                new Paragraph({
                  spacing: { before: 0, after: 60 },
                  children: [
                    new TextRun({
                      text: `Relevant Coursework: ${edu.coursework}`,
                      size: Math.max(bodySizeHalfPt - 1, 17),
                      font,
                    }),
                  ],
                })
              );
            }
          });
        }
        break;

      case 'skills':
        if (resume.skills.length > 0) {
          addSectionHeading('Skills');
          resume.skills.forEach((skill) => {
            paragraphs.push(
              new Paragraph({
                spacing: { before: 20, after: 20 },
                children: [
                  new TextRun({
                    text: `${skill.categoryName}: `,
                    bold: true,
                    size: bodySizeHalfPt,
                    font,
                  }),
                  new TextRun({
                    text: skill.skillsList,
                    size: bodySizeHalfPt,
                    font,
                  }),
                ],
              })
            );
          });
        }
        break;

      case 'experience':
        if (resume.experience.length > 0) {
          addSectionHeading('Experience');
          resume.experience.forEach((exp) => {
            // Line 1: Company (Bold) | Date (Right)
            paragraphs.push(
              new Paragraph({
                spacing: { before: 60, after: 10 },
                tabStops: [{ type: TabStopType.RIGHT, position: 9800 }],
                children: [
                  new TextRun({
                    text: exp.company,
                    bold: true,
                    size: bodySizeHalfPt + 1,
                    font,
                  }),
                  new TextRun({
                    children: ['\t', `${exp.startDate} – ${exp.endDate}`],
                    bold: true,
                    size: bodySizeHalfPt,
                    font,
                  }),
                ],
              })
            );

            // Line 2: Role (Italic) | Location (Right)
            paragraphs.push(
              new Paragraph({
                spacing: { before: 0, after: 30 },
                tabStops: [{ type: TabStopType.RIGHT, position: 9800 }],
                children: [
                  new TextRun({
                    text: exp.role,
                    italics: true,
                    size: bodySizeHalfPt,
                    font,
                  }),
                  new TextRun({
                    children: ['\t', exp.location],
                    italics: true,
                    size: bodySizeHalfPt,
                    font,
                  }),
                ],
              })
            );

            // Bullets
            exp.bullets.forEach((b) => {
              paragraphs.push(
                new Paragraph({
                  bullet: { level: 0 },
                  spacing: { before: 10, after: 15 },
                  children: [
                    new TextRun({
                      text: b.text,
                      size: bodySizeHalfPt,
                      font,
                    }),
                  ],
                })
              );
            });
          });
        }
        break;

      case 'projects':
        if (resume.projects.length > 0) {
          addSectionHeading('Projects');
          resume.projects.forEach((proj) => {
            paragraphs.push(
              new Paragraph({
                spacing: { before: 50, after: 20 },
                tabStops: [{ type: TabStopType.RIGHT, position: 9800 }],
                children: [
                  new TextRun({
                    text: proj.name,
                    bold: true,
                    size: bodySizeHalfPt,
                    font,
                  }),
                  new TextRun({
                    text: ` | ${proj.tech}`,
                    size: bodySizeHalfPt,
                    font,
                  }),
                  new TextRun({
                    children: ['\t', proj.date],
                    bold: true,
                    size: bodySizeHalfPt,
                    font,
                  }),
                ],
              })
            );

            proj.bullets.forEach((b) => {
              paragraphs.push(
                new Paragraph({
                  bullet: { level: 0 },
                  spacing: { before: 10, after: 15 },
                  children: [
                    new TextRun({
                      text: b.text,
                      size: bodySizeHalfPt,
                      font,
                    }),
                  ],
                })
              );
            });
          });
        }
        break;

      case 'leadership':
        if (resume.leadership.length > 0) {
          addSectionHeading('Leadership & Awards');
          resume.leadership.forEach((item) => {
            paragraphs.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 10, after: 20 },
                children: [
                  new TextRun({
                    text: item.text,
                    size: bodySizeHalfPt,
                    font,
                  }),
                ],
              })
            );
          });
        }
        break;

      case 'certifications':
        if (resume.certifications.length > 0) {
          addSectionHeading('Certifications');
          resume.certifications.forEach((item) => {
            paragraphs.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 10, after: 20 },
                children: [
                  new TextRun({
                    text: item.text,
                    size: bodySizeHalfPt,
                    font,
                  }),
                ],
              })
            );
          });
        }
        break;

      case 'achievements':
        if (resume.achievements.length > 0) {
          addSectionHeading('Achievements');
          resume.achievements.forEach((item) => {
            paragraphs.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 10, after: 20 },
                children: [
                  new TextRun({
                    text: item.text,
                    size: bodySizeHalfPt,
                    font,
                  }),
                ],
              })
            );
          });
        }
        break;
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(resume.settings.marginVertical || 0.5),
              bottom: convertInchesToTwip(resume.settings.marginVertical || 0.5),
              left: convertInchesToTwip(resume.settings.marginHorizontal || 0.6),
              right: convertInchesToTwip(resume.settings.marginHorizontal || 0.6),
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
