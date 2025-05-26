'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { api } from '~/trpc/react';
import { toast } from 'sonner';
import { createProjectSchema, updateProjectSchema } from '~/lib/validators';
import { type Project } from '@prisma/client';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
  projectToEdit?: Project;
}

const formSchema = createProjectSchema.merge(
  updateProjectSchema.pick({ id: true }).partial()
);
type ProjectFormValues = z.infer<typeof formSchema>;

export function CreateProjectDialog({
  isOpen,
  onClose,
  onProjectCreated,
  projectToEdit,
}: CreateProjectDialogProps) {
  const utils = api.useUtils();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: undefined,
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    if (projectToEdit) {
      form.reset({
        id: projectToEdit.id,
        title: projectToEdit.title,
        description: projectToEdit.description ?? '',
      });
    } else {
      form.reset({
        id: undefined,
        title: '',
        description: '',
      });
    }
  }, [projectToEdit, isOpen, form]);

  const createProjectMutation = api.project.create.useMutation();
  const updateProjectMutation = api.project.update.useMutation();

  async function onSubmit(data: ProjectFormValues) {
    setIsLoading(true);
    try {
      if (projectToEdit && data.id) {
        await updateProjectMutation.mutateAsync(data as Required<typeof data>);
        toast.success('Project updated successfully!');
      } else {
        await createProjectMutation.mutateAsync(data);
        toast.success('Project created successfully!');
      }
      onProjectCreated();
      utils.project.getAll.invalidate();
      utils.project.getSidebarProjects.invalidate();
      if (data.id) utils.project.getById.invalidate({ id: data.id });
      onClose();
    } catch (error) {
      toast.error(`Failed: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-[425px] bg-dark-surface border-dark-border text-dark-text-primary'>
        <DialogHeader>
          <DialogTitle>
            {projectToEdit ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription className='text-dark-text-secondary'>
            {projectToEdit
              ? 'Update the details of your project.'
              : 'Fill in the details for your new project.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='space-y-4 py-2 max-h-[70vh] pb-3 px-1 overflow-y-auto pr-2'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Q4 Marketing Campaign'
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
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Add a brief description of the project...'
                        {...field}
                        className='bg-dark-bg border-dark-border'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className='pt-4 pr-2'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                className='border-dark-border text-dark-text-secondary hover:bg-dark-hover'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isLoading}
                className='bg-dark-accent hover:bg-purple-500 text-white'
              >
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {projectToEdit ? 'Save Changes' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
