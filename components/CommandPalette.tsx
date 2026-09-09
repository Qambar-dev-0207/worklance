'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Briefcase,
  Code,
  Users,
  FileText,
  Sparkles,
  ArrowRight,
  X,
  CornerDownLeft,
  Command,
  Compass,
  Zap,
  Copy,
  Check,
  PlusCircle,
  ExternalLink,
  Laptop
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'Navigation' | 'Quick Job Filters' | 'Smart Actions';
  icon: React.ReactNode;
  badge?: string;
  action: () => void;
}

export default function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global hotkey listener (⌘K / Ctrl+K / Esc) & custom event trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const copyCurrentUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => {
        setCopiedLink(false);
        setIsOpen(false);
      }, 800);
    }
  };

  // Curated Command Palette Items
  const allItems: CommandItem[] = useMemo(() => [
    // NAVIGATION
    {
      id: 'nav-jobs',
      title: 'Job Hub',
      description: 'Search 1,200+ verified tech roles with direct recruiter contacts',
      category: 'Navigation',
      icon: <Briefcase className="w-4 h-4 text-zinc-300" />,
      badge: '/jobs',
      action: () => { router.push('/jobs'); setIsOpen(false); },
    },
    {
      id: 'nav-resume',
      title: 'ATS Resume Builder',
      description: 'Generate high-density, single-column bot-proof resumes',
      category: 'Navigation',
      icon: <FileText className="w-4 h-4 text-zinc-300" />,
      badge: '/resume-builder',
      action: () => { router.push('/resume-builder'); setIsOpen(false); },
    },
    {
      id: 'nav-interview',
      title: 'AI Interview Prep & PYQs',
      description: 'Practice real FAANG & startup interview questions with AI feedback',
      category: 'Navigation',
      icon: <Sparkles className="w-4 h-4 text-zinc-300" />,
      badge: '/interview-prep',
      action: () => { router.push('/interview-prep'); setIsOpen(false); },
    },
    {
      id: 'nav-hr',
      title: 'HR Recruiter Directory',
      description: 'Direct outreach access to 1,200+ verified talent leaders',
      category: 'Navigation',
      icon: <Users className="w-4 h-4 text-zinc-300" />,
      badge: '/hr-database',
      action: () => { router.push('/hr-database'); setIsOpen(false); },
    },
    {
      id: 'nav-hackathons',
      title: 'Tech Hackathons Hub',
      description: 'Explore active hackathons, prize pools, and find teammates',
      category: 'Navigation',
      icon: <Code className="w-4 h-4 text-zinc-300" />,
      badge: '/hackathons',
      action: () => { router.push('/hackathons'); setIsOpen(false); },
    },
    {
      id: 'nav-profile',
      title: 'Candidate Profile & Applications',
      description: 'Manage your portfolio, saved jobs, and tracked applications',
      category: 'Navigation',
      icon: <Compass className="w-4 h-4 text-zinc-300" />,
      badge: '/profile',
      action: () => { router.push('/profile'); setIsOpen(false); },
    },

    // QUICK JOB FILTERS
    {
      id: 'job-frontend',
      title: 'Filter: Frontend & React Roles',
      description: 'Explore React, Next.js, and TypeScript frontend engineering jobs',
      category: 'Quick Job Filters',
      icon: <Laptop className="w-4 h-4 text-zinc-300" />,
      badge: 'React',
      action: () => { router.push('/jobs?keyword=Frontend'); setIsOpen(false); },
    },
    {
      id: 'job-fullstack',
      title: 'Filter: Full Stack Engineer',
      description: 'Roles requiring end-to-end frontend and distributed systems',
      category: 'Quick Job Filters',
      icon: <Briefcase className="w-4 h-4 text-zinc-300" />,
      badge: 'Full Stack',
      action: () => { router.push('/jobs?keyword=Full+Stack'); setIsOpen(false); },
    },
    {
      id: 'job-backend',
      title: 'Filter: Backend & Distributed Systems',
      description: 'Golang, Node.js, Python, and microservices architecture positions',
      category: 'Quick Job Filters',
      icon: <Code className="w-4 h-4 text-zinc-300" />,
      badge: 'Backend',
      action: () => { router.push('/jobs?keyword=Backend'); setIsOpen(false); },
    },
    {
      id: 'job-ai',
      title: 'Filter: AI & Machine Learning Roles',
      description: 'LLMs, PyTorch, Agentic AI, and Machine Learning engineering',
      category: 'Quick Job Filters',
      icon: <Zap className="w-4 h-4 text-zinc-300" />,
      badge: 'AI / ML',
      action: () => { router.push('/jobs?keyword=AI'); setIsOpen(false); },
    },
    {
      id: 'job-remote',
      title: 'Filter: 100% Remote Tech Jobs',
      description: 'Worldwide and India-friendly remote engineering positions',
      category: 'Quick Job Filters',
      icon: <GlobeIcon />,
      badge: 'Remote',
      action: () => { router.push('/jobs?remote=true'); setIsOpen(false); },
    },

    // SMART ACTIONS
    {
      id: 'action-new-resume',
      title: 'Draft New ATS Resume',
      description: 'Launch the high-precision ATS editor with recruiter templates',
      category: 'Smart Actions',
      icon: <PlusCircle className="w-4 h-4 text-zinc-300" />,
      badge: 'Resume',
      action: () => { router.push('/resume-builder'); setIsOpen(false); },
    },
    {
      id: 'action-prep-system',
      title: 'Practice System Design PYQs',
      description: 'Deep dive into rate limiters, caching, and scalable architecture',
      category: 'Smart Actions',
      icon: <Sparkles className="w-4 h-4 text-zinc-300" />,
      badge: 'System Design',
      action: () => { router.push('/interview-prep?category=System+Design'); setIsOpen(false); },
    },
    {
      id: 'action-post-job',
      title: 'Post a New Job Opportunity',
      description: 'Reach thousands of verified software engineers and candidates',
      category: 'Smart Actions',
      icon: <ExternalLink className="w-4 h-4 text-zinc-300" />,
      badge: 'Recruiter',
      action: () => { router.push('/jobs/post'); setIsOpen(false); },
    },
    {
      id: 'action-copy-url',
      title: copiedLink ? 'Link Copied to Clipboard!' : 'Copy Current Page URL',
      description: 'Quickly share this page with colleagues or candidates',
      category: 'Smart Actions',
      icon: copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-300" />,
      badge: copiedLink ? 'Copied' : 'Share',
      action: copyCurrentUrl,
    },
  ], [router, copiedLink]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase().trim();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.badge?.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  // Handle keyboard navigation inside the list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="command-palette-backdrop"
      onClick={() => setIsOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 16px 20px',
        animation: 'paletteFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="command-palette-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          background: '#09090B',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'paletteScaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* HEADER INPUT */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, job title, or action..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: '15.5px',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#A1A1AA',
                cursor: 'pointer',
              }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 7px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#A1A1AA',
            }}
          >
            ESC
          </div>
        </div>

        {/* RESULTS LIST */}
        <div
          ref={listRef}
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {filteredItems.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#71717A',
                fontSize: '14px',
              }}
            >
              <p style={{ margin: 0, fontWeight: 500 }}>No results found for &ldquo;{query}&rdquo;</p>
              <p style={{ margin: '6px 0 0', fontSize: '12.5px', color: '#52525B' }}>
                Try searching for &ldquo;Jobs&rdquo;, &ldquo;Resume&rdquo;, &ldquo;Hackathons&rdquo;, or &ldquo;Frontend&rdquo;
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-index={index}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(255, 255, 255, 0.09)' : 'transparent',
                    border: isSelected ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
                    transition: 'background 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: isSelected ? '#FFFFFF' : '#E4E4E7',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#71717A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '100px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: '#A1A1AA',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isSelected && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '11px',
                          color: '#A1A1AA',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <CornerDownLeft className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER SHORTCUT HINTS */}
        <div
          style={{
            padding: '10px 18px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11.5px',
            color: '#71717A',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 5px', borderRadius: '4px', color: '#D4D4D8' }}>↑</kbd>
              <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 5px', borderRadius: '4px', color: '#D4D4D8' }}>↓</kbd> Navigate
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 5px', borderRadius: '4px', color: '#D4D4D8' }}>↵</kbd> Select
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 5px', borderRadius: '4px', color: '#D4D4D8' }}>esc</kbd> Dismiss
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#52525B' }}>
            <span>Worklance</span>
            <Command className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg className="w-4 h-4 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
