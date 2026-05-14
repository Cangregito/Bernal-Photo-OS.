import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
}

async function requireAuth() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return supabase;
}

export async function GET() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await requireAuth();
    const body = await request.json();
    const { data, error } = await supabase
      .from('packages')
      .insert({
        name: body.name,
        price: body.price,
        currency: body.currency || 'MXN',
        description: body.description,
        features: body.features || [],
        is_highlighted: body.is_highlighted ?? false,
        is_active: body.is_active ?? true,
        display_order: body.display_order ?? 0,
      })
      .select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await requireAuth();
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    const { data, error } = await supabase
      .from('packages')
      .update({
        name: body.name, price: body.price, currency: body.currency,
        description: body.description, features: body.features,
        is_highlighted: body.is_highlighted, is_active: body.is_active,
        display_order: body.display_order, updated_at: new Date().toISOString(),
      })
      .eq('id', body.id).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 500 });
  }
}
