import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PRIVYCORE_ICON, PRODUCT_DESCRIPTION, PRODUCT_TITLE } from '@/lib/brand';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f0d1a',
};

export const metadata: Metadata = {
  title: PRODUCT_TITLE,
  description: PRODUCT_DESCRIPTION,
  icons: { icon: PRIVYCORE_ICON },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} overflow-x-hidden antialiased`}>{children}</body>
    </html>
  );
}
