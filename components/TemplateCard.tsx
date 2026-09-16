import Link from 'next/link';
import { ThemeId, InviteType } from '@/lib/types';
import { themes } from '@/lib/themes';
import TemplateThumb from './TemplateThumb';

export default function TemplateCard({
  themeId,
  type,
}: {
  themeId: ThemeId;
  type: InviteType;
}) {
  const t = themes[themeId];

  return (
    <Link href={`/create?type=${type}&theme=${themeId}`} className="group block">
      <TemplateThumb themeId={themeId} />
      <div className="mt-3">
        <div className="text-sm font-medium text-gray-900">{t.label}</div>
        <div className="text-xs text-gray-500">
          {t.style} · {type === 'wedding' ? 'Свадьба' : 'День рождения'}
        </div>
      </div>
    </Link>
  );
}
