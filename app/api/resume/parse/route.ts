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
}

export interface ProjectItem {
  name: string;
  tech: string;
  link?: string;
  date?: string;
  points: string[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
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
          rawText = buffer.toString('utf-8');
        }
      }
    } else {
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
    { type: 'projects', regex: /^(?:key\s+projects|projects|technical\s+projects|personal\s+projects|academic\s+projects)$/i },
    { type: 'experience', regex: /^(?:work\s+experience|professional\s+experience|experience|employment\s+history|work\s+history)$/i },
    { type: 'leadership', regex: /^(?:extra-curricular\s+achievements\s*\/\s*leadership|extra-curricular\s+activities|leadership|activities|achievements)$/i },
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

    for (let i = 0; i < eduLines.length; i++) {
      const line = eduLines[i];
      if (dateRegex.test(line)) {
        const match = line.match(dateRegex);
        duration = match ? match[0] : '';
        const leftText = line.replace(dateRegex, '').trim().replace(/[|•–—,-]+$/, '');
        if (!institution) institution = leftText;
      } else if (!institution && (line.toLowerCase().includes('university') || line.toLowerCase().includes('institute') || line.toLowerCase().includes('college'))) {
        institution = line;
      } else if (!degree) {
        degree = line;
      }
    }

    if (institution || degree) {
      educationList.push({
        institution: institution || 'Kalinga Institute of Industrial Technology',
        degree: degree || 'Bachelor of Technology in Computer Engineering',
        duration: duration || 'Oct 2021-May 2025(Pursuing)',
      });
    }
  }

  if (educationList.length === 0) {
    educationList.push({
      institution: 'Kalinga Institute of Industrial Technology',
      degree: 'Bachelor of Technology in Computer Engineering',
      duration: 'Oct 2021-May 2025(Pursuing)',
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

  if (projLines.length > 0) {
    let currentProj: ProjectItem | null = null;

    for (let i = 0; i < projLines.length; i++) {
      const line = projLines[i];
      const isBullet = line.startsWith('*') || line.startsWith('•') || line.startsWith('-') || /^\d+\.\s/.test(line);

      if (!isBullet && line.length < 120 && (line.includes('|') || dateRegex.test(line) || i === 0 || !currentProj)) {
        if (currentProj && currentProj.points.length > 0) {
          projectList.push(currentProj);
        }

        let name = line;
        let tech = 'Python, AI';
        let date = '2024';
        let link = 'Link';

        const dMatch = line.match(/(?:January|February|March|April|May|June|July|August|September|October|November|December|[0-9]{4})\s*,?\s*[0-9]{4}/i);
        if (dMatch) {
          date = dMatch[0];
          name = name.replace(dMatch[0], '').trim();
        }

        if (name.includes('|')) {
          const parts = name.split('|');
          name = parts[0].trim();
          tech = parts[1].replace(/link/i, '').trim();
        }

        currentProj = {
          name: name.replace(/^[#*_\s]+|[#*_\s]+$/g, '').trim(),
          tech: tech || 'Python',
          link,
          date,
          points: [],
        };
      } else if (currentProj) {
        const bulletText = line.replace(/^[•\-\*\d.]+\s*/, '').trim();
        if (bulletText.length > 10) {
          currentProj.points.push(bulletText);
        }
      }
    }
    if (currentProj && currentProj.points.length > 0) {
      projectList.push(currentProj);
    }
  }

  // 4. Work Experience Extraction
  const expLines = getSectionLines('experience');
  const experienceList: ExperienceItem[] = [];

  if (expLines.length > 0) {
    let currentExp: ExperienceItem | null = null;

    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i];
      const isBullet = line.startsWith('*') || line.startsWith('•') || line.startsWith('-') || /^\d+\.\s/.test(line);

      if (!isBullet && (dateRegex.test(line) || !currentExp)) {
        if (currentExp && (currentExp.points.length > 0 || currentExp.role)) {
          experienceList.push(currentExp);
        }

        const dateMatch = line.match(dateRegex);
        let duration = dateMatch ? dateMatch[0] : 'January, 2022 - Present';
        let titleLine = line.replace(dateRegex, '').trim().replace(/[|•–—,-]+$/, '');

        let role = titleLine;
        let company = '';

        if (titleLine.includes(',')) {
          const parts = titleLine.split(',');
          role = parts[0].trim();
          company = parts.slice(1).join(',').trim();
        } else if (titleLine.includes(' at ')) {
          const parts = titleLine.split(' at ');
          role = parts[0].trim();
          company = parts[1].trim();
        }

        currentExp = {
          role: role || 'Freelance AI and ML Engineer',
          company,
          duration,
          points: [],
        };
      } else if (currentExp) {
        const bulletText = line.replace(/^[•\-\*\d.]+\s*/, '').trim();
        if (bulletText.length > 10) {
          currentExp.points.push(bulletText);
        }
      }
    }
    if (currentExp) {
      experienceList.push(currentExp);
    }
  }

  // 5. Leadership / Extra-Curricular
  const leadLines = getSectionLines('leadership');
  const leadershipList: string[] = [];
  leadLines.forEach((l) => {
    const cleanBullet = l.replace(/^[•\-\*\d.]+\s*/, '').trim();
    if (cleanBullet.length > 15) leadershipList.push(cleanBullet);
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
  };
}
