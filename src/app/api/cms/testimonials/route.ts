import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, requireAuth, handleError } from '../_helpers';

export async function GET() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await requireAuth();
    const body = await request.json();
    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        quote: body.quote,
        couple_name: body.couple_name,
        session_type: body.session_type || null,
        location: body.location || null,
        is_active: body.is_active ?? true,
        display_order: body.display_order ?? 0,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await requireAuth();
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    const { data, error } = await supabase
      .from('testimonials')
      .update({
        quote: body.quote, couple_name: body.couple_name,
        session_type: body.session_type, location: body.location,
        is_active: body.is_active, display_order: body.display_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return handleError(err);
  }
}
