import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '~/server/auth';

import Sidebar from '~/components/layout/Sidebar';
import Header from '~/components/layout/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/sign-in');
  }

  return (
    <div className='flex h-screen bg-dark-bg text-dark-text-primary'>
      <Sidebar />
      <div className='flex flex-1 flex-col overflow-hidden'>
        <Header session={session} />
        <main className='flex-1 overflow-y-auto p-6 bg-dark-bg'>
          {children}
        </main>
      </div>
    </div>
  );
}
