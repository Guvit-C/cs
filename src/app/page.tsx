'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { topics } from '@/lib/topics';

export default function Home() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterPaper, setFilterPaper] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterSubtopic, setFilterSubtopic] = useState('');
  const [filterImportant, setFilterImportant] = useState(false);
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    fetch('/api/logs')
      .then((res) => res.json())
      .then((data) => setLogs(data.logs || []))
      .catch((err) => console.error("Error fetching logs:", err));
  }, []);

  const selectedTopicObj = topics.find((t) => t.name === filterTopic);
  const availableSubtopics = selectedTopicObj ? selectedTopicObj.subtopics : [];

  const availableTags = Array.from(new Set(logs.map(log => {
    const match = log.reason.match(/^\[TAG:(.+?)\](?:\r?\n([\s\S]*))?$/);
    return match ? match[1] : null;
  }).filter(Boolean))) as string[];

  const filteredLogs = logs.filter((log) => {
    if (filterPaper && log.paper !== filterPaper) return false;
    if (filterTopic && log.topic !== filterTopic) return false;
    if (filterSubtopic && log.subtopic !== filterSubtopic) return false;
    if (filterImportant && !log.isImportant) return false;
    if (filterTag) {
      const match = log.reason.match(/^\[TAG:(.+?)\](?:\r?\n([\s\S]*))?$/);
      const tag = match ? match[1] : '';
      if (tag !== filterTag) return false;
    }
    return true;
  });

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
          <Link href={`/question/${log.id}`} key={log.id} className="card">
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
                  const match = log.reason.match(/^\[TAG:(.+?)\](?:\r?\n([\s\S]*))?$/);
                  const tag = match ? match[1] : null;
                  return tag ? <span className="tag" style={{ backgroundColor: '#f3e8ff', color: '#9333ea', border: '1px solid #d8b4fe' }}>{tag}</span> : null;
                })()}
              </div>
              <p className="card-reason">{(() => {
                const match = log.reason.match(/^\[TAG:(.+?)\](?:\r?\n([\s\S]*))?$/);
                return match ? (match[2] || '') : log.reason;
              })()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
