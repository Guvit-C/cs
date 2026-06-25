import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Get the log to know which images to delete
    const { data: log, error: fetchError } = await supabase
      .from('cs_questions')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError || !log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('cs_questions')
      .delete()
      .eq('id', id);
      
    if (deleteError) {
      throw deleteError;
    }

    // Delete images from storage
    if (log.image_urls && log.image_urls.length > 0) {
      const filenames = log.image_urls.map((url: string) => {
        // extract filename from public URL
        const parts = url.split('/');
        return parts[parts.length - 1];
      });
      
      await supabase.storage.from('question-images').remove(filenames);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { code, paper, topic, subtopic, mistakeType, reason, isImportant } = body;

    if (!code || !paper || !topic || !subtopic) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('cs_questions')
      .update({
        code,
        paper,
        topic,
        subtopic,
        mistake_type: mistakeType || 'Other',
        reason: reason || '',
        is_important: isImportant
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, log: data });
  } catch (error) {
    console.error('Error updating log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
