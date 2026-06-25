'use client';

import { useChat } from '@ai-sdk/react';
import Link from 'next/link';

export default function PracticePage() {
  // @ts-ignore - bypass all Vercel AI SDK strict type changes
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat() as any;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '85vh' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>&larr; Back to Dashboard</Link>
      </div>
      
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800 }}>AI Tutor Lab</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>Powered by GPT-4o</p>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>Welcome to the Tutor Lab</h3>
              <p>Type "Hello" to test the connection to your AI tutor.</p>
            </div>
          ) : (
            (messages || []).map((m: any) => (
              <div key={m.id} style={{ 
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: m.role === 'user' ? 'var(--primary-color)' : 'var(--bg-color)',
                padding: '1rem 1.2rem',
                borderRadius: '0.8rem',
                maxWidth: '85%',
                border: m.role === 'user' ? 'none' : '1px solid var(--border-color)',
                lineHeight: 1.5
              }}>
                <strong style={{ fontSize: '0.85rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {m.role === 'user' ? 'You' : 'AI Tutor'}
                </strong>
                <div style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                  {m.content || (m.parts && m.parts[0]?.text) || ''}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)', padding: '1rem' }}>
              AI is thinking...
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', backgroundColor: 'var(--card-bg)' }}>
          <input
            className="form-control"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
          />
          <button type="submit" className="btn" disabled={isLoading || !input.trim()} style={{ padding: '0 1.5rem', fontWeight: 600 }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
