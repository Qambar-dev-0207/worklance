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
  const [evaluating, setEvaluating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<any>(null);

  const filteredPyqs = samplePyqs.filter((p) => {
    if (selectedCompany !== 'All' && p.company !== selectedCompany) return false;
    if (selectedRound !== 'All' && p.round !== selectedRound) return false;
    return true;
  });

  const handleEvaluateAnswer = async () => {
    if (!userSpeech || !aiPracticeModal) return;
    setEvaluating(true);
    try {
      const res = await fetch('/api/interview-prep/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: aiPracticeModal.id,
          questionText: aiPracticeModal.question,
          round: aiPracticeModal.round,
          answer: userSpeech,
          tags: aiPracticeModal.tags,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiFeedback(data.evaluation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO SECTION (MONOTONE) */}
      <div style={{ background: '#000000', color: '#fff', padding: '54px 0 44px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container">
          <div className="eyebrow" style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
            Interview Intelligence
          </div>
          <h1 style={{ fontSize: '38px', color: '#fff', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.02em' }}>
            Company-Wise Interview Questions & AI Practice
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15.5px', maxWidth: '650px', marginBottom: '24px' }}>
            Practice real technical & behavioral questions asked by top tech firms with instant AI evaluation.
          </p>

          {/* FILTERS ROW */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginRight: '4px' }}>COMPANY:</span>
            {['All', 'Zenith Tech Labs', 'Nexora Innovations', 'Google', 'Amazon'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCompany(c)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '100px',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: selectedCompany === c ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
                  color: selectedCompany === c ? '#000000' : '#FFFFFF',
                  border: selectedCompany === c ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
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
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#000000', letterSpacing: '-0.02em' }}>
            {filteredPyqs.length} Interview Questions Available
          </h2>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#71717A' }}>Round:</span>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '100px', border: '1px solid #E4E4E7', background: '#fff', fontSize: '13px', fontWeight: 600, outline: 'none' }}
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
              <div key={pyq.id} className="pyq-card" style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E4E4E7', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', background: '#000000', padding: '3px 12px', borderRadius: '100px' }}>
                        {pyq.company}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#18181B', background: '#F4F4F5', padding: '3px 10px', borderRadius: '100px', border: '1px solid #E4E4E7' }}>
                        {pyq.round}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#000000', lineHeight: 1.4, letterSpacing: '-0.02em' }}>
                      {pyq.question}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      setAiPracticeModal(pyq);
                      setAiFeedback(null);
                      setUserSpeech('');
                    }}
                    className="btn btn-primary"
                    style={{ padding: '8px 18px', fontSize: '13px', whiteSpace: 'nowrap', borderRadius: '100px' }}
                  >
                    AI Practice 🎤
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {pyq.tags.map((t, idx) => (
                    <span key={idx} style={{ fontSize: '11.5px', background: '#F4F4F5', color: '#52525B', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : pyq.id)}
                  style={{ fontSize: '13px', fontWeight: 700, color: '#000000', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'underline' }}
                >
                  {isExpanded ? 'Hide Ideal Solution ▲' : 'View Ideal Solution & Tips ▼'}
                </button>

                {isExpanded && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E4E4E7', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: '#F4F4F5', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #000000' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#71717A', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ideal Answer Structure</div>
                      <p style={{ fontSize: '13.5px', color: '#18181B', lineHeight: 1.6 }}>{pyq.answer}</p>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E4E4E7', color: '#27272A', fontSize: '13px' }}>
                      💡 <strong>Recruiter Tip:</strong> {pyq.tips}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI PRACTICE MODAL (MONOTONE) */}
      {aiPracticeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setAiPracticeModal(null)}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '620px', width: '100%', padding: '36px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setAiPracticeModal(null); setAiFeedback(null); setUserSpeech(''); }} style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '18px', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', color: '#71717A' }}>✕</button>

            <span className="eyebrow" style={{ marginBottom: '8px' }}>AI Mock Interview Evaluator</span>
            <h2 style={{ fontSize: '19px', fontWeight: 800, marginBottom: '4px', color: '#000000', letterSpacing: '-0.02em' }}>{aiPracticeModal.question}</h2>
            <div style={{ fontSize: '12.5px', color: '#71717A', marginBottom: '18px' }}>
              Targeting: {aiPracticeModal.company} · {aiPracticeModal.round}
            </div>

            <textarea
              rows={4}
              value={userSpeech}
              onChange={(e) => setUserSpeech(e.target.value)}
              placeholder="Type your response here to test technical keyword accuracy, clarity, and structure..."
              style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E4E4E7', fontSize: '14px', outline: 'none', marginBottom: '16px', lineHeight: 1.5 }}
            />

            {aiFeedback && (
              <div style={{ background: '#F4F4F5', border: '1px solid #E4E4E7', padding: '16px', borderRadius: '16px', fontSize: '13px', marginBottom: '16px', color: '#000000' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>Score: {aiFeedback.score}%</div>
                  <span style={{ fontSize: '11px', background: '#000000', color: '#FFFFFF', padding: '3px 10px', borderRadius: '100px', fontWeight: 700 }}>AI Evaluated</span>
                </div>
                <div style={{ color: '#27272A', marginBottom: '6px', lineHeight: 1.5 }}>{aiFeedback.feedback}</div>
                {aiFeedback.tips && <div style={{ fontSize: '12px', color: '#71717A' }}>💡 {aiFeedback.tips}</div>}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setAiPracticeModal(null)} className="btn btn-outline" style={{ borderRadius: '100px', padding: '9px 20px', fontSize: '13.5px' }}>Close</button>
              <button onClick={handleEvaluateAnswer} disabled={evaluating || !userSpeech} className="btn btn-primary" style={{ borderRadius: '100px', padding: '9px 22px', fontSize: '13.5px' }}>
                {evaluating ? 'Analyzing Answer...' : 'Evaluate Answer 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
