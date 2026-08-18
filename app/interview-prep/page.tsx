'use client';

import { useState, useEffect, useRef } from 'react';
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

interface PracticeHistoryItem {
  id: string;
  question: string;
  company: string;
  round: string;
  score: number;
  date: string;
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
  {
    id: 'pyq_6',
    company: 'Microsoft',
    round: 'Coding Challenge',
    question: 'How do you detect and remove a cycle in a singly linked list in O(N) time and O(1) space?',
    tags: ['Data Structures', 'Pointers', 'Floyd Algorithm'],
    answer: 'Use Floyd\'s Cycle-Finding Algorithm (Tortoise and Hare). Initialize two pointers moving at 1x and 2x speeds. When they meet, reset one pointer to the head and move both at 1x speed to find the cycle start node, then break the next pointer.',
    tips: 'Mention edge cases like head being null or list having a single element without a loop.',
  },
  {
    id: 'pyq_7',
    company: 'Flipkart',
    round: 'Technical Round',
    question: 'What strategies do you use to optimize React rendering performance in heavy catalog interfaces?',
    tags: ['React', 'Performance', 'Virtualization', 'Memoization'],
    answer: 'Implement windowing / list virtualization using react-window, memoize expensive calculations with useMemo, stabilize handler callbacks with useCallback, prevent unneeded re-renders with React.memo, and debounce search inputs.',
    tips: 'Mention profiling with React DevTools Profiler to identify unneeded commit phase renders.',
  },
  {
    id: 'pyq_8',
    company: 'Uber',
    round: 'System Design',
    question: 'Architect a real-time driver dispatching system tracking live driver GPS locations with sub-second updates.',
    tags: ['System Design', 'Geohash', 'WebSockets', 'Kafka'],
    answer: 'Drivers stream GPS pings via persistent WebSocket connections to an ingestion gateway. Locations are buffered in Kafka and indexed in Redis Geospatial or QuadTree / Google S2 cells. Rider requests query the nearest drivers using geo-radius indexes.',
    tips: 'Discuss handling cellular reconnection drops and battery consumption optimization.',
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

  // Speech Recognition & Audio Simulation States
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [practiceHistory, setPracticeHistory] = useState<PracticeHistoryItem[]>([]);

  useEffect(() => {
    const histStr = localStorage.getItem('worklance_interview_history');
    if (histStr) {
      try {
        setPracticeHistory(JSON.parse(histStr));
      } catch (e) {}
    }
  }, []);

  const filteredPyqs = samplePyqs.filter((p) => {
    if (selectedCompany !== 'All' && p.company !== selectedCompany) return false;
    if (selectedRound !== 'All' && p.round !== selectedRound) return false;
    return true;
  });

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setUserSpeech(transcript.trim());
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
      } catch (e) {
        setIsRecording(false);
      }
    } else {
      // Fallback simulation mode
      setIsRecording(true);
      setTimeout(() => {
        if (!userSpeech) {
          setUserSpeech(
            'In my experience, we implemented a sliding window rate limiter backed by Redis clusters. We utilized Lua scripts to guarantee atomic counters and prevent race conditions across distributed gateway instances.'
          );
        }
        setIsRecording(false);
      }, 3000);
    }
  };

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

        // Save to practice history
        const newHistoryItem: PracticeHistoryItem = {
          id: 'hist_' + Date.now(),
          question: aiPracticeModal.question,
          company: aiPracticeModal.company,
          round: aiPracticeModal.round,
          score: data.evaluation.score,
          date: new Date().toLocaleDateString(),
        };

        const updatedHistory = [newHistoryItem, ...practiceHistory.slice(0, 9)];
        setPracticeHistory(updatedHistory);
        localStorage.setItem('worklance_interview_history', JSON.stringify(updatedHistory));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleFillSample = () => {
    if (!aiPracticeModal) return;
    setUserSpeech(
      `To solve this, I would approach it systematically: First, establish the core algorithm utilizing ${aiPracticeModal.tags.slice(0, 2).join(' and ')}. Next, handle edge cases with optimal time and space complexity, ensuring low latency and fault-tolerant architecture.`
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO SECTION */}
      <div style={{ background: '#000000', color: '#fff', padding: '54px 0 44px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div className="eyebrow" style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
              Interview Intelligence
            </div>
            <h1 style={{ fontSize: '38px', color: '#fff', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.02em' }}>
              Company-Wise Interview Questions & AI Practice
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15.5px', maxWidth: '650px', marginBottom: '24px' }}>
              Practice real technical & behavioral questions asked by top tech firms with instant AI evaluation and voice feedback.
            </p>

            {/* FILTERS ROW */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginRight: '4px' }}>COMPANY:</span>
              {['All', 'Zenith Tech Labs', 'Nexora Innovations', 'Google', 'Amazon', 'Microsoft', 'Flipkart', 'Uber'].map((c) => (
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

          {practiceHistory.length > 0 && (
            <div style={{ background: '#111115', padding: '14px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase' }}>Recent AI Mock Score</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF' }}>{practiceHistory[0].score}%</div>
              <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.5)' }}>{practiceHistory[0].company} ({practiceHistory.length} practiced)</div>
            </div>
          )}
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
                    style={{ padding: '8px 18px', fontSize: '13px', whiteSpace: 'nowrap', borderRadius: '100px', fontWeight: 700 }}
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

      {/* AI PRACTICE MODAL */}
      {aiPracticeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setAiPracticeModal(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '620px',
              width: '100%',
              padding: '36px',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setAiPracticeModal(null);
                setAiFeedback(null);
                setUserSpeech('');
                if (isRecording) toggleRecording();
              }}
              style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '18px', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', color: '#71717A' }}
            >
              ✕
            </button>

            <span className="eyebrow" style={{ marginBottom: '8px' }}>AI Mock Interview Evaluator</span>
            <h2 style={{ fontSize: '19px', fontWeight: 800, marginBottom: '4px', color: '#000000', letterSpacing: '-0.02em' }}>{aiPracticeModal.question}</h2>
            <div style={{ fontSize: '12.5px', color: '#71717A', marginBottom: '18px' }}>
              Targeting: {aiPracticeModal.company} · {aiPracticeModal.round}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#18181B' }}>
                  Your Response (Speak into Mic or Type):
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleFillSample}
                    style={{ fontSize: '11.5px', color: '#71717A', background: '#F4F4F5', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}
                  >
                    Auto-Fill Example
                  </button>
                  <button
                    type="button"
                    onClick={toggleRecording}
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: '100px',
                      background: isRecording ? '#DC2626' : '#000000',
                      color: '#FFFFFF',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isRecording ? '🔴 Recording... Click to Stop' : '🎤 Speak Answer'}
                  </button>
                </div>
              </div>

              {isRecording && (
                <div style={{ background: '#000000', color: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', marginBottom: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ animation: 'pulse 1s infinite' }}>🎙️</span>
                  <span>Listening live... Speak clearly about your technical approach.</span>
                </div>
              )}

              <textarea
                rows={5}
                value={userSpeech}
                onChange={(e) => setUserSpeech(e.target.value)}
                placeholder="Type your response or click 'Speak Answer' to talk into your microphone..."
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E4E4E7', fontSize: '13.5px', outline: 'none', lineHeight: 1.5 }}
              />
            </div>

            <button
              onClick={handleEvaluateAnswer}
              disabled={evaluating || !userSpeech || userSpeech.trim().length < 10}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: '100px', padding: '12px', fontSize: '14px', fontWeight: 700 }}
            >
              {evaluating ? 'Analyzing Technical Depth & Delivery...' : '⚡ Evaluate Response with AI'}
            </button>

            {aiFeedback && (
              <div style={{ marginTop: '20px', background: '#F4F4F5', borderRadius: '16px', padding: '20px', border: '1px solid #E4E4E7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#71717A' }}>AI Evaluation Score</span>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: '#000000' }}>{aiFeedback.score}%</span>
                </div>

                <div style={{ fontSize: '13.5px', color: '#18181B', lineHeight: 1.5, marginBottom: '12px' }}>
                  {aiFeedback.feedback}
                </div>

                {aiFeedback.matchedKeywords && aiFeedback.matchedKeywords.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#059669', display: 'block', marginBottom: '4px' }}>
                      ✓ Matched Technical Concepts:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {aiFeedback.matchedKeywords.map((k: string, i: number) => (
                        <span key={i} style={{ fontSize: '11px', background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {aiFeedback.missingKeywords && aiFeedback.missingKeywords.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#D97706', display: 'block', marginBottom: '4px' }}>
                      ⚡ Recommended Concepts to Include:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {aiFeedback.missingKeywords.map((k: string, i: number) => (
                        <span key={i} style={{ fontSize: '11px', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '12px', color: '#52525B', fontStyle: 'italic', borderTop: '1px solid #E4E4E7', paddingTop: '10px' }}>
                  💡 {aiFeedback.tips}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
