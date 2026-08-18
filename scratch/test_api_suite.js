const http = require('http');

const BASE_URL = 'http://localhost:3005';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Running Worklance End-to-End API & Security Verification Tests...\n');
  let passed = 0;
  let total = 0;

  function assert(name, condition, extra = '') {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name} ${extra}`);
    }
  }

  try {
    // 1. Seed Database Check
    const seedRes = await request('/api/seed', { method: 'POST' });
    assert('POST /api/seed seeds sample data', seedRes.status === 200 && seedRes.data.success);

    // 2. Auth: Registration Validation
    const badReg1 = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { name: 'A', email: 'invalid-email', password: '123' },
    });
    assert('Register validation rejects invalid inputs', badReg1.status === 400);

    // 3. Auth: Login with Recruiter
    const recruiterLogin = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'recruiter@worklance.com', password: 'password123' },
    });
    assert('Login with Recruiter succeeds', recruiterLogin.status === 200 && recruiterLogin.data.success);
    const recruiterToken = recruiterLogin.data.token;

    // 4. Auth: Login with Seeker
    const seekerLogin = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'seeker@worklance.com', password: 'password123' },
    });
    assert('Login with Job Seeker succeeds', seekerLogin.status === 200 && seekerLogin.data.success);
    const seekerToken = seekerLogin.data.token;

    // 5. Security Guard: Seeker cannot post a job
    const unauthorizedJobPost = await request('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seekerToken}`,
      },
      body: {
        title: 'Hacked Job Title',
        company: 'Fake Corp',
        location: 'Remote',
        salary: '₹10,00,000',
        description: 'Should fail',
      },
    });
    assert('Security: Seeker blocked from posting jobs (403)', unauthorizedJobPost.status === 403);

    // 6. Recruiter posts a new Job
    const validJobPost = await request('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: {
        title: 'Lead AI Engineer',
        company: 'Zenith Tech Labs',
        location: 'Bengaluru, India',
        type: 'Full-time',
        salary: '₹25,00,000 - ₹35,00,000 / year',
        description: 'Architect scalable GenAI systems and inference pipelines.',
        requirements: ['Python', 'PyTorch', 'Vector DBs'],
        tags: ['AI', 'Python', 'Full-time'],
      },
    });
    assert('Recruiter can publish job opportunity (201)', validJobPost.status === 201 && validJobPost.data.success);
    const newJobId = validJobPost.data.job._id || validJobPost.data.job.id;

    // 7. Seeker applies to the newly created job
    const applyRes = await request('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seekerToken}`,
      },
      body: {
        jobId: newJobId,
        coverLetter: 'Excited about AI workflows at Zenith Tech!',
        resumeUrl: 'https://drive.google.com/test-resume.pdf',
      },
    });
    assert('Seeker can submit job application (201)', applyRes.status === 201 && applyRes.data.success);
    const newAppId = applyRes.data.application._id || applyRes.data.application.id;

    // 8. Recruiter ATS Pipeline: Recruiter views candidates for their jobs
    const recruiterPipelineRes = await request('/api/applications', {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(
      'Recruiter ATS Pipeline returns candidate applications',
      recruiterPipelineRes.status === 200 && recruiterPipelineRes.data.applications.length > 0
    );

    // 9. Recruiter moves applicant to "Shortlisted" and "Offered"
    const statusUpdateRes = await request('/api/applications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: {
        applicationId: newAppId,
        status: 'Offered',
      },
    });
    assert(
      'Recruiter updates candidate hiring stage to Offered (200)',
      statusUpdateRes.status === 200 && statusUpdateRes.data.application.status === 'Offered'
    );

    // 10. Privacy Test: Seeker cannot arbitrarily update their status
    const seekerStatusTamper = await request('/api/applications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seekerToken}`,
      },
      body: {
        applicationId: newAppId,
        status: 'Offered',
      },
    });
    assert('Privacy/Security: Seeker blocked from updating application status (403)', seekerStatusTamper.status === 403);

    // 11. Hackathon creation
    const hackPostRes = await request('/api/hackathons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: {
        title: 'Autonomous Agents Hackathon 2026',
        organizer: 'Zenith Labs',
        prizePool: '₹5,00,000',
        status: 'Live',
        teamSize: 'Up to 4',
        tags: ['Agents', 'AI', 'Next.js'],
        duration: '48 hrs',
        deadline: '4 days left',
        description: 'Build enterprise autonomous agents with human-in-the-loop workflows.',
      },
    });
    assert('Host a Hackathon creates live challenge (201)', hackPostRes.status === 201 && hackPostRes.data.success);
    const newHackId = hackPostRes.data.hackathon._id || hackPostRes.data.hackathon.id;

    // 12. Team registers for hackathon
    const teamRegRes = await request('/api/hackathons/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seekerToken}`,
      },
      body: {
        hackathonId: newHackId,
        teamName: 'Alpha Innovators',
        members: 'priya@worklance.com, karan@worklance.com',
      },
    });
    assert('Register team for hackathon succeeds (200)', teamRegRes.status === 200 && teamRegRes.data.success);

    // 13. HR Directory: Add new verified recruiter contact
    const hrContactRes = await request('/api/hr-database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: {
        name: 'Devika Sen',
        company: 'Flipkart',
        designation: 'Staff Talent Partner',
        email: 'devika.sen@flipkart.com',
        linkedIn: 'https://linkedin.com/in/devikasen-hr',
        industry: 'E-Commerce',
        city: 'Bengaluru',
      },
    });
    assert('Add verified HR contact succeeds (201)', hrContactRes.status === 201 && hrContactRes.data.success);

    // 14. AI Mock Interview Evaluation
    const evalRes = await request('/api/interview-prep/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        questionId: 'pyq_2',
        questionText: 'Design a rate limiter',
        round: 'System Design',
        answer: 'We used a sliding window counter algorithm stored in a Redis cluster with Lua scripts for atomic operations and CAP trade-offs.',
        tags: ['System Design', 'Redis', 'Node.js'],
      },
    });
    assert(
      'AI Mock Interview evaluation scores response with feedback (200)',
      evalRes.status === 200 && evalRes.data.evaluation.score >= 60
    );

    // 15. AI Resume ATS Review
    const resumeReviewRes = await request('/api/resume/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        fullName: 'Riya Sharma',
        targetTitle: 'Senior Frontend Engineer',
        summary: 'Experienced frontend engineer with 4+ years of React and Next.js experience.',
        skills: 'React, Next.js, TypeScript, Node.js, Express, MongoDB, Tailwind, Jest',
      },
    });
    assert(
      'AI Resume Review evaluates ATS score and suggestions (200)',
      resumeReviewRes.status === 200 && resumeReviewRes.data.review.score >= 70
    );

    console.log(`\n🎉 Test Results: ${passed}/${total} assertions PASSED cleanly!`);
  } catch (err) {
    console.error('Unexpected test failure:', err);
  }
}

// Give server 1.5s then run
setTimeout(runTests, 1500);
