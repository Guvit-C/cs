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
                const match = log.reason.match(/^\[TAG:(.+?)\](?:\r?\n)?/);
                const tag = match ? match[1] : null;
                return tag ? <span className="tag" style={{ marginLeft: '0.5rem', backgroundColor: '#f3e8ff', color: '#9333ea', border: '1px solid #d8b4fe' }}>{tag}</span> : null;
              })()}
            </div>
            
            {(() => {
                let cleanReason = log.reason;
                const tagMatch = cleanReason.match(/^\[TAG:(.+?)\](?:\r?\n)?/);
                if (tagMatch) cleanReason = cleanReason.replace(tagMatch[0], '');
                
                const noteMatch = cleanReason.match(/^\[NOTE:([\s\S]+?)\](?:\r?\n)?/);
                const note = noteMatch ? noteMatch[1] : null;
                if (noteMatch) cleanReason = cleanReason.replace(noteMatch[0], '');

                return (
                  <>
                    {note && (
                      <div style={{ marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: 'rgba(168, 85, 247, 0.1)', borderLeft: '4px solid #a855f7', borderRadius: '0.5rem' }}>
                        <h4 style={{ margin: '0 0 0.75rem 0', color: '#a855f7', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>Retry Note</h4>
                        <p style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{note}</p>
                      </div>
                    )}
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{cleanReason}</p>
                  </>
                );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
