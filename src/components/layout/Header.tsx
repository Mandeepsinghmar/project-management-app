'use client';
import { type Session } from 'next-auth';
import { Search, Bell } from 'lucide-react';
import { UserNav } from './UserNav';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';

interface HeaderProps {
  session: Session | null;
}

export default function Header({ session }: HeaderProps) {
  return (
    <header className='sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-dark-border bg-dark-surface px-6'>
      <div className='flex flex-1 items-center'>
        <div className='relative w-full max-w-md'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-text-secondary' />
          <Input
            type='search'
            placeholder='Search...'
            className='w-full rounded-md bg-dark-bg pl-10 pr-4 h-9 border-dark-border focus:ring-dark-accent'
          />
        </div>
      </div>

      <div className='flex items-center space-x-4'>
        <Button
          variant='ghost'
          size='icon'
          className='text-dark-text-secondary hover:text-dark-text-primary'
        >
          <Bell className='h-5 w-5' />
          <span className='sr-only'>Notifications</span>
        </Button>
        {session?.user && <UserNav user={session.user} />}
      </div>
    </header>
  );
}
