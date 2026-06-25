import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';
import Flashcard from '@/components/Flashcard';

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

async function getLogData(id: string) {
  try {
    const { data: logs, error } = await supabase
      .from('cs_questions')
      .select('*')
      .order('created_at', { ascending: true });
      
    if (error || !logs) return null;
    
    const index = logs.findIndex((l: any) => l.id === id);
    if (index === -1) return null;
    
    const prevId = index > 0 ? logs[index - 1].id : null;
    const nextId = index < logs.length - 1 ? logs[index + 1].id : null;
    
    const dbLog = logs[index];
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
      createdAt: dbLog.created_at
    };
    
    return { log: frontendLog, prevId, nextId };
  } catch (error) {
    return null;
  }
}

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const data = await getLogData(resolvedParams.id);

  if (!data) {
    return (
      <div style={{ textAlign: 'center', marginTop: '5rem' }}>
        <h2>Question not found</h2>
        <Link href="/" className="btn" style={{ marginTop: '1rem' }}>Return to Dashboard</Link>
      </div>
    );
  }

  const { log, prevId, nextId } = data;

  return (
    <div className="question-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>&larr; Back to Dashboard</Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {prevId ? (
            <Link href={`/question/${prevId}`} className="btn btn-secondary">
              &larr; Prev
            </Link>
          ) : (
            <button className="btn btn-secondary" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>
              &larr; Prev
            </button>
          )}
          {nextId ? (
            <Link href={`/question/${nextId}`} className="btn btn-secondary">
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

      <Flashcard log={log} />
    </div>
  );
}
