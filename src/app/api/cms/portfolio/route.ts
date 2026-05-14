import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, requireAuth, handleError } from '../_helpers';

export async function GET() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('portfolio_images')
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
      .from('portfolio_images')
      .insert({
        image_url: body.image_url, alt_text: body.alt_text || '',
        display_order: body.display_order ?? 0, is_active: body.is_active ?? true,
      })
      .select().single();
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
      .from('portfolio_images')
      .update({
        image_url: body.image_url, alt_text: body.alt_text,
        display_order: body.display_order, is_active: body.is_active,
      })
      .eq('id', body.id).select().single();
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
    const { error } = await supabase.from('portfolio_images').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return handleError(err);
  }
}
