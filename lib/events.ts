import { InviteType, ProgramItem, ThemeId } from './types';

// Здесь описано всё, чем один вид приглашения отличается от другого.
// Чтобы добавить новый вид (например, «Сунат той»): добавьте его id в InviteType
// (lib/types.ts), заполните запись ниже и добавьте в EVENT_ORDER.

export interface EventDef {
  id: InviteType;
  label: string; // название вида в переключателях
  kicker: string; // строка над именами на самом приглашении
  closing: string; // подпись внизу приглашения
  twoNames: boolean; // true: имена показываются через «&» (пара); false: второе поле — подзаголовок
  name1Label: string;
  name1Placeholder: string;
  name2Label: string;
  name2Placeholder: string;
  defaultIntro: string;
  defaultTime: string;
  giftsTitle: string;
  dressTitle: string;
  programTitle: string;
  calendarLabel: string; // как называется событие в календаре гостя
  themes: ThemeId[];
  sampleNames: string; // для миниатюр в галерее
  program: ProgramItem[]; // пример плана, который можно подставить одной кнопкой
}

export const EVENTS: Record<InviteType, EventDef> = {
  wedding: {
    id: 'wedding',
    label: 'Свадьба',
    kicker: 'Приглашаем на свадьбу',
    closing: 'С любовью',
    twoNames: true,
    name1Label: 'Имя жениха',
    name1Placeholder: 'Дмитрий',
    name2Label: 'Имя невесты',
    name2Placeholder: 'Анна',
    defaultIntro:
      'Мы с огромной радостью приглашаем вас разделить с нами этот особенный день — день нашей свадьбы.',
    defaultTime: '16:00',
    giftsTitle: 'Подарки',
    dressTitle: 'Дресс-код',
    programTitle: 'План мероприятия',
    calendarLabel: 'Свадьба',
    themes: ['botanical', 'navy', 'blush', 'mono'],
    sampleNames: 'Анна & Дмитрий',
    program: [
      { time: '15:30', title: 'Сбор гостей', text: 'Welcome-зона и лёгкие закуски' },
      { time: '16:00', title: 'Церемония' },
      { time: '17:00', title: 'Праздничный банкет' },
      { time: '19:00', title: 'Первый танец молодожёнов' },
      { time: '21:30', title: 'Свадебный торт' },
      { time: '23:00', title: 'Завершение вечера' },
    ],
  },
  nahor: {
    id: 'nahor',
    label: 'Нахор оши',
    kicker: 'Приглашаем на нахор оши',
    closing: 'Будем рады видеть вас',
    twoNames: true,
    name1Label: 'Имя жениха (или хозяина торжества)',
    name1Placeholder: 'Азиз',
    name2Label: 'Имя невесты (по желанию)',
    name2Placeholder: 'Малика',
    defaultIntro:
      'Приглашаем вас на утренний плов — нахор оши в честь свадебного торжества. Будем рады разделить с вами это светлое утро и угощение за общим дастарханом.',
    defaultTime: '08:00',
    giftsTitle: 'Пожелания',
    dressTitle: 'Дресс-код',
    programTitle: 'План утра',
    calendarLabel: 'Нахор оши',
    themes: ['samarkand', 'saffron'],
    sampleNames: 'Азиз & Малика',
    program: [
      { time: '07:00', title: 'Сбор гостей' },
      { time: '08:00', title: 'Утренний плов', text: 'Угощение за общим дастарханом' },
      { time: '09:00', title: 'Пожелания и благословение' },
      { time: '10:00', title: 'Завершение' },
    ],
  },
  fotiha: {
    id: 'fotiha',
    label: 'Фатиха',
    kicker: 'Приглашаем на фатиху',
    closing: 'С уважением',
    twoNames: true,
    name1Label: 'Имя жениха',
    name1Placeholder: 'Жасур',
    name2Label: 'Имя невесты',
    name2Placeholder: 'Нилуфар',
    defaultIntro:
      'С радостью приглашаем вас на фатиху — церемонию помолвки, чтобы вместе благословить наш союз и разделить с нами этот светлый день.',
    defaultTime: '15:00',
    giftsTitle: 'Пожелания',
    dressTitle: 'Дресс-код',
    programTitle: 'План мероприятия',
    calendarLabel: 'Фатиха',
    themes: ['emerald', 'pearl'],
    sampleNames: 'Жасур & Нилуфар',
    program: [
      { time: '15:00', title: 'Встреча гостей' },
      { time: '15:30', title: 'Церемония фатихи' },
      { time: '16:00', title: 'Обмен кольцами и благословения' },
      { time: '16:30', title: 'Праздничное угощение' },
      { time: '18:00', title: 'Завершение' },
    ],
  },
  jubilee: {
    id: 'jubilee',
    label: 'Юбилей',
    kicker: 'Приглашаем на юбилей',
    closing: 'С уважением и радостью',
    twoNames: false,
    name1Label: 'Имя юбиляра',
    name1Placeholder: 'Рустам Азизович',
    name2Label: 'Подзаголовок (по желанию)',
    name2Placeholder: '60 лет',
    defaultIntro:
      'С радостью приглашаем вас разделить с нами этот знаменательный день — юбилей, который так хочется отметить в кругу самых близких.',
    defaultTime: '18:00',
    giftsTitle: 'Подарки и пожелания',
    dressTitle: 'Дресс-код',
    programTitle: 'Программа вечера',
    calendarLabel: 'Юбилей',
    themes: ['gold', 'champagne'],
    sampleNames: 'Рустам Азизович',
    program: [
      { time: '17:30', title: 'Встреча гостей' },
      { time: '18:00', title: 'Торжественная часть' },
      { time: '18:30', title: 'Поздравления' },
      { time: '19:30', title: 'Праздничный ужин' },
      { time: '21:00', title: 'Концертная программа' },
      { time: '22:30', title: 'Праздничный торт' },
    ],
  },
  birthday: {
    id: 'birthday',
    label: 'День рождения',
    kicker: 'Праздник по случаю дня рождения',
    closing: 'Ждём вас',
    twoNames: false,
    name1Label: 'Имя именинника / именинницы',
    name1Placeholder: 'София',
    name2Label: 'Возраст или подзаголовок',
    name2Placeholder: 'Исполняется 7 лет',
    defaultIntro: 'Приглашаем вас на праздник — будет весело, вкусно и очень тепло!',
    defaultTime: '13:00',
    giftsTitle: 'Подарки и пожелания',
    dressTitle: 'На заметку',
    programTitle: 'Программа праздника',
    calendarLabel: 'День рождения',
    themes: ['confetti', 'space', 'retro', 'balloons'],
    sampleNames: 'София',
    program: [
      { time: '13:00', title: 'Встреча гостей' },
      { time: '13:30', title: 'Игры и конкурсы' },
      { time: '15:00', title: 'Праздничный торт' },
      { time: '16:00', title: 'Дискотека и развлечения' },
      { time: '17:30', title: 'Завершение' },
    ],
  },
};

