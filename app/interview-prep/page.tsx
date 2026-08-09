'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface PyqItem {
  id: string;
  company: string;
  round: 'Technical Round' | 'HR Round' | 'Coding Challenge' | 'System Design' | 'Aptitude';
  question: string;
  tags: string[];
  answer: string;
  tips: string;
}

const samplePyqs: PyqItem[] = [
  {
    id: 'pyq_1',
    company: 'Zenith Tech Labs',
    round: 'Technical Round',
    question: 'How does Next.js 14 App Router differ from Pages Router in server-side rendering and data fetching?',
    tags: ['React', 'Next.js', 'SSR', 'Frontend'],
    answer: 'Next.js 14 App Router utilizes React Server Components (RSC) by default. Data fetching is done directly inside async components using native fetch API extensions with automatic deduplication, revalidation, and streaming SSR via React Suspense.',
    tips: 'Highlight Server vs Client Components, caching strategies (SSG vs ISR vs SSR), and layouts.',
  },
  {
    id: 'pyq_2',
    company: 'Nexora Innovations',
    round: 'System Design',
    question: 'Design a high-frequency API rate limiter for fintech payment processing handling 50k req/sec.',
    tags: ['System Design', 'Node.js', 'Redis', 'Fintech'],
    answer: 'Use a Sliding Window Counter or Token Bucket algorithm stored in Redis cluster with Lua scripts for atomic increments. Implement distributed rate limiting headers (X-RateLimit-Remaining) and API Gateway level throttling.',
    tips: 'Discuss trade-offs between Token Bucket and Leaky Bucket, latency impact, and fallback strategies.',
  },
  {
    id: 'pyq_3',
    company: 'Google',
    round: 'Coding Challenge',
    question: 'Given an array of integers nums, find the contiguous subarray with the largest sum and return its sum.',
    tags: ['Algorithms', 'Dynamic Programming', 'Kadane Algorithm'],
    answer: 'Apply Kadanes Algorithm in O(N) time and O(1) space. Maintain maxEndingHere = max(nums[i], maxEndingHere + nums[i]) and track maxSoFar.',
    tips: 'Clarify negative integer handling and return empty array vs single max element.',
  },
  {
    id: 'pyq_4',
    company: 'Zenith Tech Labs',
    round: 'HR Round',
    question: 'Tell me about a time you had a technical disagreement with your team lead on architectural choice.',
    tags: ['HR', 'Behavioral', 'STAR Method'],
    answer: 'Use the STAR method: Situation (Conflicting views on GraphQL vs REST), Task (Decide API protocol under deadline), Action (Benchmarked latency, built POC, presented data objectively), Result (Aligned team on hybrid approach).',
    tips: 'Emphasize data-driven decision making, empathy, and team alignment over ego.',
  },
  {
    id: 'pyq_5',
    company: 'Amazon',
    round: 'Technical Round',
    question: 'Explain how Node.js Event Loop works and how macro-tasks differ from micro-tasks.',
    tags: ['Node.js', 'Event Loop', 'Backend'],
    answer: 'Node.js single-threaded event loop processes micro-tasks (process.nextTick, Promise callbacks) before moving to macro-task queues (timers, I/O callbacks, setImmediate).',
    tips: 'Draw or explain the 6 phases of libuv event loop.',
  },
];

