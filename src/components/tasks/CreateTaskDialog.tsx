'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import {
  CalendarIcon,
  Loader2,
  UserPlus,
  Tag as TagIconLucide,
  X,
  Plus,
} from 'lucide-react';
import { Calendar } from '~/components/ui/calendar';
import { cn } from '~/lib/utils';
import { format } from 'date-fns';
import { api } from '~/trpc/react';
import { toast } from 'sonner';
import {
  createTaskSchema,
  TaskStatusEnum,
  TaskPriorityEnum,
} from '~/lib/validators';
import {
  type Project,
  type User,
  type Task as PrismaTask,
  type Tag as PrismaTag,
} from '@prisma/client';
import { useEffect, useState } from 'react';
import UserAvatar from '~/components/UserAvatar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';
import { useSession } from 'next-auth/react';
import { Badge } from '~/components/ui/badge';

type FullTaskToEdit = PrismaTask & {
  assignees: { user: User }[];
  tags: { tag: PrismaTag }[];
  project?: Project | null;
};

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  projects: Pick<Project, 'id' | 'title'>[];
  taskToEdit?: FullTaskToEdit;
  defaultProjectId?: string;
  hideProjectSelector?: boolean;
}

const formSchema = createTaskSchema;
type TaskFormValues = z.infer<typeof formSchema>;
const NO_PROJECT_UI_VALUE = '__NO_PROJECT__';