export const EVENT_ORDER: InviteType[] = ['wedding', 'nahor', 'fotiha', 'jubilee', 'birthday'];

export function isInviteType(v: unknown): v is InviteType {
  return typeof v === 'string' && v in EVENTS;
}

/** Имена так, как они показываются на приглашении: пара через «&» или одно имя. */
export function joinNames(type: InviteType, name1: string, name2?: string | null): string {
  const e = EVENTS[type] || EVENTS.wedding;
  return e.twoNames && name2 ? `${name1} & ${name2}` : name1;
}

/** Подзаголовок под именем (возраст и т. п.), только у видов без пары. */
export function subtitleOf(type: InviteType, name2?: string | null): string {
  const e = EVENTS[type] || EVENTS.wedding;
  return !e.twoNames && name2 ? name2 : '';
}

function firstLetter(s: string): string {
  const ch = Array.from(s.trim())[0];
  return ch ? ch.toUpperCase() : '';
}

/** Инициалы для печати на конверте: «И&Ш» или одна буква. */
export function initialsOf(type: InviteType, name1: string, name2?: string | null): string {
  const e = EVENTS[type] || EVENTS.wedding;
  const a = firstLetter(name1);
  const b = e.twoNames && name2 ? firstLetter(name2) : '';
  return b ? `${a}&${b}` : a;
}
