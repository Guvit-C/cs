'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { topics } from '@/lib/topics';
import Link from 'next/link';

export default function EditForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Initialize state with existing data
  const [code, setCode] = useState(initialData.code || '');
  const [paper, setPaper] = useState(initialData.paper || 'Paper 2');
  const [topic, setTopic] = useState(initialData.topic || topics[0].name);
  const [subtopic, setSubtopic] = useState(initialData.subtopic || topics[0].subtopics[0]);
  const [mistakeType, setMistakeType] = useState(initialData.mistakeType || 'Other');
  const [reason, setReason] = useState(initialData.reason || '');
  const [isImportant, setIsImportant] = useState(initialData.isImportant || false);

  const selectedTopicObj = topics.find((t) => t.name === topic);
  const availableSubtopics = selectedTopicObj ? selectedTopicObj.subtopics : [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/logs/${initialData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code, paper, topic, subtopic, mistakeType, reason, isImportant
        }),
      });

      if (res.ok) {
        router.refresh(); // Refresh to update the parent server component data
        router.push(`/question/${initialData.id}`);
      } else {
        alert('Failed to update question');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href={`/question/${initialData.id}`} style={{ color: 'var(--text-secondary)' }}>&larr; Cancel Edit</Link>
      </div>
      
      <div className="form-card">
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800 }}>Edit Question</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Question Code / Title</label>
            <input 
              type="text" 
              id="code" 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              className="form-control" 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="paper">Paper</label>
            <select 
              id="paper" 
              value={paper} 
              onChange={(e) => setPaper(e.target.value)} 
              className="form-control" 
              required
            >
              <option value="Paper 1">Paper 1</option>
              <option value="Paper 2">Paper 2</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="topic">Topic</label>
            <select 
              id="topic" 
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                const newTopicObj = topics.find(t => t.name === e.target.value);
                if (newTopicObj && newTopicObj.subtopics.length > 0) {
                  setSubtopic(newTopicObj.subtopics[0]);
                }
              }}
              className="form-control" 
              required
            >
              {topics.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subtopic">Subtopic</label>
            <select 
              id="subtopic" 
              value={subtopic} 
              onChange={(e) => setSubtopic(e.target.value)} 
              className="form-control" 
              required
            >
              {availableSubtopics.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <input 
              type="checkbox" 
              id="isImportant" 
              checked={isImportant} 
              onChange={(e) => setIsImportant(e.target.checked)} 
              style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer' }} 
            />
            <label htmlFor="isImportant" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 600, color: '#ff4757' }}>⭐ Mark as Very Important (Lot of Mistakes)</label>
          </div>

          <div className="form-group">
            <label htmlFor="mistakeType">Mistake Type</label>
            <select 
              id="mistakeType" 
              value={mistakeType} 
              onChange={(e) => setMistakeType(e.target.value)} 
              className="form-control" 
              required
            >
              <option value="Keyword Omission">Keyword Omission</option>
              <option value="Logic Error">Logic Error</option>
              <option value="Tracing Error">Tracing Error</option>
              <option value="Syntax Error">Syntax Error</option>
              <option value="Conceptual Mix-up">Conceptual Mix-up</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Missing Keywords / Takeaway</label>
            <textarea 
              id="reason" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-control" 
              rows={5} 
              required 
            ></textarea>
          </div>

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
