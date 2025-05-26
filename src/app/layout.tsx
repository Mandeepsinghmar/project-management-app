import '~/app/globals.css';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '~/server/auth';
import { AppProviders } from '~/components/AppProviders';

import { GeistMono } from 'geist/font/mono';

export const metadata = {
  title: 'Manox',
  description: 'Task management and collaboration tool',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const serverFetchedSession = await getServerSession(authOptions);

  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${GeistMono.className}  antialiased`}>
        <AppProviders session={serverFetchedSession}>{children}</AppProviders>
      </body>
    </html>
  );
}
