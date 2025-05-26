'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { signUpSchema } from '~/lib/validators';
import { api } from '~/trpc/react';

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const signUpMutation = api.user.signUp.useMutation();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: SignUpFormValues) {
    setIsLoading(true);
    setFormMessage(null);
    try {
      const result = await signUpMutation.mutateAsync(data);
      toast.success(result.message);
      setFormMessage({
        type: 'success',
        text: result.message + ' Redirecting to sign in...',
      });

      setTimeout(() => {
        if (result.emailConfirmed) {
          router.push('/sign-in');
        }
      }, 3000);
    } catch (error: any) {
      const message =
        error.message || 'An unexpected error occurred. Please try again.';
      toast.error(message);
      setFormMessage({ type: 'error', text: message });
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-dark-text-secondary'>
                Full Name (Optional)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='Your Name'
                  {...field}
                  className='bg-dark-bg border-dark-border focus:ring-dark-accent'
                  autoComplete='name'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-dark-text-secondary'>Email</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder='m@example.com'
                  {...field}
                  className='bg-dark-bg border-dark-border focus:ring-dark-accent'
                  autoComplete='email'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-dark-text-secondary'>
                Password
              </FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='••••••••'
                  {...field}
                  className='bg-dark-bg border-dark-border focus:ring-dark-accent'
                  autoComplete='new-password'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-dark-text-secondary'>
                Confirm Password
              </FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='••••••••'
                  {...field}
                  className='bg-dark-bg border-dark-border focus:ring-dark-accent'
                  autoComplete='new-password'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {formMessage && (
          <p
            className={`text-sm ${formMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}
          >
            {formMessage.text}
          </p>
        )}

        <Button
          type='submit'
          className='w-full bg-dark-accent hover:bg-purple-500 text-white'
          disabled={isLoading}
        >
          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Create Account
        </Button>
      </form>
    </Form>
  );
}
