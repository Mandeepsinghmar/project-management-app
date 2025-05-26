import { getServerSession } from 'next-auth/next';
import { authOptions } from '~/server/auth';

import { HomeHeader } from '~/components/dashboard/HomeHeader';
import { MyTasksSummaryCard } from '~/components/dashboard/MyTasksSummaryCard';
import { ProjectsSummaryCard } from '~/components/dashboard/ProjectsSummaryCard';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/sign-in');
  }

  return (
    <div className='space-y-6'>
      <HomeHeader userName={session?.user?.name ?? 'User'} />
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <MyTasksSummaryCard />
        <ProjectsSummaryCard />
      </div>
    </div>
  );
}
