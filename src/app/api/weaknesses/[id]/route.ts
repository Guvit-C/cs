import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, question_ids } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (question_ids !== undefined) updateData.question_ids = question_ids;

    const { data, error } = await supabase
      .from('weaknesses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, weakness: data });
  } catch (error) {
    console.error('Error updating weakness:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const { error } = await supabase
      .from('weaknesses')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting weakness:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