export default function InterviewPrepPage() {
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedRound, setSelectedRound] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>('pyq_1');
  const [aiPracticeModal, setAiPracticeModal] = useState<PyqItem | null>(null);
  const [userSpeech, setUserSpeech] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const uStr = localStorage.getItem('worklance_user');
    if (uStr) {
      try {
        setCurrentUser(JSON.parse(uStr));
      } catch (e) {}
    }
  }, []);

  const filteredPyqs = samplePyqs.filter((p) => {
    if (selectedCompany !== 'All' && p.company !== selectedCompany) return false;
    if (selectedRound !== 'All' && p.round !== selectedRound) return false;
    return true;
  });

  const handleSimulateAiAnswer = () => {
    if (!userSpeech) return;
    setAiFeedback('🤖 AI Analysis: Great answer! You covered 85% of key technical terms. Tip: Explicitly mention performance metrics for extra points.');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-soft)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO SECTION */}
      <div style={{ background: 'var(--navy-deep)', color: '#fff', padding: '50px 0 40px' }}>
        <div className="container">
          <div className="eyebrow" style={{ color: 'var(--orange-2)' }}>Unstop + Naukri PYQ Engine</div>
          <h1 style={{ fontSize: '38px', color: '#fff', marginBottom: '10px' }}>
            Company-Wise Interview Questions & AI Practice
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15.5px', maxWidth: '650px', marginBottom: '24px' }}>
            Practice real technical & HR questions from Zenith Tech, Nexora, Google, Amazon, TCS, and Infosys.
          </p>

          {/* FILTERS ROW */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>COMPANY:</span>
            {['All', 'Zenith Tech Labs', 'Nexora Innovations', 'Google', 'Amazon'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCompany(c)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '100px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: selectedCompany === c ? 'var(--orange-2)' : 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  transition: 'all 0.2s ease',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN PYQ FEED */}
      <div className="container" style={{ padding: '40px 32px 80px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
            {filteredPyqs.length} Interview Preparation Questions
          </h2>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Round:</span>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '100px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px' }}
            >
              <option value="All">All Rounds</option>
              <option value="Technical Round">Technical Round</option>
              <option value="HR Round">HR Round</option>
              <option value="Coding Challenge">Coding Challenge</option>
              <option value="System Design">System Design</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredPyqs.map((pyq) => {
            const isExpanded = expandedId === pyq.id;
            return (
              <div key={pyq.id} className="pyq-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)', background: 'var(--bg-soft-2)', padding: '3px 10px', borderRadius: '100px' }}>
                        {pyq.company}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669', background: '#ECFDF5', padding: '3px 10px', borderRadius: '100px' }}>
                        {pyq.round}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--navy-deep)', lineHeight: 1.4 }}>
                      {pyq.question}
                    </h3>
                  </div>

                  <button
                    onClick={() => setAiPracticeModal(pyq)}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                  >
                    AI Practice 🎤
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {pyq.tags.map((t, idx) => (
                    <span key={idx} style={{ fontSize: '11.5px', background: 'var(--bg-soft-2)', color: 'var(--navy)', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : pyq.id)}
                  style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--orange-2)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {isExpanded ? 'Hide Ideal Solution ▲' : 'View Ideal Solution & Tips ▼'}
                </button>

                {isExpanded && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: 'var(--bg-soft)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--orange-2)' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Ideal Answer Approach</div>
                      <p style={{ fontSize: '14px', color: 'var(--navy-deep)', lineHeight: 1.6 }}>{pyq.answer}</p>
                    </div>

                    <div style={{ background: '#FEF3C7', padding: '14px', borderRadius: '12px', color: '#78350F', fontSize: '13px' }}>
                      💡 <strong>Recruiter Tip:</strong> {pyq.tips}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI PRACTICE MODAL */}
      {aiPracticeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', maxWidth: '620px', width: '100%', padding: '32px', position: 'relative' }}>
            <button onClick={() => { setAiPracticeModal(null); setAiFeedback(''); setUserSpeech(''); }} style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '18px', fontWeight: 700 }}>✕</button>

            <span className="eyebrow" style={{ color: '#6366F1' }}>AI Mock Interview Trainer</span>
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>{aiPracticeModal.question}</h2>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Targeting: {aiPracticeModal.company} ({aiPracticeModal.round})
            </div>

            <textarea
              rows={4}
              value={userSpeech}
              onChange={(e) => setUserSpeech(e.target.value)}
              placeholder="Type or speak your answer to test AI feedback..."
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', fontSize: '14px', outline: 'none', marginBottom: '16px' }}
            />

            {aiFeedback && (
              <div style={{ background: '#ECFDF5', color: '#065F46', padding: '14px', borderRadius: '12px', fontSize: '13.5px', marginBottom: '16px', fontWeight: 600 }}>
                {aiFeedback}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setAiPracticeModal(null)} className="btn btn-outline">Close</button>
              <button onClick={handleSimulateAiAnswer} className="btn btn-primary">Analyze Answer 🚀</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
