import SiteNav from '@/components/SiteNav';
import ConstructorForm from '@/components/ConstructorForm';
import { InviteType, ThemeId } from '@/lib/types';
import { EVENTS, isInviteType } from '@/lib/events';

export default function CreatePage({
  searchParams,
}: {
  searchParams: { type?: string; theme?: string };
}) {
  const initialType: InviteType | undefined = isInviteType(searchParams.type)
    ? searchParams.type
    : undefined;

  // Оформление принимаем, только если оно подходит выбранному виду события
  const rawTheme = searchParams.theme as ThemeId | undefined;
  const initialTheme: ThemeId | undefined =
    initialType && rawTheme && EVENTS[initialType].themes.includes(rawTheme) ? rawTheme : undefined;

  return (
    <>
      <SiteNav />
      <ConstructorForm initialType={initialType} initialTheme={initialTheme} />
    </>
  );
}
