import type { Metadata } from 'next';
import './globals.css';
import { prisma } from '@/lib/prisma';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const profile = await prisma.companyProfile.findFirst();

    const iconUrl =
      (profile?.logoUrl as string | null | undefined) && profile.logoUrl !== ''
        ? profile.logoUrl
        : '/favicon.png';

    return {
      title: 'Dairy Distribution System',
      description: 'Dairy distribution management platform',
      icons: {
        icon: iconUrl,
      },
    };
  } catch {
    // Fallback to default icon if anything goes wrong
    return {
      title: 'Dairy Distribution System',
      description: 'Dairy distribution management platform',
      icons: {
        icon: '/favicon.png',
      },
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}