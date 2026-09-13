'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Zap, 
  RefreshCw, 
  Cpu, 
  TrendingUp, 
  Copy, 
  Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { triggerScoreBoostConfetti } from '@/lib/confetti';
import AnimatedCounter from './AnimatedCounter';

interface RoleTemplate {
  role: string;
  icon: string;
  keywords: string[];
  unoptimized: {
    text: string;
    score: number;
    issues: string[];
  };
  optimized: {
    text: string;
    score: number;
    highlights: string[];
    quantifiedImpact: string;
  };
}

const TEMPLATES: RoleTemplate[] = [
  {
    role: 'Full Stack Engineer',
    icon: '💻',
    keywords: ['Next.js 14', 'TypeScript', 'Redis Caching', 'PostgreSQL', 'p95 Latency', 'Docker'],
    unoptimized: {
      text: 'Worked on backend and frontend code for the web platform, helped fix bugs and made some queries run faster.',
      score: 46,
      issues: [
        'Passive phrasing ("worked on", "helped fix")',
        'Zero quantified metrics or impact numbers',
        'Lacks target ATS keywords (Next.js, Redis, Latency)',
      ],
    },
    optimized: {
      text: 'Architected high-throughput Next.js 14 & TypeScript services integrated with Redis caching, slashing p95 API latency by 42% across 250,000+ monthly active users.',
      score: 98,
      highlights: ['Next.js 14', 'TypeScript', 'Redis caching', 'slashing p95 API latency by 42%', '250,000+ MAU'],
      quantifiedImpact: '+42% speedup · 250K users supported',
    },
  },
  {
    role: 'AI / ML Engineer',
    icon: '🤖',
    keywords: ['LLM Fine-Tuning', 'PyTorch', 'Vector Embeddings', 'RAG Pipeline', 'Inference Latency', 'vLLM'],
    unoptimized: {
      text: 'Helped build AI models with Python and tested different prompts to make the chatbot give better answers.',
      score: 51,
      issues: [
        'Ambiguous scope ("helped build", "tested prompts")',
        'No precision benchmarks or model evaluation metrics',
        'Missing enterprise GenAI keywords (RAG, Embeddings, PyTorch)',
      ],
    },
    optimized: {
      text: 'Engineered production RAG pipeline using PyTorch, Qdrant vector search, and fine-tuned Llama-3 models; curtailed hallucination rate by 34% while boosting token throughput by 2.8x.',
      score: 97,
      highlights: ['production RAG pipeline', 'PyTorch', 'Qdrant vector search', 'curtailed hallucination rate by 34%', '2.8x throughput'],
      quantifiedImpact: '-34% hallucinations · 2.8x faster inference',
    },
  },
  {
    role: 'Cloud & DevOps Architect',
    icon: '☁️',
    keywords: ['Kubernetes', 'Terraform', 'AWS EKS', 'CI/CD Pipelines', 'Zero Downtime', 'Cost Optimization'],
    unoptimized: {
      text: 'Responsible for cloud servers on AWS and setting up deployment scripts so developers can release updates.',
      score: 49,
      issues: [
        'Duty-based description rather than achievement-oriented',
        'No cost savings, uptime, or deployment frequency metrics',
        'Missing modern IaC keywords (Terraform, Kubernetes)',
      ],
    },
    optimized: {
      text: 'Spearheaded automated multi-region Kubernetes migration on AWS via Terraform IaC, reducing annual cloud infrastructure spend by $38,000 while maintaining 99.99% service uptime.',
      score: 99,
      highlights: ['Kubernetes migration', 'AWS via Terraform IaC', 'reducing annual cloud spend by $38,000', '99.99% uptime'],
      quantifiedImpact: '$38,000 annual cloud savings · 99.99% uptime',
    },
  },
];

