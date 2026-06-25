'use client';

import React, { useState, useRef } from 'react';

export default function ImagePasteZone({ label, name, required }: { label: string, name: string, required?: boolean }) {
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    const newFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) newFiles.push(file);
      }
    }
    
    if (newFiles.length > 0) {
      e.preventDefault();
      addFiles(newFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    setFiles(prev => {
      const updated = [...prev, ...newFiles];
      updateInputFiles(updated);
      return updated;
    });
  };

  const updateInputFiles = (fileList: File[]) => {
    if (inputRef.current) {
      const dt = new DataTransfer();
      fileList.forEach(f => dt.items.add(f));
      inputRef.current.files = dt.files;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(newFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      updateInputFiles(updated);
      return updated;
    });
  };

  return (
    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
      <label>{label}</label>
      <div 
        tabIndex={0}
        onPaste={handlePaste}
        style={{ 
          border: '2px dashed var(--border-color)', 
          padding: '2rem', 
          textAlign: 'center', 
          borderRadius: '0.5rem',
          cursor: 'pointer',
          backgroundColor: 'var(--bg-color)',
          transition: 'border-color 0.2s ease',
          outline: 'none'
        }}
        onClick={() => inputRef.current?.click()}
        onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', pointerEvents: 'none' }}>
          Click to select, or click here and press <kbd style={{ padding: '0.2rem 0.4rem', background: '#e5e7eb', borderRadius: '4px', color: '#374151', border: '1px solid #d1d5db' }}>Ctrl+V</kbd> to paste images
        </p>
        
        {files.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
            {files.map((f, i) => (
              <div key={i} style={{ position: 'relative', border: '1px solid var(--border-color)', padding: '0.2rem', borderRadius: '4px', backgroundColor: 'white' }}>
                <img src={URL.createObjectURL(f)} alt="preview" style={{ height: '60px', width: 'auto', display: 'block', objectFit: 'contain' }} />
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <input 
        type="file" 
        id={name} 
        name={name} 
        accept="image/*" 
        multiple 
        required={required && files.length === 0}
        ref={inputRef} 
        onChange={handleFileChange}
        style={{ display: 'none' }} 
      />
    </div>
  );
}
