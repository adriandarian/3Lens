import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '3Lens - Next.js SSR Example',
  description: 'Demonstrating 3Lens integration with Next.js and server-side rendering',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

