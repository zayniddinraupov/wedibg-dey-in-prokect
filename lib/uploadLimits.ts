// Правила загрузки файлов: используются и в браузере (проверка до отправки), и на сервере.
export type UploadKind = 'image' | 'audio' | 'video';

export interface UploadRule {
  types: string[]; // разрешённые MIME-типы (можно с * на конце)
  maxMB: number;
  label: string;
}

export const UPLOAD_RULES: Record<UploadKind, UploadRule> = {
  image: { types: ['image/*'], maxMB: 8, label: 'Фото' },
  audio: { types: ['audio/*'], maxMB: 15, label: 'Музыка' },
  // MOV с iPhone в Chrome и на Android не играет, поэтому только MP4 и WebM
  video: { types: ['video/mp4', 'video/webm'], maxMB: 25, label: 'Видео' },
};
