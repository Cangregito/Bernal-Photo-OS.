import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, requireAuth, handleError } from '../_helpers';

export async function GET() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false });
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
      .from('blog_posts')
      .insert({
        slug: body.slug, title: body.title,
        excerpt: body.excerpt || null, content: body.content || null,
        cover_image: body.cover_image || null, category: body.category || null,
        is_published: body.is_published ?? false,
        published_at: body.published_at || null,
        testimonial_quote: body.testimonial_quote || null,
        testimonial_author: body.testimonial_author || null,
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
      .from('blog_posts')
      .update({
        slug: body.slug, title: body.title, excerpt: body.excerpt,
        content: body.content, cover_image: body.cover_image,
        category: body.category, is_published: body.is_published,
        published_at: body.published_at, testimonial_quote: body.testimonial_quote,
        testimonial_author: body.testimonial_author, updated_at: new Date().toISOString(),
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
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return handleError(err);
  }
}
