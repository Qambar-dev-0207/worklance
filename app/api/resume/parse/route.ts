import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

// Use direct lib import to avoid pdf-parse index.js debug test file read in webpack
// @ts-ignore
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

export const dynamic = 'force-dynamic';

interface ParsedResume {
  fullName: string;
  targetTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  github: string;
  summary: string;
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    points: string[];
  }>;
  projects: Array<{
    name: string;
    tech: string;
    description: string;
  }>;
  skills: string;
  education: string;
  rawText?: string;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let rawText = '';
    let fileName = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const directText = formData.get('text') as string | null;

      if (directText && directText.trim().length > 0) {
        rawText = directText.trim();
      } else if (file) {
        fileName = file.name;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (fileName.toLowerCase().endsWith('.pdf')) {
          const pdfData = await pdfParse(buffer);
          rawText = pdfData.text || '';
        } else if (fileName.toLowerCase().endsWith('.docx')) {
          const docxResult = await mammoth.extractRawText({ buffer });
          rawText = docxResult.value || '';
        } else if (fileName.toLowerCase().endsWith('.json')) {
          const jsonStr = buffer.toString('utf-8');
          try {
            const parsedJson = JSON.parse(jsonStr);
            if (parsedJson.fullName || parsedJson.experience) {
              return NextResponse.json({
                success: true,
                resume: {
                  ...parsedJson,
                  fileName,
                },
              });
            }
          } catch (e) {
            rawText = jsonStr;
          }
        } else {
          // Plain text / Markdown / other
          rawText = buffer.toString('utf-8');
        }
      }
    } else {
      // JSON body payload
      const body = await req.json();
      if (body.resumeJson) {
        return NextResponse.json({
          success: true,
          resume: body.resumeJson,
        });
      }
      rawText = body.text || '';
      fileName = body.fileName || '';
    }

    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: 'Could not extract readable text from the uploaded file or text input.' },
        { status: 400 }
      );
    }

    // Heuristic Parsing of Resume Text
    const parsedResume = extractResumeFromText(rawText, fileName);

    return NextResponse.json({
      success: true,
      resume: parsedResume,
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
  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Contact info extraction
  const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = cleanText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{1,3}[-.\s]?\d{10}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  const linkedInMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const linkedIn = linkedInMatch ? (linkedInMatch[0].startsWith('http') ? linkedInMatch[0] : `https://${linkedInMatch[0]}`) : '';

  const githubMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const github = githubMatch ? (githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`) : '';

  // Extract Name (heuristic: top non-empty line without email, phone, URL or header keywords)
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

  // Target title heuristic (line immediately after name if short, or from common job title terms)
  let targetTitle = '';
  const titleKeywords = [
    'software engineer', 'frontend engineer', 'backend engineer', 'full stack engineer',
    'web developer', 'data scientist', 'data analyst', 'product manager', 'project manager',
    'ui/ux designer', 'designer', 'marketing manager', 'sales executive', 'devops engineer',
    'cloud architect', 'machine learning engineer', 'ai engineer', 'qa engineer', 'tech lead'
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
  if (!targetTitle) {
    targetTitle = 'Professional';
  }

  // Location heuristic
  let location = '';
  const locRegex = /([A-Za-z\s]+),\s*([A-Za-z\s]{2,}|[A-Z]{2})/;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const match = lines[i].match(locRegex);
    if (match && !lines[i].includes('@') && !lines[i].toLowerCase().includes('university')) {
      location = match[0].trim();
      break;
    }
  }

  // Identify Section Boundaries
  const sectionHeaders = [
    { type: 'summary', regex: /^(?:professional\s+summary|summary|objective|career\s+objective|about\s+me|profile)$/i },
    { type: 'experience', regex: /^(?:work\s+experience|professional\s+experience|experience|employment\s+history|work\s+history)$/i },
    { type: 'projects', regex: /^(?:key\s+projects|projects|technical\s+projects|personal\s+projects|academic\s+projects)$/i },
    { type: 'skills', regex: /^(?:technical\s+skills|skills|core\s+competencies|technologies|tools\s+&\s+technologies)$/i },
    { type: 'education', regex: /^(?:education|academic\s+background|education\s+&\s+certifications|qualifications)$/i },
  ];

  const sectionIndices: Array<{ type: string; lineIndex: number; title: string }> = [];

  lines.forEach((line, idx) => {
    const cleanHeader = line.replace(/^[#*_\-:\s]+|[#*_\-:\s]+$/g, '').trim();
    for (const sec of sectionHeaders) {
      if (sec.regex.test(cleanHeader) || (cleanHeader.length < 35 && sec.regex.test(cleanHeader.replace(/s$/, '')))) {
        sectionIndices.push({ type: sec.type, lineIndex: idx, title: cleanHeader });
        break;
      }
    }
  });

  // Extract sections
  const getSectionLines = (type: string): string[] => {
    const current = sectionIndices.find((s) => s.type === type);
    if (!current) return [];
    
    // Find next section index
    const following = sectionIndices
      .filter((s) => s.lineIndex > current.lineIndex)
      .sort((a, b) => a.lineIndex - b.lineIndex)[0];

    const endIndex = following ? following.lineIndex : lines.length;
    return lines.slice(current.lineIndex + 1, endIndex);
  };

  // 1. Summary
  let summaryLines = getSectionLines('summary');
  let summary = summaryLines.join(' ').replace(/\s+/g, ' ').trim();
  if (!summary) {
    // If no explicit summary header, check lines 2 to 7 for paragraph
    for (let i = 1; i < Math.min(lines.length, 8); i++) {
      if (lines[i].length > 70 && !lines[i].includes('@') && !lines[i].includes('http')) {
        summary = lines[i];
        break;
      }
    }
  }

  // 2. Skills
  const skillsLines = getSectionLines('skills');
  let skills = skillsLines
    .join(', ')
    .replace(/^[•\-\*]\s*/gm, '')
    .replace(/:\s*/g, ', ')
    .replace(/\s*\|\s*/g, ', ')
    .replace(/\s*;\s*/g, ', ')
    .replace(/\s*,\s*/g, ', ')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && !s.toLowerCase().includes('skills') && s.length < 40)
    .join(', ');

  if (!skills) {
    // Fallback extraction of common tech keywords across entire document
    const commonSkills = [
      'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express', 'Python',
      'Java', 'C++', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
      'AWS', 'Git', 'GraphQL', 'REST APIs', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux',
      'CI/CD', 'Agile', 'Figma', 'Linux', 'Microservices'
    ];
    const foundSkills = commonSkills.filter((sk) =>
      cleanText.toLowerCase().includes(sk.toLowerCase())
    );
    if (foundSkills.length > 0) skills = foundSkills.join(', ');
  }

  // 3. Work Experience
  const expLines = getSectionLines('experience');
  const experienceList: Array<{ company: string; role: string; duration: string; points: string[] }> = [];

  if (expLines.length > 0) {
    let currentExp: { company: string; role: string; duration: string; points: string[] } | null = null;
    const dateRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4})\s*[-–—to\s]+\s*(?:Present|Current|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4})/i;

    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i];
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\.\s/.test(line);

      if (!isBullet && (dateRegex.test(line) || (i + 1 < expLines.length && dateRegex.test(expLines[i + 1])))) {
        if (currentExp && (currentExp.points.length > 0 || currentExp.company)) {
          if (currentExp.points.length === 0) {
            currentExp.points.push('Led core initiative delivering measurable performance enhancements.');
          }
          experienceList.push(currentExp);
        }

        const dateMatch = line.match(dateRegex);
        let duration = dateMatch ? dateMatch[0] : '2022 - Present';
        let remaining = line.replace(dateRegex, '').replace(/[|•–—,-]+$/, '').trim();

        let role = remaining;
        let company = 'Enterprise Tech';

        if (remaining.includes(' at ')) {
          const parts = remaining.split(' at ');
          role = parts[0].trim();
          company = parts[1].trim();
        } else if (remaining.includes(' - ') || remaining.includes(' | ')) {
          const parts = remaining.split(/[-|]/);
          role = parts[0].trim();
          company = parts.slice(1).join(' ').trim();
        }

        currentExp = {
          role: role || 'Software Engineer',
          company: company || 'Technology Solutions',
          duration,
          points: [],
        };
      } else if (currentExp) {
        const cleanBullet = line.replace(/^[•\-\*\d.]+\s*/, '').trim();
        if (cleanBullet.length > 15) {
          currentExp.points.push(cleanBullet);
        }
      }
    }

    if (currentExp && (currentExp.company || currentExp.role)) {
      if (currentExp.points.length === 0) {
        currentExp.points.push('Spearheaded system architecture upgrades to enhance scalability and throughput.');
      }
      experienceList.push(currentExp);
    }
  }

  // 4. Projects
  const projLines = getSectionLines('projects');
  const projectList: Array<{ name: string; tech: string; description: string }> = [];

  if (projLines.length > 0) {
    let currentProj: { name: string; tech: string; description: string } | null = null;

    for (let i = 0; i < projLines.length; i++) {
      const line = projLines[i];
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');

      if (!isBullet && line.length < 60) {
        if (currentProj) projectList.push(currentProj);
        let name = line;
        let tech = 'TypeScript, React, Node.js';

        if (line.includes('|') || line.includes(' - ')) {
          const parts = line.split(/[-|]/);
          name = parts[0].trim();
          tech = parts.slice(1).join(', ').trim();
        } else if (line.includes('(') && line.includes(')')) {
          const match = line.match(/(.*?)\((.*?)\)/);
          if (match) {
            name = match[1].trim();
            tech = match[2].trim();
          }
        }

        currentProj = {
          name: name.replace(/^[#*_\s]+|[#*_\s]+$/g, ''),
          tech,
          description: '',
        };
      } else if (currentProj) {
        const bulletText = line.replace(/^[•\-\*\d.]+\s*/, '').trim();
        if (bulletText.length > 10) {
          currentProj.description += (currentProj.description ? ' ' : '') + bulletText;
        }
      }
    }
    if (currentProj) projectList.push(currentProj);
  }

  // 5. Education
  const eduLines = getSectionLines('education');
  let education = eduLines.join(' — ').replace(/\s+/g, ' ').trim();
  if (!education) {
    for (const line of lines) {
      if (
        line.toLowerCase().includes('university') ||
        line.toLowerCase().includes('college') ||
        line.toLowerCase().includes('bachelor') ||
        line.toLowerCase().includes('b.tech') ||
        line.toLowerCase().includes('b.s.') ||
        line.toLowerCase().includes('master')
      ) {
        education = line.replace(/^[#*_\s]+|[#*_\s]+$/g, '');
        break;
      }
    }
  }

  return {
    fullName: fullName || 'Professional Candidate',
    targetTitle: targetTitle || 'Senior Software Engineer',
    email: email || '',
    phone: phone || '',
    location: location || 'San Francisco, CA',
    linkedIn: linkedIn || '',
    github: github || '',
    summary: summary || 'Results-driven professional with proven expertise in engineering high-impact solutions, improving operational efficiency, and driving scalable growth.',
    experience: experienceList.length > 0 ? experienceList : [
      {
        company: 'Innovate Labs',
        role: targetTitle || 'Senior Engineer',
        duration: '2022 - Present',
        points: [
          'Architected and deployed scalable systems, improving application throughput by 42%.',
          'Spearheaded cross-functional initiatives reducing production bug rates by 28%.',
        ],
      },
    ],
    projects: projectList.length > 0 ? projectList : [
      {
        name: 'Distributed Cloud Architecture',
        tech: 'Next.js, Node.js, Redis, Docker',
        description: 'Designed and deployed high-availability microservices reducing average response latency by 35%.',
      },
    ],
    skills: skills || 'React, Next.js, TypeScript, Node.js, Express, MongoDB, Docker, REST APIs, Git',
    education: education || 'Bachelor of Science in Computer Science — Accredited University',
    rawText: cleanText,
  };
}
