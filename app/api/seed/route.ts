import { NextResponse } from 'next/server';
import { connectDB, isMockDB } from '@/lib/db';
import User from '@/models/User';
import Job from '@/models/Job';
import Hackathon from '@/models/Hackathon';
import HrContact from '@/models/HrContact';
import { hashPassword } from '@/lib/auth';
import { mockStore } from '@/lib/mockStore';

export async function POST() {
  try {
    await connectDB();

    if (isMockDB()) {
      return NextResponse.json({
        success: true,
        message: 'In-Memory database seeded successfully with sample accounts, jobs, hackathons, and HR directory!',
        accounts: {
          recruiter: 'recruiter@worklance.com (password: password123)',
          seeker: 'seeker@worklance.com (password: password123)',
        },
        counts: {
          jobsCount: mockStore.jobs.length,
          hackathonsCount: mockStore.hackathons.length,
          hrContactsCount: mockStore.hrContacts.length,
        },
      });
    }

    // Clear existing sample collections for clean seed
    await User.deleteMany({});
    await Job.deleteMany({});
    await Hackathon.deleteMany({});
    await HrContact.deleteMany({});

    // Create Recruiter & Seeker Accounts
    const defaultPassword = await hashPassword('password123');

    const recruiter = await User.create({
      name: 'Ankit Kapoor',
      email: 'recruiter@worklance.com',
      password: defaultPassword,
      role: 'recruiter',
      company: 'Zenith Tech',
      title: 'Talent Acquisition Lead',
      avatar: 'AK',
    });

    const seeker = await User.create({
      name: 'Riya Sharma',
      email: 'seeker@worklance.com',
      password: defaultPassword,
      role: 'seeker',
      title: 'Frontend Developer',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      avatar: 'RS',
    });

    // Seed Jobs
    const jobs = await Job.create([
      {
        title: 'Senior Frontend Engineer (React/Next.js)',
        company: 'Zenith Tech Labs',
        companyAbout:
          'Zenith Tech Labs is a high-growth SaaS & Developer tools startup headquartered in Bengaluru. We build modern cloud infrastructures and developer productivity tools used by over 500,000 developers globally. Our engineering culture focuses on high performance, autonomy, and modern web UI craftsmanship.',
        companyIndustry: 'Software & Cloud SaaS',
        companySize: '250 - 500 employees',
        companyWebsite: 'https://zenithtechlabs.com',
        location: 'Bengaluru, India',
        type: 'Full-time',
        salary: '₹18,00,000 - ₹26,00,000 / year',
        description:
          'We are seeking an experienced Frontend Developer to lead our Web Applications team. You will architect high-performance React and Next.js platforms, build sleek design systems, and collaborate with backend developers to deliver scalable SaaS solutions.',
        responsibilities: [
          'Lead architectural decisions for frontend React/Next.js applications and component libraries.',
          'Implement responsive, pixel-perfect user interfaces with micro-animations and optimal Core Web Vitals.',
          'Optimize client-side rendering performance, state management, and API caching strategies.',
          'Mentor junior frontend engineers and conduct code reviews for high technical standards.',
        ],
        requirements: [
          '4+ years of React / Next.js experience',
          'Deep knowledge of TypeScript & modern CSS architecture',
          'Experience with state management (Zustand/Redux)',
          'Strong API integration and performance optimization skills',
        ],
        benefits: [
          'Flexible hybrid work policy (2 days office / 3 days remote)',
          'Comprehensive health insurance for self and family',
          'Annual learning budget of ₹50,000 for courses and conferences',
          'Stock options / ESOPs package',
        ],
        tags: ['React', 'Next.js', 'TypeScript', 'Frontend'],
        postedBy: recruiter._id,
        applicantCount: 14,
      },
      {
        title: 'Full Stack Engineer (Node.js & MongoDB)',
        company: 'Nexora Innovations',
        companyAbout:
          'Nexora Innovations is a premier fintech infrastructure firm providing high-frequency API solutions and real-time transaction processing. Based out of Mumbai with a fully distributed team across India, Nexora processes over $5B in transactions annually.',
        companyIndustry: 'Fintech & Financial Services',
        companySize: '100 - 250 employees',
        companyWebsite: 'https://nexora.io',
        location: 'Remote',
        type: 'Remote',
        salary: '₹14,00,000 - ₹20,00,000 / year',
        description:
          'Join Nexora Innovations as a Full Stack Engineer! Work on cutting-edge fintech services processing millions of API calls daily. Responsibilities include designing RESTful APIs, optimizing MongoDB queries, and implementing modern UI features.',
        responsibilities: [
          'Design and deploy resilient RESTful and GraphQL microservices in Node.js.',
          'Build real-time transaction monitoring dashboards using Next.js & Tailwind CSS.',
          'Optimize complex MongoDB aggregation pipelines and indexing for low latency.',
          'Maintain high unit and integration test coverage across cloud microservices.',
        ],
        requirements: [
          '3+ years full-stack web development',
          'Proficiency in Node.js, Express, and MongoDB Mongoose',
          'Familiarity with Cloud platforms (AWS/Vercel)',
          'Automated testing experience (Jest/Playwright)',
        ],
        benefits: [
          '100% remote work freedom with ergonomic home-office setup allowance',
          'Wellness stipend & mental health support programs',
          'Performance-linked annual bonuses',
        ],
        tags: ['Full Stack', 'Node.js', 'MongoDB', 'Remote'],
        postedBy: recruiter._id,
        applicantCount: 22,
      },
      {
        title: 'Product Designer (UI/UX)',
        company: 'Codeloop Studio',
        companyAbout:
          'Codeloop Studio is an award-winning digital product studio that partners with world-class tech companies and startups to design intuitive mobile apps, design systems, and web platforms. Known for human-centered design and sleek visual craft.',
        companyIndustry: 'Digital Product & Design',
        companySize: '50 - 100 employees',
        companyWebsite: 'https://codeloop.studio',
        location: 'Mumbai, India',
        type: 'Hybrid',
        salary: '₹10,00,000 - ₹15,00,000 / year',
        description:
          'Codeloop Studio is looking for a talented UI/UX Product Designer to shape the user experience across mobile and web platforms. You will conduct user research, create wireframes, interactive prototypes, and collaborate closely with product managers and engineers.',
        responsibilities: [
          'Conduct end-to-end product design cycles from user research to high-fidelity Figma components.',
          'Create interactive motion prototypes and design token systems.',
          'Collaborate with developers during sprint planning to ensure design fidelity.',
        ],
        requirements: [
          '2+ years in Product Design / UI/UX',
          'Mastery of Figma and prototyping tools',
          'Portfolio demonstrating end-to-end design process',
          'Strong visual aesthetic and micro-animation skills',
        ],
        benefits: [
          'Top-tier Apple hardware (MacBook Pro + 4K Display setup)',
          'Weekly team lunches & studio hackathons',
          'Flexible working hours',
        ],
        tags: ['UI/UX', 'Figma', 'Product Design', 'Hybrid'],
        postedBy: recruiter._id,
        applicantCount: 9,
      },
    ]);

    // Seed Hackathons
    const hackathons = await Hackathon.create([
      {
        title: 'Worklance Winter Hackathon 2026',
        organizer: 'Worklance Team',
        organizerBadge: 'WL',
        description:
          'Build an AI-powered hiring tool in 48 hours. Open to students and early-career developers across India.',
        prizePool: '₹3,00,000',
        status: 'Live',
        teamSize: 'Up to 4',
        tags: ['AI/ML', 'Web Dev', 'GenAI'],
        duration: '48 hrs',
        participantsCount: 1240,
        teamsCount: 180,
        deadline: '3 days left',
      },
      {
        title: 'Zenith Labs AI Challenge',
        organizer: 'Zenith Labs',
        organizerBadge: 'ZN',
        description:
          'Create next-generation autonomous workflows using large language models and smart vector indexes.',
        prizePool: '₹1,50,000',
        status: 'Live',
        teamSize: 'Up to 4',
        tags: ['AI/ML', 'Beginner Friendly'],
        duration: '36 hrs',
        participantsCount: 890,
        teamsCount: 110,
        deadline: '2 days left',
      },
    ]);

    // Seed HR Contacts Directory
    const hrContacts = await HrContact.create([
      {
        name: 'Ankit Kapoor',
        company: 'Zenith Tech',
        designation: 'HR Manager & Talent Lead',
        email: 'ankit.kapoor@zenithtech.com',
        linkedIn: 'https://linkedin.com/in/ankit-kapoor-hr',
        industry: 'Software & SaaS',
        city: 'Bengaluru',
        verified: true,
      },
      {
        name: 'Pooja Verma',
        company: 'Nexora Innovations',
        designation: 'Senior Technical Recruiter',
        email: 'pooja.verma@nexora.io',
        linkedIn: 'https://linkedin.com/in/pooja-verma-recruiter',
        industry: 'Fintech',
        city: 'Mumbai',
        verified: true,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'MongoDB database seeded successfully with sample accounts, jobs, hackathons, and HR directory!',
      accounts: {
        recruiter: 'recruiter@worklance.com (password: password123)',
        seeker: 'seeker@worklance.com (password: password123)',
      },
      counts: {
        jobsCount: jobs.length,
        hackathonsCount: hackathons.length,
        hrContactsCount: hrContacts.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
