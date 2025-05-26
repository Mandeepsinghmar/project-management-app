'use client';

import { type User } from 'next-auth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, User as UserIcon, Settings, HelpCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserNavProps {
  user: Pick<User, 'name' | 'image' | 'email'>;
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false, callbackUrl: '/sign-in' });
    toast.success('Signed out successfully');
    router.push('/sign-in');
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-9 w-9 rounded-full'>
          <Avatar className='h-9 w-9'>
            <AvatarImage src={user.image ?? ''} alt={user.name ?? 'User'} />
            <AvatarFallback className='bg-dark-accent text-white'>
              {user.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                : 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-56 bg-dark-surface border-dark-border text-dark-text-primary'
        align='end'
        forceMount
      >
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{user.name}</p>
            <p className='text-xs leading-none text-dark-text-secondary'>
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='bg-dark-border' />
        <DropdownMenuGroup>
          <Link href='/profile'>
            <DropdownMenuItem className='hover:bg-dark-hover cursor-pointer'>
              <UserIcon className='mr-2 h-4 w-4' />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem className='hover:bg-dark-hover cursor-pointer'>
            <Settings className='mr-2 h-4 w-4' />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='hover:bg-dark-hover cursor-pointer'>
            <HelpCircle className='mr-2 h-4 w-4' />
            <span>Help</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className='bg-dark-border' />
        <DropdownMenuItem
          onClick={handleSignOut}
          className='hover:bg-dark-hover cursor-pointer text-red-400 hover:text-red-300'
        >
          <LogOut className='mr-2 h-4 w-4' />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
