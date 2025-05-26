import { getServerSession } from 'next-auth/next';
import { authOptions } from '~/server/auth';
import { redirect } from 'next/navigation';
import SignUpForm from '~/components/auth/SignUpForm';
import Link from 'next/link';

export default async function SignUpPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/');
  }

  return (
    <div className='min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md bg-dark-surface p-8 rounded-lg shadow-xl'>
        <div className='text-center mb-8'>
          <svg
            viewBox='0 0 100 100'
            className='h-16 w-16 mx-auto mb-4 fill-current text-dark-accent'
          >
            <circle
              cx='50'
              cy='50'
              r='40'
              stroke='currentColor'
              strokeWidth='8'
              fill='none'
            />
            <path d='M30 50 L50 70 L70 50 L50 30 Z' />
          </svg>
          <h1 className='text-3xl font-bold text-dark-text-primary'>
            Create Account
          </h1>
          <p className='text-dark-text-secondary'>
            Join to manage your projects efficiently.
          </p>
        </div>
        <SignUpForm />
        <p className='mt-6 text-center text-sm text-dark-text-secondary'>
          Already have an account?{' '}
          <Link
            href='/sign-in'
            className='font-medium text-dark-accent hover:underline'
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
