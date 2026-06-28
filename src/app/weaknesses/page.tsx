'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { topics } from '@/lib/topics';

export default function WeaknessesDashboard() {
  const [weaknesses, setWeaknesses] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [filterTopic, setFilterTopic] = useState('');
  
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState(topics[0].name);
  const [addingWeakness, setAddingWeakness] = useState(false);
  
  // Attach question state
  const [attachingToId, setAttachingToId] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');

  useEffect(() => {
    fetch('/api/weaknesses')
      .then((res) => res.json())
      .then((data) => setWeaknesses(data.weaknesses || []))
      .catch((err) => console.error(err));
      
    fetch('/api/logs')
      .then((res) => res.json())
      .then((data) => setQuestions(data.logs || []))
      .catch((err) => console.error(err));
  }, []);

  const handleAddWeakness = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingWeakness(true);
    try {
      const res = await fetch('/api/weaknesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: newTopic, title: newTitle }),
      });
      if (res.ok) {
        const data = await res.json();
        setWeaknesses([data.weakness, ...weaknesses]);
        setNewTitle('');
      } else {
        alert('Failed to add weakness');
      }
    } catch (err) {
      console.error(err);
    }
    setAddingWeakness(false);
  };

  const handleAttachQuestion = async (weaknessId: string) => {
    if (!selectedQuestionId) return;
    
    const w = weaknesses.find(w => w.id === weaknessId);
    if (!w) return;
    
    const newQuestionIds = [...(w.question_ids || []), selectedQuestionId];
    
    try {
      const res = await fetch(`/api/weaknesses/${weaknessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_ids: newQuestionIds }),
      });
      if (res.ok) {
        setWeaknesses(weaknesses.map(wk => wk.id === weaknessId ? { ...wk, question_ids: newQuestionIds } : wk));
        setAttachingToId(null);
        setSelectedQuestionId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWeakness = async (id: string) => {
    if (!confirm('Are you sure you want to delete this weakness?')) return;
    try {
      const res = await fetch(`/api/weaknesses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWeaknesses(weaknesses.filter((w) => w.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDetachQuestion = async (weaknessId: string, questionId: string) => {
    const w = weaknesses.find(w => w.id === weaknessId);
    if (!w) return;
    
    const newQuestionIds = (w.question_ids || []).filter((id: string) => id !== questionId);
    
    try {
      const res = await fetch(`/api/weaknesses/${weaknessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_ids: newQuestionIds }),
      });
      if (res.ok) {
        setWeaknesses(weaknesses.map(wk => wk.id === weaknessId ? { ...wk, question_ids: newQuestionIds } : wk));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Organize weaknesses by topic
  const filteredWeaknesses = filterTopic 
    ? weaknesses.filter(w => w.topic === filterTopic) 
    : weaknesses;

  const grouped = filteredWeaknesses.reduce((acc, curr) => {
    if (!acc[curr.topic]) acc[curr.topic] = [];
    acc[curr.topic].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Syllabus Weaknesses</h1>
        <Link href="/" className="btn btn-secondary">Back to Dashboard</Link>
      </div>

      {/* SQL Script Warning */}
      <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid #ffeeba' }}>
        <strong>Note:</strong> To use the weaknesses feature, please run the following SQL command in your Supabase SQL editor:
        <pre style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.05)', padding: '0.5rem', borderRadius: '0.25rem', overflowX: 'auto' }}>
{`CREATE TABLE weaknesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  question_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
        </pre>
      </div>

      <div className="form-card" style={{ marginBottom: '3rem' }}>
        <h3>Add New Weakness</h3>
        <form onSubmit={handleAddWeakness} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label>Topic</label>
            <select className="form-control" value={newTopic} onChange={(e) => setNewTopic(e.target.value)}>
              {topics.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 2, minWidth: '300px' }}>
            <label>Weakness Description (e.g. "Forgetting integration by parts")</label>
            <input type="text" className="form-control" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn" disabled={addingWeakness}>
              {addingWeakness ? 'Adding...' : 'Add Weakness'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ fontWeight: 600, marginRight: '1rem' }}>Filter by Topic:</label>
        <select className="form-control" style={{ width: 'auto', display: 'inline-block' }} value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)}>
          <option value="">All Topics</option>
          {topics.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No weaknesses recorded yet.</p>
      ) : (
        (Object.entries(grouped) as any[]).map(([topicName, topicWeaknesses]) => (
          <div key={topicName} style={{ marginBottom: '3rem' }}>
            <h2 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
              {topicName}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {topicWeaknesses.map((w: any) => (
                <div key={w.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 1rem 0' }}>{w.title}</h3>
                    <button onClick={() => handleDeleteWeakness(w.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
                  </div>
                  
                  {/* Attached Questions */}
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Attached Questions:</h4>
                    {w.question_ids && w.question_ids.length > 0 ? (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {w.question_ids.map((qId: string) => {
                          const q = questions.find(q => q.id === qId);
                          return (
                            <div key={qId} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-color)', padding: '0.25rem 0.75rem', borderRadius: '1rem', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                              <Link href={`/question/${qId}`} style={{ color: 'var(--primary-color)', textDecoration: 'none', marginRight: '0.5rem' }}>
                                {q ? q.code : 'Unknown Question'}
                              </Link>
                              <button onClick={() => handleDetachQuestion(w.id, qId)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.5, fontSize: '1rem' }}>&times;</button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>No questions attached yet.</p>
                    )}
                  </div>
                  
                  {/* Attach Interface */}
                  {attachingToId === w.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select 
                        className="form-control" 
                        value={selectedQuestionId} 
                        onChange={(e) => setSelectedQuestionId(e.target.value)}
                        style={{ padding: '0.5rem' }}
                      >
                        <option value="">Select a question...</option>
                        {questions.filter((q: any) => q.topic === w.topic && !(w.question_ids || []).includes(q.id)).map((q: any) => (
                          <option key={q.id} value={q.id}>{q.code} ({new Date(q.createdAt).toLocaleDateString()})</option>
                        ))}
                      </select>
                      <button className="btn" onClick={() => handleAttachQuestion(w.id)} disabled={!selectedQuestionId} style={{ padding: '0.5rem 1rem' }}>Attach</button>
                      <button className="btn btn-secondary" onClick={() => { setAttachingToId(null); setSelectedQuestionId(''); }} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setAttachingToId(w.id)}
                      style={{ background: 'none', border: '1px dashed var(--primary-color)', color: 'var(--primary-color)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      + Attach Mistake Question
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
