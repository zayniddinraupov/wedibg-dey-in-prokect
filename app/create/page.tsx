import ConstructorForm from '@/components/ConstructorForm';
import { InviteType, ThemeId } from '@/lib/types';
import { themesByType } from '@/lib/themes';

const allThemeIds = Object.values(themesByType).flat();

export default function CreatePage({
  searchParams,
}: {
  searchParams: { type?: string; theme?: string };
}) {
  const rawType = searchParams.type;
  const initialType: InviteType | undefined =
    rawType === 'wedding' || rawType === 'birthday' ? rawType : undefined;

  const rawTheme = searchParams.theme;
  const initialTheme: ThemeId | undefined = allThemeIds.includes(rawTheme as ThemeId)
    ? (rawTheme as ThemeId)
    : undefined;

  return <ConstructorForm initialType={initialType} initialTheme={initialTheme} />;
}
