'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { topics } from '@/lib/topics';

export default function Home() {
  const getParam = (key: string) => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      return sp.get(key);
    }
    return null;
  };

  const [logs, setLogs] = useState<any[]>([]);
  const [filterPaper, setFilterPaper] = useState(getParam('paper') || '');
  const [filterTopic, setFilterTopic] = useState(getParam('topic') || '');
  const [filterSubtopic, setFilterSubtopic] = useState(getParam('subtopic') || '');
  const [filterImportant, setFilterImportant] = useState(getParam('important') === 'true');
  const [filterTag, setFilterTag] = useState(getParam('tag') || '');

  useEffect(() => {
    fetch('/api/logs')
      .then((res) => res.json())
      .then((data) => setLogs(data.logs || []))
      .catch((err) => console.error("Error fetching logs:", err));
  }, []);

  const selectedTopicObj = topics.find((t) => t.name === filterTopic);
  const availableSubtopics = selectedTopicObj ? selectedTopicObj.subtopics : [];

  const getTagForLog = (log: any) => {
    if (log.revisionHistory && log.revisionHistory.length > 0) {
      return log.revisionHistory[log.revisionHistory.length - 1].status;
    }
    const match = (log.reason || '').match(/^\[TAG:(.+?)\](?:\r?\n([\s\S]*))?$/);
    return match ? match[1] : '';
  };

  const availableTags = Array.from(new Set(logs.map(getTagForLog).filter(Boolean))) as string[];

  const filteredLogs = logs.filter((log) => {
    if (filterPaper && log.paper !== filterPaper) return false;
    if (filterTopic && log.topic !== filterTopic) return false;
    if (filterSubtopic && log.subtopic !== filterSubtopic) return false;
    if (filterImportant && !log.isImportant) return false;
    if (filterTag && getTagForLog(log) !== filterTag) return false;
    return true;
  });

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filterPaper) params.set('paper', filterPaper);
    if (filterTopic) params.set('topic', filterTopic);
    if (filterSubtopic) params.set('subtopic', filterSubtopic);
    if (filterImportant) params.set('important', 'true');
    if (filterTag) params.set('tag', filterTag);
    const q = params.toString();
    return q ? `?${q}` : '';
  };

  return (
    <div>
      <div className="filters">
        <div className="filter-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Paper</label>
          <select className="form-control" value={filterPaper} onChange={(e) => setFilterPaper(e.target.value)}>
            <option value="">All Papers</option>
            <option value="Paper 1">Paper 1</option>
            <option value="Paper 2">Paper 2</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Topic</label>
          <select 
            className="form-control" 
            value={filterTopic} 
            onChange={(e) => {
              setFilterTopic(e.target.value);
              setFilterSubtopic('');
            }}
          >
            <option value="">All Topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Subtopic</label>
          <select 
            className="form-control" 
            value={filterSubtopic} 
            onChange={(e) => setFilterSubtopic(e.target.value)}
            disabled={!filterTopic}
          >
            <option value="">All Subtopics</option>
            {availableSubtopics.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Retry Tag</label>
          <select 
            className="form-control" 
            value={filterTag} 
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <option value="">All Tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <div className="filter-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-color)', fontWeight: 600 }}>
            <input 
              type="checkbox" 
              checked={filterImportant} 
              onChange={(e) => setFilterImportant(e.target.checked)} 
              style={{ width: '1.2rem', height: '1.2rem' }}
            />
            Important Only ⭐
          </label>
        </div>
      </div>

      <div className="grid">
        {filteredLogs.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No questions found.</p>
        )}
        {filteredLogs.map((log) => (
          <Link href={`/question/${log.id}${buildQueryString()}`} key={log.id} className="card">
            <div className="card-img-wrapper">
              <img src={log.imageUrls && log.imageUrls.length > 0 ? log.imageUrls[0] : log.imageUrl} alt={log.code} className="card-img" />
            </div>
            <div className="card-body">
              <h3 className="card-title">
                {log.code}
                {log.isImportant && <span style={{ marginLeft: '0.5rem', fontSize: '1rem' }}>⭐</span>}
              </h3>
              <div className="card-tags">
                <span className="tag">{log.paper}</span>
                <span className="tag">{log.topic}</span>
                {log.mistakeType && <span className="tag" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>{log.mistakeType}</span>}
                {(() => {
                  const tag = getTagForLog(log);
                  return tag ? <span className="tag" style={{ backgroundColor: '#f3e8ff', color: '#9333ea', border: '1px solid #d8b4fe' }}>{tag}</span> : null;
                })()}
              </div>
              <p className="card-reason">{(() => {
                let cleanReason = log.reason;
                const tagMatch = cleanReason.match(/^\[TAG:(.+?)\](?:\r?\n)?/);
                if (tagMatch) cleanReason = cleanReason.replace(tagMatch[0], '');
                
                const noteMatch = cleanReason.match(/^\[NOTE:([\s\S]+?)\](?:\r?\n)?/);
                if (noteMatch) cleanReason = cleanReason.replace(noteMatch[0], '');

                return cleanReason;
              })()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
