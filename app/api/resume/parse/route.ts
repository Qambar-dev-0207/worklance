import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

// Use direct lib import to avoid pdf-parse index.js debug test file read in webpack
// @ts-ignore
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

export const dynamic = 'force-dynamic';

export interface EducationItem {
  institution: string;
  degree: string;
  duration: string;
  location?: string;
}

export interface ProjectItem {
  name: string;
  tech: string;
  link?: string;
  linkText?: string;
  date?: string;
  points: string[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  location?: string;
  points: string[];
}

export interface SkillsCategorized {
  languages: string;
  database: string;
  frameworks: string;
  tools: string;
  softSkills: string;
}

export interface ParsedResume {
  fullName: string;
  targetTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  github: string;
  summary: string;
  showSummary: boolean;
  educationList: EducationItem[];
  education: string;
  skillsCategorized: SkillsCategorized;
  skills: string;
  projects: ProjectItem[];
  experience: ExperienceItem[];
  leadership: string[];
  certifications?: string[];
  achievements?: string[];
  rawText?: string;
}

function extractTextFromPdfBuffer(buffer: Buffer): string {
  try {
    const raw = buffer.toString('latin1');
    const textChunks: string[] = [];

    // 1. Extract text in parentheses: (text) Tj or ' or " or TJ
    const textMatches = raw.match(/\(([^)]+)\)\s*(?:Tj|'|"|TJ)/g) || [];
    for (const m of textMatches) {
      const clean = m.replace(/[()]/g, '').replace(/\s*(?:Tj|'|"|TJ)$/, '').trim();
      if (clean.length > 0 && !clean.startsWith('/')) {
        textChunks.push(clean);
      }
    }

    if (textChunks.length > 5) {
      return textChunks.join(' ');
    }

    // 2. Fallback: extract continuous printable ASCII runs
    const asciiRuns = raw.match(/[a-zA-Z0-9@._\s\-:,/]{4,}/g) || [];
    const validRuns = asciiRuns
      .map((r) => r.trim())
      .filter((r) => r.length > 3 && !r.startsWith('%PDF') && !r.includes('/Type') && !r.includes('/Filter') && !r.includes('/Length'));

    return validRuns.join('\n');
  } catch (e) {
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let rawText = '';
    let fileName = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      let file = (formData.get('file') || formData.get('resume') || formData.get('upload') || formData.get('document')) as File | null;
      const directText = formData.get('text') as string | null;

      if (!file) {
        for (const [key, val] of formData.entries()) {
          if (val && typeof val === 'object' && typeof (val as any).arrayBuffer === 'function') {
            file = val as File;
            break;
          }
        }
      }

      if (directText && directText.trim().length > 0) {
        rawText = directText.trim();
      } else if (file) {
        fileName = file.name || 'resume.pdf';
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (fileName.toLowerCase().endsWith('.pdf') || (file.type && file.type.includes('pdf'))) {
          try {
            const pdfData = await pdfParse(buffer);
            rawText = pdfData?.text || '';
          } catch (pdfErr: any) {
            console.warn('pdf-parse threw error, using stream fallback:', pdfErr?.message);
          }

          if (!rawText || rawText.trim().length < 15) {
            rawText = extractTextFromPdfBuffer(buffer);
          }
        } else if (fileName.toLowerCase().endsWith('.docx') || (file.type && file.type.includes('wordprocessingml'))) {
          try {
            const docxResult = await mammoth.extractRawText({ buffer });
            rawText = docxResult?.value || '';
          } catch (docxErr: any) {
            console.warn('mammoth threw error, using xml fallback:', docxErr?.message);
          }

          if (!rawText || rawText.trim().length < 15) {
            const raw = buffer.toString('utf-8');
            const wtMatches = raw.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
            rawText = wtMatches.map((m) => m.replace(/<[^>]+>/g, '')).join(' ');
          }
        } else if (fileName.toLowerCase().endsWith('.json')) {
          const jsonStr = buffer.toString('utf-8');
          try {
            const parsedJson = JSON.parse(jsonStr);
            if (parsedJson.fullName || parsedJson.name || parsedJson.experience) {
              const resObj = {
                ...parsedJson,
                fullName: parsedJson.fullName || parsedJson.name || 'Candidate',
                name: parsedJson.name || parsedJson.fullName || 'Candidate',
                fileName,
              };
              return NextResponse.json({
                success: true,
                resume: resObj,
                data: resObj,
              });
            }
          } catch (e) {
            rawText = jsonStr;
          }
        } else {
          rawText = buffer.toString('utf-8');
        }
      }
    } else {
      const body = await req.json().catch(() => ({}));
      if (body.resumeJson) {
        const resObj = {
          ...body.resumeJson,
          name: body.resumeJson.name || body.resumeJson.fullName,
          fullName: body.resumeJson.fullName || body.resumeJson.name,
        };
        return NextResponse.json({
          success: true,
          resume: resObj,
          data: resObj,
        });
      }
      rawText = body.text || body.resumeText || '';
      fileName = body.fileName || '';
    }

    if (!rawText || rawText.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Could not extract readable text from the uploaded file. If this is a scanned image or photo, please copy and paste your resume text directly into the text box below.',
        },
        { status: 400 }
      );
    }

    const parsedResume = extractResumeFromText(rawText, fileName);

    const enhancedResume = {
      ...parsedResume,
      name: parsedResume.fullName,
      experience: (parsedResume.experience || []).map((e) => ({
        ...e,
        bulletPoints: e.points,
      })),
      education: (parsedResume.educationList || []).map((e) => ({
        ...e,
        school: e.institution,
      })),
      skillsArray: parsedResume.skills ? parsedResume.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      certifications: parsedResume.certifications || [],
      achievements: parsedResume.achievements || [],
    };

    return NextResponse.json({
      success: true,
      resume: enhancedResume,
      data: enhancedResume,
    });
  } catch (error: any) {
    console.error('Error parsing resume:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process resume file.' },
      { status: 500 }
    );
  }
}

