'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api } from '~/trpc/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { toast } from 'sonner';
import { Loader2, UserCircle, Edit, ImagePlus } from 'lucide-react';
import UserAvatar from '~/components/UserAvatar';
import { updateUserProfileSchema } from '~/lib/validators';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type ProfileFormValues = z.infer<typeof updateUserProfileSchema>;

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    refetch,
  } = api.user.getProfile.useQuery(undefined, {
    enabled: !!session,
  });

  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      name: '',
      image: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name ?? '',
        image: userProfile.image ?? '',
      });
    }
  }, [userProfile, form, isEditing]);

  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: async (updatedUser) => {
      toast.success('Profile updated successfully!');
      await refetch();
      await updateSession({
        user: {
          ...session?.user,
          name: updatedUser.name,
          image: updatedUser.image,
        },
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }

  if (isLoadingProfile || !userProfile) {
    return (
      <div className='flex justify-center items-center h-full'>
        <Loader2 className='h-12 w-12 animate-spin text-dark-accent' />
      </div>
    );
  }

  return (
    <div className='space-y-6 max-w-3xl mx-auto'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <UserCircle className='h-7 w-7 text-dark-accent' />
          <h1 className='text-2xl font-semibold text-dark-text-primary'>
            My Profile
          </h1>
        </div>
        {!isEditing && (
          <Button
            variant='outline'
            onClick={() => setIsEditing(true)}
            className='border-dark-border text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary'
          >
            <Edit className='mr-2 h-4 w-4' /> Edit Profile
          </Button>
        )}
      </div>

      <Card className='bg-dark-surface border-dark-border'>
        <CardHeader className='flex flex-row items-center gap-4'>
          <div className='relative'>
            <UserAvatar
              user={{
                name: userProfile.name,
                image: userProfile.image,
                email: userProfile.email,
              }}
              className='h-24 w-24 text-3xl'
            />
            {isEditing && (
              <label
                htmlFor='profile-image-upload'
                className='absolute -bottom-1 -right-1 bg-dark-accent p-1.5 rounded-full cursor-pointer hover:bg-purple-500'
              >
                <ImagePlus className='h-4 w-4 text-white' />
                <input
                  id='profile-image-upload'
                  type='file'
                  className='sr-only'
                  accept='image/*'
                  disabled
                />
              </label>
            )}
          </div>
          <div>
            <CardTitle className='text-2xl text-dark-text-primary'>
              {userProfile.name || 'User'}
            </CardTitle>
            <CardDescription className='text-dark-text-secondary'>
              {userProfile.email}
            </CardDescription>
            <p className='text-xs text-dark-text-secondary mt-1'>
              Joined: {new Date(userProfile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardHeader>

        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className='space-y-4 pt-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Your full name'
                          {...field}
                          className='bg-dark-bg border-dark-border'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='image'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Picture URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://example.com/image.png'
                          {...field}
                          className='bg-dark-bg border-dark-border'
                        />
                      </FormControl>
                      <FormMessage />
                      <p className='text-xs text-dark-text-secondary pt-1'>
                        For file uploads, integrate with Supabase Storage.
                      </p>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className='border-t border-dark-border pt-4 flex justify-end space-x-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setIsEditing(false);
                    form.reset();
                  }}
                  className='border-dark-border text-dark-text-secondary hover:bg-dark-hover'
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={updateProfileMutation.isPending}
                  className='bg-dark-accent hover:bg-purple-500 text-white'
                >
                  {updateProfileMutation.isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Form>
        ) : (
          <CardContent className='pt-4'>
            <p className='text-sm text-dark-text-secondary'>
              No additional profile information to display.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
