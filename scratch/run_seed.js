const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = "mongodb+srv://qambar:qambar0207@cluster0.sravbfn.mongodb.net/codnexa?retryWrites=true&w=majority";

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(uri);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;

    // Password hash
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Users
    const usersColl = db.collection('users');
    await usersColl.deleteMany({});
    
    const recruiterResult = await usersColl.insertOne({
      name: 'Ankit Kapoor',
      email: 'recruiter@worklance.com',
      password: hashedPassword,
      role: 'recruiter',
      company: 'Zenith Tech',
      title: 'Talent Acquisition Lead',
      avatar: 'AK',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const seekerResult = await usersColl.insertOne({
      name: 'Riya Sharma',
      email: 'seeker@worklance.com',
      password: hashedPassword,
      role: 'seeker',
      title: 'Frontend Developer',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      avatar: 'RS',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("Seeded Users!");

    // Jobs
    const jobsColl = db.collection('jobs');
    await jobsColl.deleteMany({});
    await jobsColl.insertMany([
      {
        title: 'Senior Frontend Engineer (React/Next.js)',
        company: 'Zenith Tech Labs',
        location: 'Bengaluru, India',
        type: 'Full-time',
        salary: '₹18,00,000 - ₹26,00,000 / year',
        description: 'We are seeking an experienced Frontend Developer to lead our Web Applications team. You will architect high-performance React and Next.js platforms, build sleek design systems, and collaborate with backend developers to deliver scalable SaaS solutions.',
        requirements: [
          '4+ years of React / Next.js experience',
          'Deep knowledge of TypeScript & modern CSS architecture',
          'Experience with state management (Zustand/Redux)',
          'Strong API integration and performance optimization skills'
        ],
        tags: ['React', 'Next.js', 'TypeScript', 'Frontend'],
        postedBy: recruiterResult.insertedId,
        applicantCount: 14,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Full Stack Engineer (Node.js & MongoDB)',
        company: 'Nexora Innovations',
        location: 'Remote',
        type: 'Remote',
        salary: '₹14,00,000 - ₹20,00,000 / year',
        description: 'Join Nexora Innovations as a Full Stack Engineer! Work on cutting-edge fintech services processing millions of API calls daily. Responsibilities include designing RESTful APIs, optimizing MongoDB queries, and implementing modern UI features.',
        requirements: [
          '3+ years full-stack web development',
          'Proficiency in Node.js, Express, and MongoDB Mongoose',
          'Familiarity with Cloud platforms (AWS/Vercel)',
          'Automated testing experience (Jest/Playwright)'
        ],
        tags: ['Full Stack', 'Node.js', 'MongoDB', 'Remote'],
        postedBy: recruiterResult.insertedId,
        applicantCount: 22,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Product Designer (UI/UX)',
        company: 'Codeloop Studio',
        location: 'Mumbai, India',
        type: 'Hybrid',
        salary: '₹10,00,000 - ₹15,00,000 / year',
        description: 'Codeloop Studio is looking for a talented UI/UX Product Designer to shape the user experience across mobile and web platforms. You will conduct user research, create wireframes, interactive prototypes, and collaborate closely with product managers and engineers.',
        requirements: [
          '2+ years in Product Design / UI/UX',
          'Mastery of Figma and prototyping tools',
          'Portfolio demonstrating end-to-end design process',
          'Strong visual aesthetic and micro-animation skills'
        ],
        tags: ['UI/UX', 'Figma', 'Product Design', 'Hybrid'],
        postedBy: recruiterResult.insertedId,
        applicantCount: 9,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log("Seeded Jobs!");

    // Hackathons
    const hackathonsColl = db.collection('hackathons');
    await hackathonsColl.deleteMany({});
    await hackathonsColl.insertMany([
      {
        title: 'Worklance Winter Hackathon 2026',
        organizer: 'Worklance Team',
        organizerBadge: 'WL',
        description: 'Build an AI-powered hiring tool in 48 hours. Open to students and early-career developers across India.',
        prizePool: '₹3,00,000',
        status: 'Live',
        teamSize: 'Up to 4',
        tags: ['AI/ML', 'Web Dev', 'GenAI'],
        duration: '48 hrs',
        participantsCount: 1240,
        teamsCount: 180,
        deadline: '3 days left',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Zenith Labs AI Challenge',
        organizer: 'Zenith Labs',
        organizerBadge: 'ZN',
        description: 'Create next-generation autonomous workflows using large language models and smart vector indexes.',
        prizePool: '₹1,50,000',
        status: 'Live',
        teamSize: 'Up to 4',
        tags: ['AI/ML', 'Beginner Friendly'],
        duration: '36 hrs',
        participantsCount: 890,
        teamsCount: 110,
        deadline: '2 days left',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log("Seeded Hackathons!");

    // HR Contacts
    const hrColl = db.collection('hrcontacts');
    await hrColl.deleteMany({});
    await hrColl.insertMany([
      {
        name: 'Ankit Kapoor',
        company: 'Zenith Tech',
        designation: 'HR Manager & Talent Lead',
        email: 'ankit.kapoor@zenithtech.com',
        linkedIn: 'https://linkedin.com/in/ankit-kapoor-hr',
        industry: 'Software & SaaS',
        city: 'Bengaluru',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
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
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log("Seeded HR Contacts!");

    console.log("\nDATABASE SEEDING COMPLETE FOR MONGODB ATLAS!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Seeding Error:", err);
  }
}

seedDatabase();
