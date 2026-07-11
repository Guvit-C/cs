import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';
import Flashcard from '@/components/Flashcard';
import RevisionTimeline from '@/components/RevisionTimeline';

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

async function getLogData(id: string, sp: any) {
  try {
    const { data: logs, error } = await supabase
      .from('cs_questions')
      .select('*')
      .order('created_at', { ascending: true });
      
    if (error || !logs) return null;
    
    const filteredLogs = logs.filter(log => {
      if (sp.paper && log.paper !== sp.paper) return false;
      if (sp.topic && log.topic !== sp.topic) return false;
      if (sp.subtopic && log.subtopic !== sp.subtopic) return false;
      if (sp.important === 'true' && !log.is_important) return false;
      if (sp.tag) {
        const latestAttempt = log.revision_history && log.revision_history.length > 0 
          ? log.revision_history[log.revision_history.length - 1] 
          : null;
        let tag = null;
        if (latestAttempt) {
          tag = latestAttempt.status;
        } else {
          const match = (log.reason || '').match(/^\[TAG:(.+?)\](?:\r?\n([\s\S]*))?$/);
          tag = match ? match[1] : '';
        }
        if (tag !== sp.tag) return false;
      }
      return true;
    });
    
    const index = filteredLogs.findIndex((l: any) => l.id === id);
    if (index === -1) {
      // Fallback if current item is filtered out
      const rawIndex = logs.findIndex((l: any) => l.id === id);
      if (rawIndex === -1) return null;
      
      const dbLog = logs[rawIndex];
      const frontendLog = {
        id: dbLog.id,
        code: dbLog.code,
        paper: dbLog.paper,
        topic: dbLog.topic,
        subtopic: dbLog.subtopic,
        mistakeType: dbLog.mistake_type || '',
        reason: dbLog.reason,
        isImportant: dbLog.is_important || false,
        imageUrl: dbLog.image_urls && dbLog.image_urls.length > 0 ? dbLog.image_urls[0] : '',
        imageUrls: dbLog.image_urls,
        markSchemeUrls: dbLog.mark_scheme_urls || [],
        revisionHistory: dbLog.revision_history || [],
        createdAt: dbLog.created_at
      };
      return { log: frontendLog, prevId: null, nextId: null };
    }
    
    const prevId = index > 0 ? filteredLogs[index - 1].id : null;
    const nextId = index < filteredLogs.length - 1 ? filteredLogs[index + 1].id : null;
    
    const dbLog = filteredLogs[index];
    const frontendLog = {
      id: dbLog.id,
      code: dbLog.code,
      paper: dbLog.paper,
      topic: dbLog.topic,
      subtopic: dbLog.subtopic,
      mistakeType: dbLog.mistake_type || '',
      reason: dbLog.reason,
      isImportant: dbLog.is_important || false,
      imageUrl: dbLog.image_urls && dbLog.image_urls.length > 0 ? dbLog.image_urls[0] : '',
      imageUrls: dbLog.image_urls,
      markSchemeUrls: dbLog.mark_scheme_urls || [],
      revisionHistory: dbLog.revision_history || [],
      createdAt: dbLog.created_at
    };
    
    return { log: frontendLog, prevId, nextId };
  } catch (error) {
    return null;
  }
}

export default async function QuestionPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const data = await getLogData(id, sp);

  if (!data) {
    return (
      <div style={{ textAlign: 'center', marginTop: '5rem' }}>
        <h2>Question not found</h2>
        <Link href="/" className="btn" style={{ marginTop: '1rem' }}>Return to Dashboard</Link>
      </div>
    );
  }

  const { log, prevId, nextId } = data;

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (sp.paper) params.set('paper', sp.paper);
    if (sp.topic) params.set('topic', sp.topic);
    if (sp.subtopic) params.set('subtopic', sp.subtopic);
    if (sp.important) params.set('important', 'true');
    if (sp.tag) params.set('tag', sp.tag);
    const q = params.toString();
    return q ? `?${q}` : '';
  };
  const qs = buildQueryString();

  return (
    <div className="question-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href={`/${qs}`} style={{ color: 'var(--text-secondary)' }}>&larr; Back to Dashboard</Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {prevId ? (
            <Link href={`/question/${prevId}${qs}`} className="btn btn-secondary">
              &larr; Prev
            </Link>
          ) : (
            <button className="btn btn-secondary" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>
              &larr; Prev
            </button>
          )}
          {nextId ? (
            <Link href={`/question/${nextId}${qs}`} className="btn btn-secondary">
              Next &rarr;
            </Link>
          ) : (
            <button className="btn btn-secondary" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>
              Next &rarr;
            </button>
          )}
          
          {/* Add spacing between navigation and actions */}
          <div style={{ marginLeft: '1rem', display: 'flex', gap: '0.5rem' }}>
            <Link href={`/edit/${log.id}`} className="btn" style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary-color)' }}>Edit</Link>
            <DeleteButton id={log.id} />
          </div>
        </div>
      </div>

      <div className="question-header">
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {log.isImportant && <span className="tag" style={{ backgroundColor: '#ff4757', color: 'white', border: 'none' }}>⭐ Very Important</span>}
          <span className="tag">{log.paper}</span>
          <span className="tag">{log.topic}</span>
          <span className="tag">{log.subtopic}</span>
        </div>
        <h1 className="question-title">{log.code}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Logged on {new Date(log.createdAt).toLocaleDateString()}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', alignItems: 'center' }}>
        <Flashcard log={log} />
        
        <div style={{ width: '100%', maxWidth: '800px', marginTop: '2rem' }}>
          <RevisionTimeline key={log.id} questionId={log.id} initialHistory={log.revisionHistory} />
        </div>
      </div>
    </div>
  );
}
