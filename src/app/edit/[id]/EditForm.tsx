'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { topics } from '@/lib/topics';
import Link from 'next/link';
import ImagePasteZone from '@/components/ImagePasteZone';

export default function EditForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Initialize state with existing data
  const [code, setCode] = useState(initialData.code || '');
  const [paper, setPaper] = useState(initialData.paper || 'Paper 2');
  const [topic, setTopic] = useState(initialData.topic || topics[0].name);
  const [subtopic, setSubtopic] = useState(initialData.subtopic || topics[0].subtopics[0]);
  // Parse retry tag if exists
  const parsedReason = initialData.reason || '';
  const match = parsedReason.match(/^\[TAG:(.+?)\](?:\r?\n([\s\S]*))?$/);
  
  const initialRetryTag = match ? match[1] : '';
  const initialCleanReason = match ? (match[2] || '') : parsedReason;

  const [mistakeType, setMistakeType] = useState(initialData.mistakeType || 'Other');
  const [reason, setReason] = useState(initialCleanReason);
  const [retryTag, setRetryTag] = useState(initialRetryTag);
  const [isImportant, setIsImportant] = useState(initialData.isImportant || false);

  const [existingImages, setExistingImages] = useState<string[]>(initialData.imageUrls || (initialData.imageUrl ? [initialData.imageUrl] : []));
  const [existingMarkscheme, setExistingMarkscheme] = useState<string[]>(initialData.markSchemeUrls || []);

  const selectedTopicObj = topics.find((t) => t.name === topic);
  const availableSubtopics = selectedTopicObj ? selectedTopicObj.subtopics : [];

  const handleRemoveImage = (index: number, type: 'question' | 'markscheme') => {
    if (type === 'question') {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setExistingMarkscheme(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('code', code);
      formData.append('paper', paper);
      formData.append('topic', topic);
      formData.append('subtopic', subtopic);
      const finalReason = retryTag ? `[TAG:${retryTag}]\n${reason}` : reason;
      
      formData.append('mistakeType', mistakeType);
      formData.append('reason', finalReason);
      formData.append('isImportant', String(isImportant));
      formData.append('existingImages', JSON.stringify(existingImages));
      formData.append('existingMarkscheme', JSON.stringify(existingMarkscheme));

      const res = await fetch(`/api/logs/${initialData.id}`, {
        method: 'PATCH',
        body: formData,
      });

      if (res.ok) {
        router.refresh();
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
            <label>Existing Question Images</label>
            {existingImages.length > 0 ? (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {existingImages.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt={`Question image ${i+1}`} style={{ height: '100px', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                    <button type="button" onClick={() => handleRemoveImage(i, 'question')} style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>&times;</button>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No images currently.</p>}
          </div>
          <ImagePasteZone label="Add New Question Images (Optional)" name="new_image" required={false} />

          <div className="form-group" style={{ marginTop: '2rem' }}>
            <label>Existing Mark Scheme Images</label>
            {existingMarkscheme.length > 0 ? (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {existingMarkscheme.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt={`MS image ${i+1}`} style={{ height: '100px', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                    <button type="button" onClick={() => handleRemoveImage(i, 'markscheme')} style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>&times;</button>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No mark scheme images currently.</p>}
          </div>
          <ImagePasteZone label="Add New Mark Scheme Images (Optional)" name="new_markscheme_image" required={false} />

          <div className="form-group" style={{ marginTop: '2rem' }}>
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
            <label htmlFor="retryTag">Custom Retry Status Tag</label>
            <input 
              type="text"
              id="retryTag" 
              value={retryTag} 
              onChange={(e) => setRetryTag(e.target.value)} 
              className="form-control" 
              placeholder='e.g., "Failed", "Silly Mistake", "Mastered", "Needs Review"'
            />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Type a custom tag after retrying a question to mark your progress.
            </p>
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
