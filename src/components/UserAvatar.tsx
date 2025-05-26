import { type User as NextAuthUser } from 'next-auth';
import { type User as PrismaUser } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { cn } from '~/lib/utils';

type UserLike = Partial<
  Pick<NextAuthUser & PrismaUser, 'name' | 'image' | 'email'>
>;

interface UserAvatarProps {
  user?: UserLike | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function UserAvatar({
  user,
  className,
  size = 'md',
}: UserAvatarProps) {
  const name = user?.name ?? user?.email?.split('@')[0] ?? 'User';
  const image = user?.image ?? undefined;

  let avatarSizeClass = 'h-8 w-8';
  let fallbackTextSizeClass = 'text-sm';

  switch (size) {
    case 'sm':
      avatarSizeClass = 'h-6 w-6';
      fallbackTextSizeClass = 'text-xs';
      break;
    case 'lg':
      avatarSizeClass = 'h-10 w-10';
      fallbackTextSizeClass = 'text-base';
      break;
    case 'xl':
      avatarSizeClass = 'h-12 w-12';
      fallbackTextSizeClass = 'text-lg';
      break;
  }

  const fallback = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <Avatar className={cn(avatarSizeClass, className)}>
      <AvatarImage src={image} alt={name ?? 'User avatar'} />
      <AvatarFallback
        className={cn('bg-dark-accent text-white', fallbackTextSizeClass)}
      >
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}
