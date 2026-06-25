'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question? This cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/logs/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        // Force Next.js to refresh the dashboard
        router.refresh();
        router.push('/');
      } else {
        alert('Failed to delete question');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      style={{
        backgroundColor: 'var(--danger-color)',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        fontWeight: 'bold',
        opacity: loading ? 0.5 : 1,
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'transform 0.2s',
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {loading ? 'Deleting...' : 'Delete Question'}
    </button>
  );
}