export default function InteractiveAtsTester() {
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [isOptimized, setIsOptimized] = useState(true);
  const [copied, setCopied] = useState(false);

  const active = TEMPLATES[selectedRoleIndex];
  const currentScore = isOptimized ? active.optimized.score : active.unoptimized.score;
  const currentText = isOptimized ? active.optimized.text : active.unoptimized.text;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    toast.success(isOptimized ? 'Optimized bullet copied!' : 'Draft bullet copied!', {
      description: 'Ready to paste into your resume or job application.',
      icon: isOptimized ? '✨' : '📋',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="section-pad" id="ats-diagnostic" style={{ background: '#09090B', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div className="sec-head center reveal" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: '36px' }}>
          <div
            className="eyebrow"
            style={{
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              borderColor: 'rgba(255, 255, 255, 0.18)',
            }}
          >
            <Sparkles size={13} style={{ marginRight: '6px' }} />
            Interactive ATS Playground
          </div>
          <h2 style={{ color: '#FFFFFF', fontSize: '38px', fontWeight: 800 }}>
            Test Your Resume Against Recruiter ATS Engines
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', maxWidth: '680px', margin: '0 auto', fontSize: '16px' }}>
            Workday, Greenhouse, and Lever filter out 75% of resumes before human HR ever reads them. See how Worklance AI converts weak bullet points into high-ranking ATS magnets.
          </p>
        </div>

        {/* Interactive Sandbox Card */}
        <div
          className="reveal"
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            background: 'rgba(18, 18, 24, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Top Role Selector Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              paddingBottom: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {TEMPLATES.map((item, idx) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => {
                    setSelectedRoleIndex(idx);
                    setIsOptimized(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '100px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: selectedRoleIndex === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedRoleIndex === idx ? '#09090B' : 'rgba(255, 255, 255, 0.7)',
                    border: selectedRoleIndex === idx ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.role}</span>
                </button>
              ))}
            </div>

            {/* Toggle Switch */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '4px',
                borderRadius: '100px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <button
                type="button"
                onClick={() => setIsOptimized(false)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  background: !isOptimized ? '#EF4444' : 'transparent',
                  color: !isOptimized ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                }}
              >
                Raw Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isOptimized) {
                    setIsOptimized(true);
                    triggerScoreBoostConfetti();
                    toast.success('AI ATS Optimization Applied!', {
                      description: `Score boosted from ${active.unoptimized.score}% to ${active.optimized.score}%!`,
                    });
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  background: isOptimized ? '#10B981' : 'transparent',
                  color: isOptimized ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                  boxShadow: isOptimized ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                }}
              >
                <Sparkles size={12} />
                AI Optimized
              </button>
            </div>
          </div>

          {/* Diagnostic Display Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginTop: '24px',
              alignItems: 'start',
            }}
          >
            {/* Left: Text Viewer */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: isOptimized ? '#10B981' : '#EF4444',
                    }}
                  >
                    {isOptimized ? '✦ Worklance AI Engineered Bullet' : '⚠️ Unoptimized Candidate Draft'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={isOptimized ? `opt-${selectedRoleIndex}` : `raw-${selectedRoleIndex}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    style={{
                      fontSize: '15px',
                      lineHeight: '1.65',
                      color: isOptimized ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                      fontFamily: "'Inter', sans-serif",
                      fontStyle: isOptimized ? 'normal' : 'italic',
                    }}
                  >
                    {currentText}
                  </motion.p>
                </AnimatePresence>
              </div>

              {isOptimized && (
                <div
                  style={{
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#10B981',
                  }}
                >
                  <TrendingUp size={14} />
                  <span>{active.optimized.quantifiedImpact}</span>
                </div>
              )}
            </div>

            {/* Right: ATS Metrics Telemetry */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              {/* Score Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
                  ATS Pass Probability:
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '4px',
                    fontSize: '28px',
                    fontWeight: 800,
                    color: isOptimized ? '#10B981' : '#EF4444',
                  }}
                >
                  <AnimatedCounter value={currentScore} duration={800} />
                  <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.4)' }}>/100</span>
                </div>
              </div>

              {/* Progress Bar Gauge */}
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '100px',
                  overflow: 'hidden',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    width: `${currentScore}%`,
                    height: '100%',
                    background: isOptimized ? 'linear-gradient(90deg, #10B981, #34D399)' : '#EF4444',
                    borderRadius: '100px',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>

              {/* Keyword Cloud or Issues */}
              {isOptimized ? (
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '8px' }}>
                    Identified High-Demand Keywords
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {active.keywords.map((kw) => (
                      <span
                        key={kw}
                        style={{
                          fontSize: '11.5px',
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#34D399',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          padding: '3px 9px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckCircle2 size={11} />
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#EF4444', marginBottom: '8px' }}>
                    Detected Algorithmic Red Flags
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {active.unoptimized.issues.map((iss, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: '12px',
                          color: 'rgba(255, 255, 255, 0.75)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '6px',
                        }}
                      >
                        <AlertCircle size={13} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{iss}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 10px #10B981',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Parser Engines: <strong>Workday</strong> · <strong>Greenhouse</strong> · <strong>Lever</strong> · <strong>Taleo</strong>
              </span>
            </div>

            <Link
              href="/resume-builder"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FFFFFF',
                color: '#09090B',
                fontWeight: 700,
                fontSize: '13.5px',
                padding: '10px 22px',
                borderRadius: '100px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>Launch Full Resume Studio</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
