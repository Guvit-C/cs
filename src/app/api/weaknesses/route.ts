import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('weaknesses')
      .select('*')
      .eq('subject', 'CS')
      .order('created_at', { ascending: false });
      
    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet, return empty array to prevent crash
        return NextResponse.json({ weaknesses: [] });
      }
      throw error;
    }
    
    return NextResponse.json({ weaknesses: data });
  } catch (error) {
    console.error('Error fetching weaknesses:', error);
    return NextResponse.json({ weaknesses: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, subtopic, title } = body;

    if (!topic || !subtopic || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('weaknesses')
      .insert([
        {
          subject: 'CS',
          topic,
          subtopic,
          title,
          notes: body.notes || '',
          question_ids: []
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, weakness: data });
  } catch (error) {
    console.error('Error creating weakness:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
