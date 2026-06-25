import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import EditForm from './EditForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: log, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !log) {
    return (
      <div style={{ textAlign: 'center', marginTop: '5rem' }}>
        <h2>Question not found</h2>
        <Link href="/" className="btn" style={{ marginTop: '1rem' }}>Return to Dashboard</Link>
      </div>
    );
  }

  const frontendLog = {
    id: log.id,
    code: log.code,
    paper: log.paper,
    topic: log.topic,
    subtopic: log.subtopic,
    reason: log.reason,
    isImportant: log.is_important || false,
    imageUrls: log.image_urls
  };

  return <EditForm initialData={frontendLog} />;
}
