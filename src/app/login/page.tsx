'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Refresh the router to clear the middleware cache and push to dashboard
        router.refresh();
        router.push('/');
      } else {
        setError('Incorrect password');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred');
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh' 
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem' }}>Secure Login</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Master Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Enter your password..."
              required
              style={{ 
                padding: '0.8rem', 
                width: '100%',
                backgroundColor: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                color: 'var(--text-color)',
                fontSize: '1rem'
              }}
            />
          </div>
          
          {error && (
            <p style={{ color: 'var(--danger-color)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button 
            type="submit" 
            className="btn" 
            style={{ 
              width: '100%', 
              padding: '0.8rem', 
              opacity: loading ? 0.7 : 1,
              fontSize: '1.1rem',
              marginTop: '0.5rem'
            }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
