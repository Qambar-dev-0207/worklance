'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div>
            <div className="foot-logo" style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '12px' }}>
              <img src="/logo.png" alt="Worklance Logo" className="logo-mark-img" width={34} height={34} />
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Worklance</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', maxWidth: '280px', lineHeight: 1.6 }}>
              The Career Operating System combining LinkedIn jobs & networking, Naukri recruiter directory, and Unstop hackathons & interview prep.
            </p>
          </div>
          <div className="foot-col">
            <h5>Product</h5>
            <ul>
              <li><Link href="/jobs">Job Hub</Link></li>
              <li><Link href="/hr-database">HR Directory</Link></li>
              <li><Link href="/hackathons">Hackathons</Link></li>
              <li><Link href="/interview-prep">Interview Prep</Link></li>
              <li><Link href="/resume-builder">ATS Resume Builder</Link></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>For Recruiters</h5>
            <ul>
              <li><Link href="/jobs/post">Post a Job</Link></li>
              <li><Link href="/hr-database">Direct Candidate Outreach</Link></li>
              <li><Link href="/register">Recruiter Sign Up</Link></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>Support & Legal</h5>
            <ul>
              <li><Link href="/#faq">FAQ & Guidance</Link></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Worklance. All rights reserved.</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontWeight: 600 }}>Connect · Train · Get Hired</span>
        </div>
      </div>
    </footer>
  );
}
