import type { Metadata } from 'next';
import './globals.css';
import { COMPLAI_ICON, PRODUCT_DESCRIPTION, PRODUCT_TITLE } from '@/lib/brand';

export const metadata: Metadata = {
  title: PRODUCT_TITLE,
  description: PRODUCT_DESCRIPTION,
  icons: {
    icon: COMPLAI_ICON,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
