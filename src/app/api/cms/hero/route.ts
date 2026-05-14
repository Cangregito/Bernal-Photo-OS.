import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, requireAuth, handleError } from '../_helpers';

export async function GET() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('hero_slides')
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
      .from('hero_slides')
      .insert({
        image_url: body.image_url, title: body.title || null,
        subtitle: body.subtitle || null, is_active: body.is_active ?? true,
        display_order: body.display_order ?? 0,
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
      .from('hero_slides')
      .update({
        image_url: body.image_url, title: body.title,
        subtitle: body.subtitle, is_active: body.is_active,
        display_order: body.display_order,
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
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return handleError(err);
  }
}
