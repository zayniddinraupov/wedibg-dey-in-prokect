import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    const blob = await put(`invites/${Date.now()}-${file.name}`, file, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Не удалось загрузить файл' }, { status: 500 });
  }
}
