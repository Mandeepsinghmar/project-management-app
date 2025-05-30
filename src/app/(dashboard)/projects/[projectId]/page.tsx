'use client';
import { useParams } from 'next/navigation';
import { api } from '~/trpc/react';
import { TaskListClient } from '~/components/tasks/TaskListClient';
import { CreateTaskDialog } from '~/components/tasks/CreateTaskDialog';
import { Button } from '~/components/ui/button';
import {
  PlusCircle,
  Loader2,
  Edit3,
  Users,
  Trash2,
  UserPlus,
  MoreHorizontal,
  ArrowLeft,
  BarChart3,
} from 'lucide-react';
import { useState } from 'react';
import UserAvatar from '~/components/UserAvatar';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { CreateProjectDialog } from '~/components/projects/CreateProjectDialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';
import { FullProjectDetails } from '~/types';

interface ManageMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: FullProjectDetails | any;
  onMembersUpdate: () => void;
}

function ManageMembersDialog({
  isOpen,
  onClose,
  project,
  onMembersUpdate,
}: ManageMembersDialogProps) {
  const utils = api.useUtils();
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const { data: usersNotInProject, isLoading: isLoadingPotentialMembers } =
    api.project.getUsersNotInProject.useQuery(
      { projectId: project.id },
      { enabled: isOpen }
    );

  const addUserMutation = api.project.addUserToProject.useMutation({
    onSuccess: () => {
      toast.success('User added to project!');
      onMembersUpdate();
      utils.project.getById.invalidate({ id: project.id });
      utils.project.getUsersNotInProject.invalidate({ projectId: project.id });
    },
    onError: (err) => toast.error(`Failed to add user: ${err.message}`),
  });

  const removeUserMutation = api.project.removeUserFromProject.useMutation({
    onSuccess: () => {
      toast.success('User removed from project!');
      onMembersUpdate();
      utils.project.getById.invalidate({ id: project.id });
      utils.project.getUsersNotInProject.invalidate({ projectId: project.id });
    },
    onError: (err) => toast.error(`Failed to remove user: ${err.message}`),
  });

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md bg-dark-surface border-dark-border text-dark-text-primary'>
        <DialogHeader>
          <DialogTitle>Manage Project Members</DialogTitle>
          <DialogDescription>
            Add or remove users from "{project.title}".
          </DialogDescription>
        </DialogHeader>
        <div className='py-2 space-y-4'>
          <div>
            <h3 className='text-sm font-medium mb-2'>Current Members:</h3>
            {project?.projectUsers.length > 0 ? (
              <ul className='space-y-2 max-h-40 overflow-y-auto'>
                {project.projectUsers.map(({ user }) => (
                  <li
                    key={user.id}
                    className='flex items-center justify-between p-2 bg-dark-bg rounded-md'
                  >
                    <div className='flex items-center'>
                      <UserAvatar user={user} className='h-6 w-6 mr-2' />
                      <span>
                        {user.name} {user.email}
                      </span>
                    </div>
                    {user.id !== project.createdById && (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-red-400 hover:text-red-300'
                        onClick={() =>
                          removeUserMutation.mutate({
                            projectId: project.id,
                            userId: user.id,
                          })
                        }
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-xs text-dark-text-secondary'>
                No members yet besides the creator.
              </p>
            )}
          </div>
          <div>
            <h3 className='text-sm font-medium mb-2'>Add New Member:</h3>
            <Command>
              <CommandInput
                placeholder='Search user to add...'
                className='h-9 bg-dark-bg border-dark-border'
                onValueChange={setUserSearchQuery}
                value={userSearchQuery}
              />
              <CommandList className='max-h-40'>
                {isLoadingPotentialMembers && (
                  <CommandItem>Loading...</CommandItem>
                )}
                <CommandEmpty>
                  No users found or all users are already members.
                </CommandEmpty>
                <CommandGroup>
                  {usersNotInProject?.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.name ?? user.id}
                      onSelect={() => {
                        addUserMutation.mutate({
                          projectId: project.id,
                          userId: user.id,
                        });
                        setUserSearchQuery('');
                      }}
                      className='hover:!bg-dark-hover'
                    >
                      <UserAvatar user={user} className='mr-2 h-5 w-5' />
                      {user.name}
                      <span className='text-xs text-dark-text-secondary ml-2'>
                        {user.email}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={onClose}
            className='border-dark-border text-dark-text-secondary hover:bg-dark-hover'
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [isCreateTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [isEditProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [isManageMembersModalOpen, setManageMembersModalOpen] = useState(false);

  const {
    data: project,
    isLoading,
    refetch: refetchProjectData,
    error,
  } = api.project.getById.useQuery({ id: projectId }, { enabled: !!projectId });

  const utils = api.useUtils();
  const deleteProjectMutation = api.project.delete.useMutation({
    onSuccess: () => {
      toast.success(`Project "${project?.title}" deleted.`);
      utils.project.getAll.invalidate();
      utils.project.getSidebarProjects.invalidate();
      router.push('/projects');
    },
    onError: (err) => {
      toast.error(`Failed to delete project: ${err.message}`);
    },
  });

  const handleDeleteProject = () => {
    if (
      project &&
      confirm(
        `Are you sure you want to delete the project "${project.title}"? This action cannot be undone.`
      )
    ) {
      deleteProjectMutation.mutate({ id: project.id });
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-full'>
        <Loader2 className='h-12 w-12 animate-spin text-dark-accent' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6 text-center text-red-400'>
        <p>Error loading project: {error.message}</p>
        <Link
          href='/projects'
          className='text-dark-accent hover:underline mt-4 inline-block'
        >
          Go back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className='p-6 text-center text-dark-text-secondary'>
        <p>Project not found or you do not have access.</p>
        <Link
          href='/projects'
          className='text-dark-accent hover:underline mt-4 inline-block'
        >
          Go back to Projects
        </Link>
      </div>
    );
  }

  const tasks = project.tasks ?? [];
  const members = project.projectUsers.map((pu) => pu.user) ?? [];
  const projectOwner = project.createdBy;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Link
            href='/projects'
            className='text-dark-text-secondary hover:text-dark-text-primary'
          >
            <ArrowLeft className='h-5 w-5' />
          </Link>
          <div className='flex items-center space-x-2'>
            <div className='p-2.5 bg-pink-500/20 rounded-md'>
              <BarChart3 className='h-5 w-5 text-pink-400' />
            </div>
            <h1 className='text-2xl font-semibold text-dark-text-primary'>
              {project.title}
            </h1>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <div className='flex -space-x-2 overflow-hidden'>
            {members.slice(0, 3).map((member) => (
              <UserAvatar
                key={member.id}
                user={member}
                className='h-8 w-8 border-2 border-dark-surface'
              />
            ))}
            {members.length > 3 && (
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-dark-bg border-2 border-dark-surface text-xs text-dark-text-secondary'>
                +{members.length - 3}
              </div>
            )}
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setManageMembersModalOpen(true)}
            className='border-dark-border text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary'
          >
            <Users className='mr-2 h-4 w-4' /> Share
          </Button>
          <Button
            onClick={() => setCreateTaskModalOpen(true)}
            className='bg-dark-accent hover:bg-purple-500 text-white'
          >
            <PlusCircle className='mr-2 h-4 w-4' /> Add task
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='text-dark-text-secondary hover:text-dark-text-primary'
              >
                <MoreHorizontal className='h-5 w-5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='bg-dark-surface border-dark-border text-dark-text-primary'
            >
              <DropdownMenuItem
                onClick={() => setEditProjectModalOpen(true)}
                className='hover:!bg-dark-hover'
              >
                <Edit3 className='mr-2 h-4 w-4' /> Edit Project Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setManageMembersModalOpen(true)}
                className='hover:!bg-dark-hover'
              >
                <UserPlus className='mr-2 h-4 w-4' /> Manage Members
              </DropdownMenuItem>

              <DropdownMenuSeparator className='bg-dark-border' />
              <DropdownMenuItem
                onClick={handleDeleteProject}
                className='text-red-400 hover:!bg-dark-hover hover:!text-red-300 focus:!bg-red-500/10 focus:!text-red-300'
              >
                <Trash2 className='mr-2 h-4 w-4' /> Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {project.description && (
        <p className='text-sm text-dark-text-secondary max-w-2xl'>
          {project.description}
        </p>
      )}

      <div className='border-b border-dark-border'>
        <nav className='-mb-px flex space-x-6' aria-label='Tabs'>
          <button className='whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-dark-accent border-dark-accent'>
            List
          </button>
        </nav>
      </div>

      <TaskListClient
        tasks={tasks as any}
        onTaskUpdate={refetchProjectData}
        projects={[{ id: project.id, title: project.title }]}
        projectId={project.id}
        hideProjectSelector={true}
      />
      {!isLoading && tasks.length === 0 && (
        <div className='text-center py-10 text-dark-text-secondary'>
          <p>This project has no tasks yet.</p>
          <Button
            variant='link'
            onClick={() => setCreateTaskModalOpen(true)}
            className='text-dark-accent'
          >
            Add the first task
          </Button>
        </div>
      )}

      <CreateTaskDialog
        isOpen={isCreateTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        onTaskCreated={refetchProjectData}
        projects={[{ id: project.id, title: project.title }]}
        defaultProjectId={project.id}
        hideProjectSelector={true}
      />
      <CreateProjectDialog
        isOpen={isEditProjectModalOpen}
        onClose={() => setEditProjectModalOpen(false)}
        onProjectCreated={refetchProjectData}
        projectToEdit={project}
      />
      <ManageMembersDialog
        isOpen={isManageMembersModalOpen}
        onClose={() => setManageMembersModalOpen(false)}
        project={project}
        onMembersUpdate={refetchProjectData}
      />
    </div>
  );
}
