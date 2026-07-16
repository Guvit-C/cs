'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { topics } from '@/lib/topics';
import Link from 'next/link';
import ImagePasteZone from '@/components/ImagePasteZone';

export default function LogEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState(topics[0].name);

  const selectedTopicObj = topics.find((t) => t.name === topic);
  const availableSubtopics = selectedTopicObj ? selectedTopicObj.subtopics : [];

  const [category, setCategory] = useState('Normal');
  const [difficultyDescription, setDifficultyDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Inject difficulty fields into formData
    if (category !== 'Normal') {
      formData.append('difficultyTag', category);
      formData.append('difficultyDescription', difficultyDescription);
    }
    
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/question/${data.log.id}`);
      } else {
        alert('Failed to save log entry');
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
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>&larr; Back to Dashboard</Link>
      </div>
      
      <div className="form-card">
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800 }}>Add New Question Log</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Question Code / Title</label>
            <input type="text" id="code" name="code" className="form-control" required placeholder="e.g. q1" />
          </div>

          <div className="form-group">
            <label htmlFor="paper">Paper</label>
            <select id="paper" name="paper" className="form-control" required>
              <option value="Paper 1">Paper 1</option>
              <option value="Paper 2">Paper 2</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="topic">Topic</label>
            <select 
              id="topic" 
              name="topic" 
              className="form-control" 
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              {topics.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subtopic">Subtopic</label>
            <select id="subtopic" name="subtopic" className="form-control" required>
              {availableSubtopics.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <input type="checkbox" id="isImportant" name="isImportant" value="true" style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer' }} />
            <label htmlFor="isImportant" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 600, color: '#ff4757' }}>⭐ Mark as Very Important (Lot of Mistakes)</label>
          </div>

          <ImagePasteZone label="Question Images (Select or Paste)" name="image" required={true} />

          <ImagePasteZone label="Mark Scheme Images (Select or Paste)" name="markscheme_image" required={true} />

          <div className="form-group">
            <label htmlFor="mistakeType">Mistake Type</label>
            <select id="mistakeType" name="mistakeType" className="form-control" required>
              <option value="Keyword Omission">Keyword Omission</option>
              <option value="Logic Error">Logic Error</option>
              <option value="Tracing Error">Tracing Error</option>
              <option value="Syntax Error">Syntax Error</option>
              <option value="Conceptual Mix-up">Conceptual Mix-up</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">Question Category</label>
            <select 
              id="category" 
              className="form-control" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Normal">Standard Mistake</option>
              <option value="HARD">HARD (Above current level)</option>
              <option value="DEP">DEP (Requires future knowledge)</option>
            </select>
          </div>

          {category !== 'Normal' && (
            <div className="form-group">
              <label htmlFor="difficultyDescription">Short Description (5-7 words)</label>
              <input 
                type="text" 
                id="difficultyDescription" 
                className="form-control" 
                value={difficultyDescription}
                onChange={(e) => setDifficultyDescription(e.target.value)}
                required={category !== 'Normal'} 
                placeholder="e.g. Requires future concept" 
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="reason">{category === 'Normal' ? 'Missing Keywords / Takeaway' : 'Explanation'}</label>
            <textarea 
              id="reason" 
              name="reason" 
              className="form-control" 
              rows={4} 
              required 
              placeholder={category === 'Normal' ? "Write down the exact keywords you missed or the logical error..." : "Explain why you failed or need to retry this..."}
            ></textarea>
          </div>

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Saving...' : 'Save Question Log'}
          </button>
        </form>
      </div>
    </div>
  );
}
