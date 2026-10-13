import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { UPLOAD_RULES, UploadKind } from '@/lib/uploadLimits';
import { rateLimit } from '@/lib/rateLimit';
import { hasValidSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

// Выдаёт браузеру одноразовый токен на загрузку. Сам файл идёт мимо этого роута — прямо в Blob.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as HandleUploadBody | null;
  if (!body) {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  // Ограничиваем только выдачу токена. Служебный вызов «загрузка завершена» приходит
  // от самого Vercel, его подлинность проверяет handleUpload.
  if (body.type === 'blob.generate-client-token') {
    const blocked = await rateLimit(request, 'upload', [
      { limit: 40, windowSec: 3600 },
      { limit: 150, windowSec: 86400 },
    ]);
    if (blocked) return blocked;
    if (!hasValidSession(request)) {
      return NextResponse.json({ error: 'captcha' }, { status: 401 });
    }
  }

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const kind = (clientPayload || '') as UploadKind;
        if (!(kind in UPLOAD_RULES)) {
          throw new Error('Неизвестный тип файла');
        }
        const rule = UPLOAD_RULES[kind];
        return {
          allowedContentTypes: rule.types,
          maximumSizeInBytes: rule.maxMB * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {
        // ничего не делаем: ссылку на файл браузер сам отправит вместе с формой
      },
    });
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
