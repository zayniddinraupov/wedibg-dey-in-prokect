import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Конструктор приглашений',
  description:
    'Создайте свадебное приглашение или приглашение на день рождения и получите готовую ссылку для гостей.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Jost:wght@300;400;500;600&family=Baloo+2:wght@500;600;700;800&family=Nunito+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
