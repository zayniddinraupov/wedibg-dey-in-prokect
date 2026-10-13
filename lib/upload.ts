import { upload } from '@vercel/blob/client';
import { UPLOAD_RULES, UploadKind } from './uploadLimits';

/** Загружает файл напрямую в Vercel Blob из браузера (без ограничения 4.5 МБ на API-роут). */
export async function uploadFile(file: File, kind: UploadKind): Promise<string> {
  const rule = UPLOAD_RULES[kind];
  if (file.size > rule.maxMB * 1024 * 1024) {
    throw new Error(`Файл слишком большой: максимум ${rule.maxMB} МБ`);
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-60) || 'file';
  const pathname = `invites/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

  const blob = await upload(pathname, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
    clientPayload: kind,
  });
  return blob.url;
}
