'use client';

import { useState } from 'react';

export default function Flashcard({ log }: { log: any }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="question-image-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%' }}>
        <h3 style={{ alignSelf: 'flex-start', margin: '0 0 1rem 0' }}>Question:</h3>
        {log.imageUrls && log.imageUrls.length > 0 ? (
          log.imageUrls.map((url: string, idx: number) => (
            <img key={`q_${idx}`} src={url} alt={`${log.code} part ${idx + 1}`} className="question-image" />
          ))
        ) : (
          <img src={log.imageUrl} alt={log.code} className="question-image" />
        )}
      </div>

      {!revealed ? (
        <button 
          onClick={() => setRevealed(true)}
          className="btn"
          style={{ marginTop: '3rem', padding: '1rem 2rem', fontSize: '1.2rem', width: '100%', maxWidth: '400px' }}
        >
          Reveal Answer & Takeaways
        </button>
      ) : (
        <div style={{ width: '100%', marginTop: '2rem' }}>
          {log.markSchemeUrls && log.markSchemeUrls.length > 0 && (
            <div className="question-image-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%', marginBottom: '2rem' }}>
              <h3 style={{ alignSelf: 'flex-start', margin: '0 0 1rem 0', color: '#10b981' }}>Mark Scheme:</h3>
              {log.markSchemeUrls.map((url: string, idx: number) => (
                <img key={`ms_${idx}`} src={url} alt={`Mark Scheme ${idx + 1}`} className="question-image" style={{ border: '2px solid #10b981' }} />
              ))}
            </div>
          )}

          <div className="question-reason-box">
            <div className="question-reason-title">
              Missing Keywords / Takeaway
              {log.mistakeType && <span className="tag" style={{ marginLeft: '1rem', backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #ef4444' }}>{log.mistakeType}</span>}
              {(() => {
                const match = log.reason.match(/^\[TAG:(.+?)\](?:\r?\n([\s\S]*))?$/);
                const tag = match ? match[1] : null;
                return tag ? <span className="tag" style={{ marginLeft: '0.5rem', backgroundColor: '#f3e8ff', color: '#9333ea', border: '1px solid #d8b4fe' }}>{tag}</span> : null;
              })()}
            </div>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{(() => {
                const match = log.reason.match(/^\[TAG:(.+?)\](?:\r?\n([\s\S]*))?$/);
                return match ? (match[2] || '') : log.reason;
              })()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
