import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { COMPLAI_ICON, PRODUCT_DESCRIPTION, PRODUCT_TITLE } from '@/lib/brand';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#12141c',
};

export const metadata: Metadata = {
  title: PRODUCT_TITLE,
  description: PRODUCT_DESCRIPTION,
  icons: {
    icon: COMPLAI_ICON,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className={`${inter.className} overflow-x-hidden antialiased`}>{children}</body>
    </html>
  );
}
