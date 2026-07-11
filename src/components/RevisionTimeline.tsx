'use client';

import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import MarkdownViewer from './MarkdownViewer';

export type RevisionAttempt = {
  id: string;
  date: string;
  status: string;
  notes: string;
};

export default function RevisionTimeline({
  questionId,
  initialHistory
}: {
  questionId: string;
  initialHistory: RevisionAttempt[];
}) {
  const [history, setHistory] = useState<RevisionAttempt[]>(initialHistory);
  const [isAdding, setIsAdding] = useState(false);
  const [newStatus, setNewStatus] = useState('Needs Review');
  const [newNotes, setNewNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!newNotes.trim()) return;
    setSaving(true);
    
    const newAttempt: RevisionAttempt = {
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
      status: newStatus,
      notes: newNotes
    };
    
    const updatedHistory = [...history, newAttempt];
    
    try {
      const res = await fetch(`/api/logs/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revision_history: updatedHistory }),
      });
      
      if (res.ok) {
        setHistory(updatedHistory);
        setIsAdding(false);
        setNewNotes('');
        setNewStatus('Needs Review');
      } else {
        alert('Failed to save attempt');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving attempt');
    }
    setSaving(false);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Failed': return { bg: '#fee2e2', color: '#ef4444', border: '#ef4444' };
      case 'Mastered': return { bg: '#dcfce3', color: '#22c55e', border: '#22c55e' };
      case 'Silly Mistake': return { bg: '#fef9c3', color: '#eab308', border: '#eab308' };
      default: return { bg: '#f3e8ff', color: '#9333ea', border: '#d8b4fe' };
    }
  };

  return (
    <div style={{ marginTop: '3rem', width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Revision Timeline</h3>
      
      {history.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>No revision attempts logged yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {history.map((attempt, index) => {
            const colors = getStatusColor(attempt.status);
            return (
              <div key={attempt.id} style={{ 
                borderLeft: `4px solid ${colors.border}`, 
                paddingLeft: '1rem',
                position: 'relative'
              }}>
                {/* Timeline Dot */}
                <div style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '0',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: colors.border,
                  marginTop: '0.25rem'
                }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Attempt {index + 1}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date(attempt.date).toLocaleDateString()}</span>
                  <span className="tag" style={{ backgroundColor: colors.bg, color: colors.color, border: `1px solid ${colors.border}` }}>
                    {attempt.status}
                  </span>
                </div>
                
                <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <MarkdownViewer content={attempt.notes} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {!isAdding ? (
        <button className="btn" onClick={() => setIsAdding(true)} style={{ width: '100%' }}>+ Log New Attempt</button>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-color)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
          <h4 style={{ marginBottom: '1rem' }}>Log Revision</h4>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Attempt Status</label>
            <select 
              className="form-control" 
              value={newStatus} 
              onChange={(e) => setNewStatus(e.target.value)}
              style={{ width: '100%', maxWidth: '300px' }}
            >
              <option value="Failed">❌ Failed</option>
              <option value="Silly Mistake">🤦 Silly Mistake</option>
              <option value="Needs Review">👀 Needs Review</option>
              <option value="Mastered">🎯 Mastered</option>
              <option value="None">➖ None</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Notes / Mistakes</label>
            <div data-color-mode="dark">
              <MDEditor
                value={newNotes}
                onChange={(val) => setNewNotes(val || '')}
                preview="live"
                height={300}
                previewOptions={{
                  remarkPlugins: [remarkMath],
                  rehypePlugins: [rehypeKatex],
                }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Attempt'}</button>
            <button className="btn btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
