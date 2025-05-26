'use client';
import Link from 'next/link';
import { type Project, type User } from '@prisma/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import {
  MoreHorizontal,
  Users,
  CheckSquare,
  Trash2,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { api } from '~/trpc/react';
import { toast } from 'sonner';
import UserAvatar from '../UserAvatar';

type FullProject = Project & {
  createdBy: Pick<User, 'id' | 'name' | 'image'>;
  _count: { tasks: number; projectUsers: number };
};

interface ProjectCardProps {
  project: FullProject;
  onEdit: (project: Project) => void;
  onDeleteSuccess: () => void;
}

export default function ProjectCard({
  project,
  onEdit,
  onDeleteSuccess,
}: ProjectCardProps) {
  const utils = api.useUtils();
  const deleteProjectMutation = api.project.delete.useMutation({
    onSuccess: () => {
      toast.success(`Project "${project.title}" deleted.`);
      onDeleteSuccess();
      utils.project.getAll.invalidate();
      utils.project.getSidebarProjects.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete the project "${project.title}"? This action cannot be undone.`
      )
    ) {
      deleteProjectMutation.mutate({ id: project.id });
    }
  };

  return (
    <Card className='flex flex-col bg-dark-surface border-dark-border hover:shadow-lg transition-shadow duration-200'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <Link href={`/projects/${project.id}`} className='group'>
            <CardTitle className='text-lg font-semibold text-dark-text-primary group-hover:text-dark-accent transition-colors'>
              {project.title}
            </CardTitle>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-dark-text-secondary hover:text-dark-text-primary'
              >
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='bg-dark-surface border-dark-border text-dark-text-primary'
            >
              <DropdownMenuItem
                onClick={() => onEdit(project)}
                className='hover:!bg-dark-hover'
              >
                <Edit3 className='mr-2 h-4 w-4' /> Edit Project
              </DropdownMenuItem>
              <Link href={`/projects/${project.id}`}>
                <DropdownMenuItem className='hover:!bg-dark-hover'>
                  <ExternalLink className='mr-2 h-4 w-4' /> View Project
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className='bg-dark-border' />
              <DropdownMenuItem
                onClick={handleDelete}
                className='text-red-400 hover:!bg-dark-hover hover:!text-red-300 focus:!bg-red-500/10 focus:!text-red-300'
              >
                <Trash2 className='mr-2 h-4 w-4' /> Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className='text-xs text-dark-text-secondary pt-1 line-clamp-2'>
          {project.description || 'No description provided.'}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-grow pb-4'>
        <div className='flex items-center space-x-4 text-sm text-dark-text-secondary'>
          <div className='flex items-center'>
            <CheckSquare className='h-4 w-4 mr-1.5 text-blue-400' />
            <span>{project._count.tasks} Tasks</span>
          </div>
          <div className='flex items-center'>
            <Users className='h-4 w-4 mr-1.5 text-green-400' />
            <span>{project._count.projectUsers} Members</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className='flex items-center justify-between text-xs text-dark-text-secondary border-t border-dark-border pt-3'>
        <div className='flex items-center'>
          <span className='mr-1'>By:</span>
          <UserAvatar user={project.createdBy} className='h-5 w-5 mr-1' />
          <span className='font-medium text-dark-text-primary'>
            {project.createdBy.name}
          </span>
        </div>
        <span>
          {formatDistanceToNow(new Date(project.createdAt), {
            addSuffix: true,
          })}
        </span>
      </CardFooter>
    </Card>
  );
}
