import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const code = formData.get('code') as string;
    const paper = formData.get('paper') as string;
    const topic = formData.get('topic') as string;
    const subtopic = formData.get('subtopic') as string;
    const reason = formData.get('reason') as string;
    const mistakeType = formData.get('mistakeType') as string;
    const isImportant = formData.get('isImportant') === 'true';
    const images = formData.getAll('image') as File[];
    const markschemeImages = formData.getAll('markscheme_image') as File[];

    if (!code || !paper || !topic || !subtopic || images.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const imageUrls = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const ext = image.name.split('.').pop() || 'png';
      const filename = `${code}_${Date.now()}_${i}.${ext}`;
      
      const { error } = await supabase
        .storage
        .from('question-images')
        .upload(filename, image, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      
      const { data: publicUrlData } = supabase
        .storage
        .from('question-images')
        .getPublicUrl(filename);
        
      imageUrls.push(publicUrlData.publicUrl);
    }

    const markSchemeUrls = [];
    for (let i = 0; i < markschemeImages.length; i++) {
      const image = markschemeImages[i];
      const ext = image.name.split('.').pop() || 'png';
      const filename = `ms_${code}_${Date.now()}_${i}.${ext}`;
      
      const { error } = await supabase
        .storage
        .from('question-images')
        .upload(filename, image, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        console.error('Upload MS error:', error);
        throw error;
      }
      
      const { data: publicUrlData } = supabase
        .storage
        .from('question-images')
        .getPublicUrl(filename);
        
      markSchemeUrls.push(publicUrlData.publicUrl);
    }

    const { data: insertData, error: insertError } = await supabase
      .from('cs_questions')
      .insert([
        {
          code,
          paper,
          topic,
          subtopic,
          mistake_type: mistakeType || 'Other',
          reason: reason || '',
          image_urls: imageUrls,
          is_important: isImportant,
          mark_scheme_urls: markSchemeUrls
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    // Map DB fields back to what frontend expects
    const newLog = {
      id: insertData.id,
      code: insertData.code,
      paper: insertData.paper,
      topic: insertData.topic,
      subtopic: insertData.subtopic,
      mistakeType: insertData.mistake_type || '',
      reason: insertData.reason,
      isImportant: insertData.is_important || false,
      imageUrl: insertData.image_urls[0],
      imageUrls: insertData.image_urls,
      markSchemeUrls: insertData.mark_scheme_urls || [],
      createdAt: insertData.created_at
    };

    return NextResponse.json({ success: true, log: newLog });
  } catch (error) {
    console.error('Error saving log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('cs_questions')
      .select('*')
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    // Map DB fields to frontend expectations
    const logs = data.map((d: any) => ({
      id: d.id,
      code: d.code,
      paper: d.paper,
      topic: d.topic,
      subtopic: d.subtopic,
      mistakeType: d.mistake_type || '',
      reason: d.reason,
      isImportant: d.is_important || false,
      imageUrl: d.image_urls && d.image_urls.length > 0 ? d.image_urls[0] : '',
      imageUrls: d.image_urls,
      markSchemeUrls: d.mark_scheme_urls || [],
      createdAt: d.created_at
    }));

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ logs: [] });
  }
}