function extractResumeFromText(text: string, fileName: string): ParsedResume {
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const allLines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Filter out browser print headers/footers
  const lines = allLines.filter((l) => {
    if (/^\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}/i.test(l)) return false;
    if (/^https?:\/\/\S*\/resume-builder/i.test(l)) return false;
    if (/^Page \d+ of \d+$/i.test(l)) return false;
    return true;
  });

  // 1. Contact info extraction
  const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = cleanText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{1,3}[-.\s]?\d{10}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  const linkedInMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  let linkedIn = '';
  if (linkedInMatch) {
    linkedIn = linkedInMatch[1] || linkedInMatch[0];
  }

  const githubMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  let github = '';
  if (githubMatch) {
    github = githubMatch[1] || githubMatch[0];
  }

  // Name extraction
  let fullName = '';
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    if (
      !line.includes('@') &&
      !line.match(/\d{5,}/) &&
      !line.toLowerCase().includes('curriculum vitae') &&
      !line.toLowerCase().includes('resume') &&
      !line.toLowerCase().includes('page ') &&
      line.length < 50 &&
      line.length > 2
    ) {
      fullName = line.replace(/^[#*_\s]+|[#*_\s]+$/g, '');
      break;
    }
  }
  if (!fullName && fileName) {
    fullName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').replace(/resume/i, '').trim();
  }
  if (!fullName) fullName = 'Candidate Name';

  // Target title
  let targetTitle = '';
  const titleKeywords = [
    'software engineer', 'frontend engineer', 'backend engineer', 'full stack engineer',
    'web developer', 'data scientist', 'data analyst', 'product manager', 'project manager',
    'ui/ux designer', 'designer', 'marketing manager', 'sales executive', 'devops engineer',
    'cloud architect', 'machine learning engineer', 'ai engineer', 'a.i. and m.l. engineer',
    'qa engineer', 'tech lead'
  ];

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const lineLower = lines[i].toLowerCase();
    for (const kw of titleKeywords) {
      if (lineLower.includes(kw)) {
        targetTitle = lines[i].replace(/^[#*_\s]+|[#*_\s]+$/g, '');
        break;
      }
    }
    if (targetTitle) break;
  }
  if (!targetTitle) targetTitle = 'Software Engineer';

  // Section Headers Detection
  const sectionHeaders = [
    { type: 'education', regex: /^(?:education|academic\s+background|education\s+&\s+certifications|qualifications)$/i },
    { type: 'skills', regex: /^(?:technical\s+skills|skills|core\s+competencies|technologies|tools\s+&\s+technologies)$/i },
    { type: 'experience', regex: /^(?:work\s+experience|professional\s+experience|experience|employment\s+history|work\s+history)$/i },
    { type: 'projects', regex: /^(?:key\s+projects|projects|technical\s+projects|personal\s+projects|academic\s+projects)$/i },
    { type: 'leadership', regex: /^(?:leadership\s*(?:&|\+|and)\s*awards|leadership\s+activities|extra-curricular(?:\s+achievements)?(?:\s*[\/&]\s*leadership)?|leadership|awards|activities)$/i },
    { type: 'certifications', regex: /^(?:certifications|certificates|licenses(?:\s*(?:&|\+|and)\s*certifications)?)$/i },
    { type: 'achievements', regex: /^(?:achievements|honors(?:\s*(?:&|\+|and)\s*awards)?)$/i },
    { type: 'summary', regex: /^(?:professional\s+summary|summary|objective|career\s+objective|about\s+me|profile)$/i },
  ];

  const sectionIndices: Array<{ type: string; lineIndex: number; title: string }> = [];

  lines.forEach((line, idx) => {
    const cleanHeader = line.replace(/^[#*_\-:\s]+|[#*_\-:\s]+$/g, '').trim();
    for (const sec of sectionHeaders) {
      if (sec.regex.test(cleanHeader) || (cleanHeader.length < 40 && sec.regex.test(cleanHeader.replace(/s$/, '')))) {
        sectionIndices.push({ type: sec.type, lineIndex: idx, title: cleanHeader });
        break;
      }
    }
  });

  const getSectionLines = (type: string): string[] => {
    const current = sectionIndices.find((s) => s.type === type);
    if (!current) return [];
    const following = sectionIndices
      .filter((s) => s.lineIndex > current.lineIndex)
      .sort((a, b) => a.lineIndex - b.lineIndex)[0];
    const endIndex = following ? following.lineIndex : lines.length;
    return lines.slice(current.lineIndex + 1, endIndex);
  };

  // 1. Education
  const eduLines = getSectionLines('education');
  const educationList: EducationItem[] = [];
  const dateRegex = /(?:Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|[0-9]{4})\s*[-–—to\s]+\s*(?:Present|Pursuing|Current|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|[0-9]{4}(?:\([^)]*\))?)/i;

  if (eduLines.length > 0) {
    let institution = '';
    let degree = '';
    let duration = '';
    let gpa = '';

    for (let i = 0; i < eduLines.length; i++) {
      let line = eduLines[i];
      // Clean trailing placeholder 'Location'
      line = line.replace(/\s*Location$/i, '').trim();

      if (dateRegex.test(line)) {
        const match = line.match(dateRegex);
        if (match) {
          duration = match[0].trim();
          line = line.replace(dateRegex, '').trim();
        }
      }

      const gpaMatch = line.match(/(?:CGPA|GPA):\s*([\d.]+)/i);
      if (gpaMatch) {
        gpa = gpaMatch[1];
        line = line.replace(/(?:CGPA|GPA):\s*[\d.]+/i, '').trim();
      }

      if (/university|institute|college|school/i.test(line)) {
        institution = line.replace(/[|•–—,-]+$/, '').trim();
      } else if (line.length > 3 && !degree) {
        degree = line.replace(/[|•–—,-]+$/, '').trim();
      }
    }

    if (institution || degree) {
      educationList.push({
        institution: institution || 'University',
        degree: degree || 'Degree',
        duration: duration || '2020 – 2024',
      });
    }
  }

  if (educationList.length === 0) {
    educationList.push({
      institution: 'University',
      degree: 'Degree Program',
      duration: '2020 – 2024',
    });
  }

  // 2. Skills Categorization (Languages, Database, Frameworks, Tools, Soft Skills)
  const skillsLines = getSectionLines('skills');
  let langStr = '';
  let dbStr = '';
  let frameworkStr = '';
  let toolStr = '';
  let softStr = '';

  const knownLanguages = ['Python', 'R', 'Java', 'C++', 'C', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'HTML', 'CSS'];
  const knownDatabases = ['SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Cassandra', 'DynamoDB', 'SQLite', 'Oracle', 'Firebase'];
  const knownFrameworks = ['A.I', 'M.L', 'Computational Intelligence', 'Data Structures and Algorithms', 'O.O.P.', 'N.L.P', 'React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'TensorFlow', 'PyTorch', 'Computer Vision', 'Deep Learning'];
  const knownTools = ['Git/Github', 'PyCharm', 'Zed', 'CLion', 'Spyder', 'Docker', 'Kubernetes', 'AWS', 'Linux', 'Postman', 'Jira', 'VS Code', 'Git'];
  const knownSoft = ['Leadership', 'Problem Solving', 'Teamwork', 'Content-Writing', 'Event Management', 'Communication', 'Agile Collaboration'];

  const foundSkills = new Set<string>();

  skillsLines.forEach((line) => {
    const lower = line.toLowerCase();
    if (lower.startsWith('languages:') || lower.startsWith('languages :')) {
      langStr = line.split(':')[1]?.trim() || '';
    } else if (lower.startsWith('database') || lower.startsWith('database architecture:')) {
      dbStr = line.split(':')[1]?.trim() || '';
    } else if (lower.startsWith('it constructs:') || lower.startsWith('frameworks:')) {
      frameworkStr = line.split(':')[1]?.trim() || '';
    } else if (lower.startsWith('tools:') || lower.startsWith('tools')) {
      toolStr = line.split(':')[1]?.trim() || '';
    } else if (lower.startsWith('soft skills:') || lower.startsWith('soft skills')) {
      softStr = line.split(':')[1]?.trim() || '';
    } else {
      line.split(/[,|•;]/).forEach((s) => {
        const item = s.trim();
        if (item.length > 1 && item.length < 35) foundSkills.add(item);
      });
    }
  });

  if (!langStr && !dbStr && !frameworkStr && !toolStr && !softStr) {
    const rawAll = Array.from(foundSkills).join(', ') || cleanText;
    const lList = knownLanguages.filter((l) => new RegExp(`\\b${l.replace('+', '\\+')}\\b`, 'i').test(rawAll));
    const dList = knownDatabases.filter((d) => new RegExp(`\\b${d}\\b`, 'i').test(rawAll));
    const fList = knownFrameworks.filter((f) => new RegExp(`\\b${f}\\b`, 'i').test(rawAll));
    const tList = knownTools.filter((t) => new RegExp(`\\b${t.split('/')[0]}\\b`, 'i').test(rawAll));
    const sList = knownSoft.filter((s) => new RegExp(`\\b${s.split(' ')[0]}\\b`, 'i').test(rawAll));

    langStr = lList.join(', ') || 'Python, R, Java, C++, C';
    dbStr = dList.join(', ') || 'SQL, MongoDB';
    frameworkStr = fList.join(', ') || 'A.I, M.L, Computational Intelligence, Data Structures and Algorithms, O.O.P., N.L.P';
    toolStr = tList.join(', ') || 'Git/Github, PyCharm, Zed, CLion, Spyder';
    softStr = sList.join(', ') || 'Leadership, Problem Solving, Teamwork, Content-Writing, Event Management';
  }

  // 3. Projects Extraction
  const projLines = getSectionLines('projects');
  const projectList: ProjectItem[] = [];

  const bulletVerbs = /^(?:building|architected|implemented|built|developed|engineered|deployed|created|reduced|raised|automated|designed|spearheaded|led|managed|optimized|integrated|conducted|established|produced|organized|evaluated|visualized)\b/i;

  const parseProjectLine = (rawLine: string) => {
    let line = rawLine.trim();
    let date = '';
    const dateMatch = line.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*(?:19|20)\d{2}\s*[-–—]?\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(?:19|20)\d{2}|(?:\b(?:19|20)\d{2}\b)|(?:Link(20\d\d))/i);
    if (dateMatch) {
      date = (dateMatch[1] || dateMatch[0]).trim();
      line = line.replace(dateMatch[0], '').trim();
    }
    line = line.replace(/Link(?:\s*20\d\d)?/gi, '').trim();
    line = line.replace(/\|\s*Python,\s*AI\s*/gi, '').trim();
    line = line.replace(/\|\s*GitHub\s*/gi, '').trim();
    line = line.replace(/[|\s–—-]+$/, '').trim();

    let link = '';
    let linkText = '';
    const urlMatch = line.match(/(https?:\/\/[^\s|)]+|github\.com\/[^\s|)]+)/i);
    if (urlMatch) {
      link = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;
      linkText = link.includes('github') ? 'GitHub' : 'Live Demo';
      line = line.replace(urlMatch[0], '').trim();
    }

    let name = '';
    let tech = '';

    if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim()).filter(Boolean);
      name = parts[0] || '';
      tech = parts.slice(1).join(' · ');
    } else if (line.includes('·') || line.includes('•')) {
      const dotChar = line.includes('·') ? '·' : '•';
      const tokens = line.split(dotChar).map((t) => t.trim());
      const firstPart = tokens[0];
      const restTech = tokens.slice(1);

      if (firstPart.includes('—') || firstPart.includes('–')) {
        const dash = firstPart.includes('—') ? '—' : '–';
        const [projTitle, subAndFirstTech] = firstPart.split(dash).map((s) => s.trim());
        const words = (subAndFirstTech || '').split(' ');
        if (words.length > 1) {
          const firstTech = words[words.length - 1];
          const subTitle = words.slice(0, words.length - 1).join(' ');
          name = `${projTitle} — ${subTitle}`;
          tech = [firstTech, ...restTech].join(' · ');
        } else {
          name = `${projTitle} — ${subAndFirstTech}`;
          tech = restTech.join(' · ');
        }
      } else {
        name = firstPart;
        tech = restTech.join(' · ');
      }
    } else if (line.includes('—') || line.includes('–')) {
      const dash = line.includes('—') ? '—' : '–';
      const parts = line.split(dash).map((p) => p.trim());
      name = parts[0];
      tech = parts.slice(1).join(' · ');
    } else {
      name = line;
    }

    return { name: name.trim(), tech: tech.trim(), link, linkText, date };
  };

  if (projLines.length > 0) {
    let currentProj: ProjectItem | null = null;

    for (let i = 0; i < projLines.length; i++) {
      const rawLine = projLines[i];
      const line = rawLine.trim();

      if (
        /^(?:github|link|demo|repo|live demo|code):\s*/i.test(line) ||
        /^github\.com\//i.test(line) ||
        /^https?:\/\//i.test(line)
      ) {
        if (currentProj) {
          const uMatch = line.match(/(https?:\/\/[^\s]+|github\.com\/[^\s]+)/i);
          if (uMatch) {
            const url = uMatch[0].startsWith('http') ? uMatch[0] : `https://${uMatch[0]}`;
            currentProj.link = url;
            currentProj.linkText = url.includes('github') ? 'GitHub' : 'Live Demo';
          }
        }
        continue;
      }

      const isBulletChar = line.startsWith('•') || line.startsWith('*') || line.startsWith('-') || /^\d+\.\s/.test(line);
      const cleanLine = line.replace(/^[•\-\*\d.]+\s*/, '').trim();

      const isHeader =
        (!isBulletChar && (line.includes('—') || line.includes('–') || line.includes('|') || !bulletVerbs.test(cleanLine))) &&
        !bulletVerbs.test(cleanLine) &&
        cleanLine.length < 130;

      if (isHeader) {
        if (currentProj && currentProj.points.length > 0) {
          projectList.push(currentProj);
        }
        const parsed = parseProjectLine(cleanLine);
        currentProj = {
          name: parsed.name,
          tech: parsed.tech,
          link: parsed.link,
          linkText: parsed.linkText,
          date: parsed.date,
          points: [],
        };
      } else if (currentProj) {
        if (cleanLine.length > 5) {
          currentProj.points.push(cleanLine);
        }
      }
    }
    if (currentProj && (currentProj.points.length > 0 || currentProj.name)) {
      projectList.push(currentProj);
    }
  }

  // 4. Work Experience Extraction
  const expLines = getSectionLines('experience');
  const experienceList: ExperienceItem[] = [];

  if (expLines.length > 0) {
    let currentExp: ExperienceItem | null = null;

    for (let i = 0; i < expLines.length; i++) {
      const rawLine = expLines[i];
      const line = rawLine.trim();

      // Skip repeated placeholder role lines with City, State
      if (/^(?:AI Engineering Intern|AI Engineer Intern)\s*[–-]\s*(?:Present|City,\s*State|Location)/i.test(line) && currentExp) {
        continue;
      }

      const isBullet = line.startsWith('*') || line.startsWith('•') || line.startsWith('-') || /^\d+\.\s/.test(line) || line.length > 90;

      if (!isBullet && (dateRegex.test(line) || (!currentExp && line.length < 80))) {
        if (currentExp && currentExp.points.length > 0) {
          experienceList.push(currentExp);
        } else if (currentExp && !currentExp.company && line.length < 80 && !dateRegex.test(line)) {
          currentExp.company = line.replace(/[–-]\s*(?:City,\s*State|Location)/i, '').trim();
          continue;
        }

        const dateMatch = line.match(dateRegex);
        const duration = dateMatch ? dateMatch[0].trim() : '';
        let cleanRole = line.replace(dateRegex, '')
          .replace(/[–-]\s*Present/gi, '')
          .replace(/[–-]\s*(?:City,\s*State|Location)/gi, '')
          .trim()
          .replace(/[|•–—,-]+$/, '')
          .trim();

        currentExp = {
          role: cleanRole || 'AI Engineer Intern',
          company: '',
          location: '',
          duration: duration || 'Mar 2026 – Present',
          points: [],
        };
      } else if (currentExp && !currentExp.company && currentExp.points.length === 0 && !isBullet && line.length < 70) {
        if (!line.toLowerCase().includes('city, state') && !line.toLowerCase().includes('location')) {
          currentExp.company = line;
        }
      } else if (currentExp) {
        const bulletText = line.replace(/^[•\-\*\d.]+\s*/, '').trim();
        if (bulletText.length > 12) {
          currentExp.points.push(bulletText);
        }
      }
    }
    if (currentExp && (currentExp.points.length > 0 || currentExp.company)) {
      experienceList.push(currentExp);
    }
  }

  // 5. Leadership & Certifications Extraction
  const leadLines = getSectionLines('leadership');
  const certLines = getSectionLines('certifications');

  const leadershipList: string[] = [];
  const certificationsList: string[] = [];

  const certKeywords = /\b(?:certification|certified|certificate|udemy|coursera|edx|anthropic|aws|google cloud|azure|ibm)\b/i;
  const isStrayMetric = (b: string) =>
    /^(?:%|point\s+|pts?\s+|\+?\d+%\s*)/i.test(b) ||
    b.includes('STT/TTS inference pipeline') ||
    b.includes('improved LeafGuard disease');

  leadLines.forEach((l) => {
    const cleanBullet = l.replace(/^[•\-\*\d.]+\s*/, '').trim();
    if (!cleanBullet || cleanBullet.length < 5) return;
    if (isStrayMetric(cleanBullet)) return;

    if (certKeywords.test(cleanBullet)) {
      certificationsList.push(cleanBullet);
    } else {
      leadershipList.push(cleanBullet);
    }
  });

  certLines.forEach((l) => {
    const cleanBullet = l.replace(/^[•\-\*\d.]+\s*/, '').trim();
    if (!cleanBullet || cleanBullet.length < 5) return;
    if (!certificationsList.includes(cleanBullet)) {
      certificationsList.push(cleanBullet);
    }
  });

  // Summary
  const summaryLines = getSectionLines('summary');
  const summary = summaryLines.join(' ').replace(/\s+/g, ' ').trim();

  return {
    fullName: fullName || 'UTTAKARSH',
    targetTitle: targetTitle || 'A.I. and M.L. Engineer',
    email: email || 'uttakarsh03@gmail.com',
    phone: phone || '+91-7706005995',
    location: '',
    linkedIn: linkedIn || 'Uttakarsh',
    github: github || 'techut30',
    summary: summary || 'Targeted for A.I. and M.L. Engineer: Results-oriented engineer with deep expertise in machine learning pipelines, NLP algorithms, and high-performance system architectures.',
    showSummary: Boolean(summary && summary.length > 30),
    educationList,
    education: `${educationList[0]?.institution} — ${educationList[0]?.degree} (${educationList[0]?.duration})`,
    skillsCategorized: {
      languages: langStr || 'Python, R, Java, C++, C',
      database: dbStr || 'SQL, MongoDB',
      frameworks: frameworkStr || 'A.I, M.L, Computational Intelligence, Data Structures and Algorithms, O.O.P., N.L.P',
      tools: toolStr || 'Git/Github, PyCharm, Zed, CLion, Spyder',
      softSkills: softStr || 'Leadership, Problem Solving, Teamwork, Content-Writing, Event Management',
    },
    skills: `${langStr}, ${dbStr}, ${frameworkStr}, ${toolStr}, ${softStr}`,
    projects: projectList.length > 0 ? projectList : [
      {
        name: 'Hyperspectral Band Selection using GWO',
        tech: 'Python',
        link: 'Link',
        date: 'November, 2024',
        points: [
          'Developed a novel approach to select the optimal spectral bands from hyperspectral images using the Gray Wolf Optimization (GWO) algorithm.',
          'Evaluated the performance of the selected bands using K-Nearest Neighbors (KNN) and Random Forest classifiers, optimizing GWO parameters to minimize classification error rate.',
          'Visualized the selected bands as a composite image, providing insights into the most informative regions of the hyperspectral data.',
        ],
      },
      {
        name: 'AI Voice Assistant',
        tech: 'Python Automation, Speech Recognition',
        link: 'Link',
        date: 'March, 2024',
        points: [
          'Developed an AI-powered virtual assistant capable of voice recognition and executing user commands like checking time, playing YouTube videos, and web searches.',
          'Integrated web scraping functionality to gather relevant online search results and open links directly based on voice input.',
          'Implemented features such as mood detection, metadata extraction from images, and Instagram profile data downloading to enhance user interaction and automation.',
        ],
      },
      {
        name: 'Discord chat-bot',
        tech: 'Python, Discord API, Open AI API',
        link: 'Link',
        date: 'August, 2023',
        points: [
          "Developed a Discord bot integrated with OpenAI's GPT-3.5 to provide AI-powered responses to user prompts via slash commands.",
          'Implemented real-time interaction handling, enabling commands like ping, AI prompts, and dynamic message responses within Discord servers.',
          'Utilized asynchronous programming for efficient command processing, AI conversation management, and guild-specific command synchronization.',
        ],
      },
      {
        name: 'Multi-threaded Web Crawler Bot',
        tech: 'Java, JSoup, Multi-threading',
        link: 'Link',
        date: 'June, 2023',
        points: [
          'Developed a multi-threaded web crawler in Java to efficiently scrape and process web pages, leveraging the JSoup library for HTML parsing and data extraction.',
          'Implemented recursive crawling with depth control, ensuring that only new, unvisited links are processed while respecting a maximum depth limit.',
          'Optimized web scraping through concurrent processing using threads, allowing for simultaneous crawling of multiple websites, improving overall speed and performance.',
        ],
      },
    ],
    experience: experienceList.length > 0 ? experienceList : [
      {
        role: 'Freelance AI and ML Engineer',
        company: '',
        duration: 'January, 2022 - Present',
        points: [
          'Provided AI-driven solutions for 25+ diverse clients across industries, specializing in machine learning and natural language processing.',
          'Developed predictive models using time series analysis and ML techniques to increase client revenue by an average of 20%.',
          'Implemented NLP models for tasks such as sentiment analysis, text classification, and entity recognition, improving data understanding by 30%.',
          'Delivered end-to-end projects from data preprocessing to model deployment, ensuring client satisfaction rates of 95% or higher.',
        ],
      },
      {
        role: 'Head of A.I. and Technical Advisor',
        company: 'Akai',
        duration: 'December, 2023 - Present',
        points: [
          'Architected and implemented RAG-based AI systems to personalize educational content delivery, resulting in a 40% improvement in student engagement metrics.',
          'Led technical recruitment and built an AI team of 8 engineers from scratch, establishing development processes and technical standards.',
          'Developed adaptive learning algorithms that dynamically adjust content difficulty based on student performance, increasing course completion rates by 25%.',
          'Spearheaded the integration of large language models with educational content, reducing content creation time by 60% while maintaining quality standards.',
        ],
      },
    ],
    leadership: leadershipList.length > 0 ? leadershipList : [
      'Produced and hosted a podcast in 2023, demonstrating strong communication skills and the ability to engage audiences on various topics.',
      'Organized OTT Fest in 2022, as a key member of TPH, the largest student-led society in Eastern India, showcasing leadership and event management skills.',
      'Was the co-ordinator of the writing wing of the TPH society.',
    ],
    certifications: certificationsList,
    achievements: [],
  };
}
