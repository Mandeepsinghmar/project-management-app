'use client';

import { TRPCReactProvider } from '~/trpc/react';
import { ThemeProvider } from '~/components/theme-provider';
import NextAuthSessionProvider from '~/components/auth/NextAuthSessionProvider';
import { Toaster } from '~/components/ui/sonner';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { Session } from 'next-auth';

export function AppProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <NextAuthSessionProvider session={session}>
      <TRPCReactProvider>
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
          {children}
          <Toaster richColors position='top-right' />
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </ThemeProvider>
      </TRPCReactProvider>
    </NextAuthSessionProvider>
  );
}
