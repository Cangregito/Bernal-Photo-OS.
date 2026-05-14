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

// GET all testimonials (public: active only, admin: all)
export async function GET() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create new testimonial
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 500 });
  }
}

// PUT update testimonial
export async function PUT(request: NextRequest) {
  try {
    const supabase = await requireAuth();
    const body = await request.json();

    if (!body.id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const { data, error } = await supabase
      .from('testimonials')
      .update({
        quote: body.quote,
        couple_name: body.couple_name,
        session_type: body.session_type,
        location: body.location,
        is_active: body.is_active,
        display_order: body.display_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 500 });
  }
}

// DELETE testimonial
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 500 });
  }
}
