import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LUMIA Agent Platform',
  description: 'AI-powered services, learning, coding, web intelligence and Irembo assistance.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