export function CreateTaskDialog({
  isOpen,
  onClose,
  onTaskCreated,
  // projects,
  taskToEdit,
  defaultProjectId,
  hideProjectSelector,
}: CreateTaskDialogProps) {
  const { data: session } = useSession();
  const utils = api.useUtils();
  const [isLoading, setIsLoading] = useState(false);

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const { data: projects, isLoading: isLoadingProjects } =
    api.project.getAll.useQuery(undefined, {
      enabled: isOpen, // Only fetch when modal is open
    });

  const { data: assignableUsersResult } = api.user.searchUsers.useQuery(
    { query: userSearchQuery },
    { enabled: userSearchQuery.length > 0 }
  );
  const [selectedAssignees, setSelectedAssignees] = useState<User[]>([]);

  const { data: allTags, refetch: refetchTags } = api.task.getAllTags.useQuery(
    undefined,
    { enabled: isOpen }
  );
  const [selectedTags, setSelectedTags] = useState<PrismaTag[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const createTagMutation = api.task.createTag.useMutation({
    onSuccess: (newTag) => {
      toast.success(`Tag "${newTag.name}" created!`);
      setSelectedTags((prev) => [...prev, newTag]);
      refetchTags();
      setTagSearchQuery('');
      setIsCreatingTag(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: defaultProjectId ?? null,
      dueDate: null,
      assigneeIds: [],
      status: 'TODO',
      priority: 'MEDIUM',
      tags: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        const editAssigneeIds = taskToEdit.assignees
          .map((a) => a.user.id)
          .filter((id) => typeof id === 'string' && id.length > 0);

        form.reset({
          id: taskToEdit.id,
          title: taskToEdit.title,
          description: taskToEdit.description ?? '',
          projectId: taskToEdit.projectId ?? defaultProjectId ?? null,
          dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null,
          assigneeIds: editAssigneeIds,
          status: taskToEdit.status,
          priority: taskToEdit.priority,
          tags: taskToEdit.tags.map((t) => t.tag),
        });
        setSelectedAssignees(taskToEdit.assignees.map((a) => a.user));
        setSelectedTags(taskToEdit.tags.map((t) => t.tag));
      } else {
        let initialAssigneeIdsForForm: string[] = [];
        let defaultAssigneesForUIState: User[] = [];

        form.reset({
          title: '',
          description: '',
          projectId: defaultProjectId ?? null,
          dueDate: null,
          assigneeIds: initialAssigneeIdsForForm,
          status: 'TODO',
          priority: 'MEDIUM',
          tags: [],
        });
        setSelectedAssignees(defaultAssigneesForUIState);
        setSelectedTags([]);
      }
    }
  }, [taskToEdit, isOpen, form, defaultProjectId, session]);

  const createTaskMutation = api.task.create.useMutation();
  const updateTaskMutation = api.task.update.useMutation();

  async function onSubmit(data: TaskFormValues) {
    setIsLoading(true);

    const payload = {
      ...data,
      id: taskToEdit?.id,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      assigneeIds: selectedAssignees.map((u) => u.id),
      tags: selectedTags.map((tag) => ({ id: tag.id, name: tag.name })),
    };

    try {
      if (taskToEdit) {
        await updateTaskMutation.mutateAsync(payload as any);
        toast.success('Task updated successfully!');
      } else {
        await createTaskMutation.mutateAsync(payload as any);
        toast.success('Task created successfully!');
      }
      onTaskCreated();

      // utils.user.getMyTasks.invalidate();
      if (payload.projectId) {
        utils.project.getById.invalidate({ id: payload.projectId });
        utils.project.getAll.invalidate();
        utils.project.getSidebarProjects.invalidate();
      }
      // utils.user.getDashboardStats.invalidate();
      // utils.task.getAll.invalidate();

      onClose();
    } catch (error) {
      toast.error(`Failed: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAssigneeSelect = (user: User) => {
    setSelectedAssignees((prev) =>
      prev.find((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
    setUserSearchQuery('');
  };

  const handleTagSelect = (tag: PrismaTag) => {
    setSelectedTags((prev) =>
      prev.find((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag]
    );
    setTagSearchQuery('');
  };

  const handleCreateNewTag = () => {
    if (tagSearchQuery.trim() === '') return;
    createTagMutation.mutate({ name: tagSearchQuery.trim() });
  };

  const assignableUsers =
    assignableUsersResult?.filter(
      (u) => !selectedAssignees.find((sa) => sa.id === u.id)
    ) ?? [];
  const availableTags =
    allTags?.filter((t) => !selectedTags.find((st) => st.id === t.id)) ?? [];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-lg bg-dark-surface border-dark-border text-dark-text-primary'>
        <DialogHeader>
          <DialogTitle>
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='space-y-4 py-2 max-h-[70vh] pb-3 pl-1 overflow-y-auto pr-2'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Design the homepage'
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Add more details...'
                        {...field}
                        className='bg-dark-bg border-dark-border'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!hideProjectSelector && (
                <FormField
                  control={form.control}
                  name='projectId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project (Optional)</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(
                            value === NO_PROJECT_UI_VALUE ? null : value
                          )
                        }
                        value={
                          field.value === null || field.value === undefined
                            ? NO_PROJECT_UI_VALUE
                            : field.value
                        }
                        defaultValue={field.value ?? ''}
                      >
                        <FormControl>
                          <SelectTrigger className='bg-dark-bg border-dark-border'>
                            <SelectValue placeholder='No project' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='bg-dark-surface border-dark-border text-dark-text-primary'>
                          <SelectItem
                            value={NO_PROJECT_UI_VALUE}
                            className='hover:!bg-dark-hover italic'
                          >
                            No project (personal task)
                          </SelectItem>
                          {projects?.map((project) => (
                            <SelectItem
                              key={project.id}
                              value={project.id}
                              className='hover:!bg-dark-hover'
                            >
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormItem>
                <FormLabel>Assignees</FormLabel>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {selectedAssignees.map((user) => (
                    <Badge
                      key={user.id}
                      variant='secondary'
                      className='flex items-center gap-1 pr-1 bg-dark-bg border-dark-border'
                    >
                      <UserAvatar user={user} className='h-4 w-4' /> {user.name}
                      <button
                        type='button'
                        onClick={() =>
                          setSelectedAssignees((prev) =>
                            prev.filter((u) => u.id !== user.id)
                          )
                        }
                        className='ml-1 rounded-full hover:bg-dark-hover p-0.5'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      className='w-full justify-start bg-dark-bg border-dark-border hover:bg-dark-hover'
                    >
                      <UserPlus className='mr-2 h-4 w-4 opacity-50' />{' '}
                      Add/Remove Assignees...
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-[--radix-popover-trigger-width] p-0 bg-dark-surface border-dark-border'>
                    <Command>
                      <CommandInput
                        placeholder='Search user...'
                        className='h-9'
                        onValueChange={setUserSearchQuery}
                        value={userSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>No user found.</CommandEmpty>
                        <CommandGroup>
                          {assignableUsers.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.name ?? user.id}
                              onSelect={() => handleAssigneeSelect(user)}
                              className='hover:!bg-dark-hover'
                            >
                              <UserAvatar
                                user={user}
                                className='mr-2 h-5 w-5'
                              />
                              {user.name}{' '}
                              <span className='text-xs text-dark-text-secondary ml-2'>
                                {user.email}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormItem>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='dueDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel className='mb-1'>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal bg-dark-bg border-dark-border hover:bg-dark-hover',
                                !field.value && 'text-dark-text-secondary'
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className='w-auto p-0 bg-dark-surface border-dark-border'
                          align='start'
                        >
                          <Calendar
                            mode='single'
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='priority'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className='bg-dark-bg border-dark-border'>
                            <SelectValue placeholder='Select priority' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='bg-dark-surface border-dark-border text-dark-text-primary'>
                          {TaskPriorityEnum.options.map((priority) => (
                            <SelectItem
                              key={priority}
                              value={priority}
                              className='hover:!bg-dark-hover'
                            >
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='bg-dark-bg border-dark-border'>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='bg-dark-surface border-dark-border text-dark-text-primary'>
                        {TaskStatusEnum.options.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className='hover:!bg-dark-hover'
                          >
                            {status.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Tags</FormLabel>
                <div className='flex flex-wrap gap-1 mb-2'>
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant='secondary'
                      style={{ backgroundColor: tag.colorCode ?? undefined }}
                      className='flex items-center gap-1 pr-1 text-xs'
                    >
                      {tag.name}
                      <button
                        type='button'
                        onClick={() =>
                          setSelectedTags((prev) =>
                            prev.filter((t) => t.id !== tag.id)
                          )
                        }
                        className='ml-0.5 rounded-full hover:bg-black/20 p-0.5'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Popover
                  onOpenChange={(open) => {
                    if (!open) setIsCreatingTag(false);
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      className='w-full justify-start bg-dark-bg border-dark-border hover:bg-dark-hover'
                    >
                      <TagIconLucide className='mr-2 h-4 w-4 opacity-50' />{' '}
                      Add/Remove Tags...
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-[--radix-popover-trigger-width] p-0 bg-dark-surface border-dark-border'>
                    <Command shouldFilter={!isCreatingTag}>
                      <CommandInput
                        placeholder='Search or create tag...'
                        className='h-9'
                        onValueChange={setTagSearchQuery}
                        value={tagSearchQuery}
                        onFocus={() => setIsCreatingTag(false)}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {tagSearchQuery.trim() !== '' && (
                            <Button
                              variant='ghost'
                              size='sm'
                              className='w-full justify-start'
                              onClick={() => {
                                handleCreateNewTag();
                                setIsCreatingTag(true);
                              }}
                            >
                              <Plus className='mr-2 h-4 w-4' /> Create "
                              {tagSearchQuery.trim()}"
                            </Button>
                          )}
                          {tagSearchQuery.trim() === '' && 'No tags found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {availableTags.map((tag) => (
                            <CommandItem
                              key={tag.id}
                              value={tag.name}
                              onSelect={() => handleTagSelect(tag)}
                              className='hover:!bg-dark-hover'
                            >
                              <div
                                className='mr-2 h-3 w-3 rounded-sm border'
                                style={{
                                  backgroundColor:
                                    tag.colorCode ?? 'transparent',
                                }}
                              />
                              {tag.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormItem>
            </div>
            <DialogFooter className='pt-6 pr-2'>
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
                disabled={isLoading || createTagMutation.isLoading}
                className='bg-dark-accent hover:bg-purple-500 text-white'
              >
                {(isLoading || createTagMutation.isLoading) && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                {taskToEdit ? 'Save Changes' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
