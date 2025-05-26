'use client';
import { CheckCircle, Users, CalendarDays, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '~/trpc/react';
import { cn } from '~/lib/utils';

interface HomeHeaderProps {
  userName: string;
}

export function HomeHeader({ userName }: HomeHeaderProps) {
  const today = new Date();
  const { data: dashboardStats, isLoading: isLoadingStats } =
    api.user.getDashboardStats.useQuery();

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row items-start md:items-center justify-between gap-4',
        'p-6 rounded-lg bg-gradient-to-br from-dark-surface to-dark-bg shadow-xl mb-6 border border-dark-border/50' // Stylish container
      )}
    >
      <div>
        <div className='text-sm flex items-center gap-2 font-medium text-purple-400 tracking-wider uppercase'>
          <CalendarDays className='w-4 h-4 ' />
          <p>{format(today, 'eeee, MMMM d')}</p>
        </div>
        <h1 className='text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mt-1'>
          Good morning,{userName.split(' ')[0]}
        </h1>
      </div>

      <div className='flex items-center space-x-4 md:space-x-6 mt-4 md:mt-0'>
        <div className='flex flex-col items-center p-3 rounded-md bg-dark-bg/50 hover:bg-dark-bg/80 transition-colors'>
          {isLoadingStats ? (
            <Loader2 className='h-5 w-5 animate-spin text-purple-400' />
          ) : (
            <span className='text-2xl font-bold text-purple-400'>
              {dashboardStats?.completedTasksCount ?? 0}
            </span>
          )}
          <p className='text-xs text-dark-text-secondary mt-1 flex items-center'>
            <CheckCircle className='h-3 w-3 mr-1 text-green-500' /> Tasks Done
          </p>
        </div>

        <div className='flex flex-col items-center p-3 rounded-md bg-dark-bg/50 hover:bg-dark-bg/80 transition-colors'>
          {isLoadingStats ? (
            <Loader2 className='h-5 w-5 animate-spin text-blue-400' />
          ) : (
            <span className='text-2xl font-bold text-blue-400'>
              {dashboardStats?.collaboratorsCount ?? 0}
            </span>
          )}
          <p className='text-xs text-dark-text-secondary mt-1 flex items-center'>
            <Users className='h-3 w-3 mr-1 text-blue-400' /> Collaborators
          </p>
        </div>
      </div>
    </div>
  );
}
