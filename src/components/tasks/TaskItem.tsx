'use client';
import {
  type Task as PrismaTask,
  type Project,
  type User,
  type Tag as PrismaTag,
  TaskStatus,
  TaskPriority,
} from '@prisma/client';
import {
  MoreHorizontal,
  Trash2,
  Edit3,
  CalendarDays,
  Tag as TagIcon,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Checkbox } from '~/components/ui/checkbox';
import { api } from '~/trpc/react';
import { toast } from 'sonner';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '~/lib/utils';
import Link from 'next/link';
import UserAvatar from '../UserAvatar';

type FullTask = PrismaTask & {
  project?: Pick<Project, 'id' | 'title'> | null;
  assignees: { user: Pick<User, 'id' | 'name' | 'image'> }[];
  tags: { tag: PrismaTag }[];
};

const priorityColors: Record<TaskPriority, string> = {
  LOW: 'bg-green-400 text-green-400 border-green-500',
  MEDIUM: 'bg-yellow-500 text-yellow-400 border-yellow-500',
  HIGH: 'bg-red-600 text-red-400 border-red-500',
};

interface TaskItemProps {
  task: FullTask;
  onTaskUpdate: () => void;
  onEditTask: (task: FullTask) => void;
}

const statusColors: Record<TaskStatus, string> = {
  TODO: 'text-blue-400',
  IN_PROGRESS: 'text-purple-400',
  DONE: 'text-green-400 line-through',
};

export default function TaskItem({
  task,
  onTaskUpdate,
  onEditTask,
}: TaskItemProps) {
  const utils = api.useUtils();

  const updateTaskMutation = api.task.update.useMutation({
    onSuccess: () => {
      toast.success('Task updated!');
      utils.user.getMyTasks.invalidate();
      if (task.projectId) {
        utils.project.getById.invalidate({ id: task.projectId });
      }
      utils.user.getDashboardStats.invalidate();
      utils.task.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });

  const deleteTaskMutation = api.task.delete.useMutation({
    onSuccess: () => {
      toast.success('Task deleted!');
      onTaskUpdate();
      utils.user.getMyTasks.invalidate();
      utils.project.getById.invalidate({ id: task.projectId });
    },
    onError: (error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });

  const handleToggleComplete = () => {
    const assigneeIds = task.assignees
      .map((a) => a.user.id)
      .filter((id) => typeof id === 'string' && id.length > 0);

    updateTaskMutation.mutate({
      id: task.id,
      title: task.title,
      projectId: task.projectId,
      status: task.status === 'DONE' ? 'TODO' : 'DONE',
      assigneeIds,
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate({ id: task.id });
    }
  };

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && task.status !== 'DONE';
  const isDueToday = dueDate && isToday(dueDate) && task.status !== 'DONE';

  return (
    <div className='flex items-center justify-between p-3 border-b border-dark-border last:border-b-0 hover:bg-dark-hover transition-colors group'>
      <div className='flex items-center space-x-3 flex-1 min-w-0'>
        <Checkbox
          id={`task-${task.id}-checkbox`}
          checked={task.status === 'DONE'}
          onCheckedChange={handleToggleComplete}
          className='border-dark-border data-[state=checked]:bg-dark-accent group-hover:border-dark-text-secondary data-[state=checked]:text-white'
          aria-label='Mark task as complete'
        />

        <span
          title={`Priority: ${task.priority}`}
          className={cn(
            'h-2.5 w-2.5 rounded-full flex-shrink-0',
            priorityColors[task.priority]
          )}
        />
        <div
          className='flex-1 min-w-0 cursor-pointer'
          onClick={() => onEditTask(task)}
        >
          <p
            className={cn(
              'text-sm font-medium text-dark-text-primary truncate',
              task.status === 'DONE' && 'line-through text-dark-text-secondary'
            )}
          >
            {task.title}
          </p>
          {task.description && (
            <p className='text-xs text-dark-text-secondary truncate '>
              {task.description}
            </p>
          )}
        </div>
        {task.tags && task.tags.length > 0 && (
          <div className='mt-1 flex flex-wrap gap-1'>
            {task.tags.slice(0, 3).map(({ tag }) => (
              <Badge
                key={tag.id}
                variant='outline'
                className='text-[10px] px-1.5 py-0.5 font-normal border bg-dark-bg'
                style={{
                  borderColor: tag.colorCode ? `${tag.colorCode}60` : undefined,
                  backgroundColor: tag.colorCode
                    ? `${tag.colorCode}20`
                    : 'bg-dark-bg',
                  color: tag.colorCode || undefined,
                }}
              >
                <TagIcon className='h-3 w-3 mr-1' />
                {tag.name}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge
                variant='outline'
                className='text-xs px-1.5 py-0.5 font-normal border-dark-border'
              >
                +{task.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>
      <div>
        <div className='flex items-center space-x-2 ml-4'>
          {task.assignees.length > 0 && (
            <div className=' -space-x-2 overflow-hidden hidden sm:flex'>
              {task.assignees.slice(0, 2).map((assignee) => (
                <UserAvatar
                  key={assignee.user.id}
                  user={assignee.user}
                  className='h-6 w-6 border border-dark-surface'
                />
              ))}
              {task.assignees.length > 2 && (
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-dark-bg border border-dark-surface text-xs text-dark-text-secondary'>
                  +{task.assignees.length - 2}
                </div>
              )}
            </div>
          )}
          {dueDate && (
            <Badge
              variant='outline'
              className={cn(
                'text-xs px-2 py-0.5 border-dark-border hidden sm:flex items-center',
                isOverdue
                  ? 'text-red-400 border-red-500/50 bg-red-500/10'
                  : isDueToday
                    ? 'text-green-400 border-green-500/50 bg-green-500/10'
                    : 'text-dark-text-secondary'
              )}
            >
              <CalendarDays className='h-3 w-3 mr-1' />
              {isOverdue && <AlertTriangle className='h-3 w-3 mr-1' />}
              {format(dueDate, 'MMM d')}
            </Badge>
          )}
          {task.project && (
            <Link href={`/projects/${task.project.id}`} legacyBehavior>
              <a onClick={(e) => e.stopPropagation()}>
                <Badge
                  variant='outline'
                  className='text-xs px-2 py-0.5 border-dark-border text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 hidden md:inline-flex'
                >
                  {task.project.title}
                </Badge>
              </a>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 text-dark-text-secondary hover:text-dark-text-primary opacity-0 group-hover:opacity-100 focus:opacity-100'
              >
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='bg-dark-surface border-dark-border text-dark-text-primary'
            >
              <DropdownMenuItem
                onClick={() => onEditTask(task)}
                className='hover:bg-dark-hover'
              >
                <Edit3 className='mr-2 h-4 w-4' /> Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator className='bg-dark-border' />
              <DropdownMenuItem
                onClick={handleDelete}
                className='text-red-400 hover:bg-dark-hover hover:text-red-300 focus:bg-red-500/10 focus:text-red-300'
              >
                <Trash2 className='mr-2 h-4 w-4' /> Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
