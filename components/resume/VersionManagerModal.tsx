'use client';

import React, { useState } from 'react';
import { useResumeStore } from '@/lib/resume/store';

interface VersionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VersionManagerModal({ isOpen, onClose }: VersionManagerModalProps) {
  const { variants, activeVariantId, switchVariant, createVariant, deleteVariant, renameVariant } = useResumeStore();

  const [newVariantName, setNewVariantName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!newVariantName.trim()) {
      alert('Please enter a version name (e.g. "Google - SWE Version" or "Data Analyst Version")');
      return;
    }
    createVariant(newVariantName.trim(), targetRole.trim(), targetCompany.trim());
    setNewVariantName('');
    setTargetRole('');
    setTargetCompany('');
  };

  const handleStartRename = (id: string, current: string) => {
    setEditingId(id);
    setEditName(current);
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      renameVariant(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#09090B',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          padding: '32px',
          width: '100%',
          maxWidth: '640px',
          color: '#FFFFFF',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              RESUME VARIANT ENGINE
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '2px 0 0 0' }}>
              Targeted Resume Versions
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#A1A1AA', fontSize: '22px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '12.5px', color: '#A1A1AA', lineHeight: 1.45, margin: '0 0 20px 0' }}>
          Maintain a Master Resume while cloning targeted variants customized for specific applications (e.g., Google, Amazon, Microsoft, Startups) with tailored summaries and skill priorities.
        </p>

        {/* Existing Variants List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {variants.map((v) => {
            const isActive = v.id === activeVariantId;
            return (
              <div
                key={v.id}
                style={{
                  background: isActive ? '#18181B' : '#111115',
                  border: isActive ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  {editingId === v.id ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{
                          background: '#09090B',
                          border: '1px solid #E4E4E7',
                          borderRadius: '6px',
                          color: '#FFF',
                          padding: '4px 8px',
                          fontSize: '13px',
                        }}
                      />
                      <button
                        onClick={() => handleSaveRename(v.id)}
                        style={{ background: '#10B981', color: '#000', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{v.versionName}</span>
                        {isActive && (
                          <span style={{ background: '#064E3B', color: '#6EE7B7', fontSize: '10px', fontWeight: 800, padding: '1px 7px', borderRadius: '100px' }}>
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#71717A', marginTop: '2px' }}>
                        Target: {v.targetJobRole || v.personal.targetTitle || 'General'}
                        {v.targetCompany ? ` • ${v.targetCompany}` : ''}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {!isActive && (
                    <button
                      onClick={() => switchVariant(v.id)}
                      style={{
                        background: '#FFFFFF',
                        color: '#000000',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        padding: '5px 12px',
                        borderRadius: '100px',
                        cursor: 'pointer',
                      }}
                    >
                      Switch
                    </button>
                  )}
                  {editingId !== v.id && (
                    <button
                      onClick={() => handleStartRename(v.id, v.versionName)}
                      style={{
                        background: '#27272A',
                        color: '#D4D4D8',
                        fontSize: '11.5px',
                        padding: '5px 10px',
                        borderRadius: '100px',
                        cursor: 'pointer',
                      }}
                    >
                      Rename
                    </button>
                  )}
                  {variants.length > 1 && (
                    <button
                      onClick={() => deleteVariant(v.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#F87171',
                        fontSize: '11.5px',
                        padding: '5px 10px',
                        borderRadius: '100px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create New Variant Card */}
        <div style={{ background: '#111115', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '18px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '10px' }}>
            + Duplicate & Create Targeted Version
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            <input
              type="text"
              placeholder="Variant Name (e.g. Software Engineer — Google, Startup Version)"
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
              style={{
                width: '100%',
                background: '#18181B',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#FFFFFF',
                fontSize: '12.5px',
                outline: 'none',
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input
                type="text"
                placeholder="Target Role (e.g. ML Engineer)"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{
                  background: '#18181B',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  outline: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Target Company (e.g. Meta, Stripe)"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                style={{
                  background: '#18181B',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            style={{
              width: '100%',
              background: '#FFFFFF',
              color: '#000000',
              fontWeight: 800,
              fontSize: '12.5px',
              padding: '10px',
              borderRadius: '100px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Duplicate Current Resume as New Variant
          </button>
        </div>
      </div>
    </div>
  );
}
