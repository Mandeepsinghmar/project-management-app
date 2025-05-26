'use client';
import { api } from '~/trpc/react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import {
  CheckSquare,
  Loader2,
  PlusCircle,
  MoreHorizontal,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import TaskItem from '~/components/tasks/TaskItem';
import { CreateTaskDialog } from '~/components/tasks/CreateTaskDialog';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { type Task, type Project, type Tag, type User } from '@prisma/client';

type FullTask = Task & {
  project: Pick<Project, 'id' | 'title'>;
  assignedTo?: Pick<User, 'id' | 'name' | 'image'> | null;
  tags: { tag: Tag }[];
};

export function MyTasksSummaryCard() {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<FullTask | null>(null);

  const {
    data: tasks,
    isLoading,
    refetch,
  } = api.user.getMyTasks.useQuery({ sortBy: 'createdAt', sortOrder: 'desc' });

  const upcomingTasks =
    tasks?.filter((task) => task.status !== 'DONE').slice(0, 3) ?? [];

  const handleEditTask = (task: FullTask) => {
    setEditingTask(task);
    setCreateModalOpen(true);
  };

  return (
    <Card className='bg-dark-surface border-dark-border flex flex-col'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center space-x-2'>
          <div className='p-2 bg-green-500/20 rounded-md'>
            <CheckSquare className='h-5 w-5 text-green-400' />
          </div>
          <CardTitle className='text-lg font-semibold text-dark-text-primary'>
            My tasks
          </CardTitle>
        </div>
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
              onClick={() => {
                setEditingTask(null);
                setCreateModalOpen(true);
              }}
              className='hover:!bg-dark-hover'
            >
              <PlusCircle className='mr-2 h-4 w-4' /> Add task
            </DropdownMenuItem>
            <Link href='/my-tasks'>
              <DropdownMenuItem className='hover:!bg-dark-hover'>
                <ArrowRight className='mr-2 h-4 w-4' /> View all tasks
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className='flex-grow'>
        {isLoading && (
          <div className='flex justify-center py-4'>
            <Loader2 className='h-6 w-6 animate-spin text-dark-accent' />
          </div>
        )}
        {!isLoading && upcomingTasks.length > 0 && (
          <div className='space-y-px -mx-3'>
            <div className='px-3 pb-2 border-b border-dark-border'>
              <nav className='flex space-x-4' aria-label='Task tabs'>
                <button className='px-2 py-1 text-sm font-medium text-dark-accent border-b-2 border-dark-accent'>
                  Upcoming
                </button>
              </nav>
            </div>
            {upcomingTasks.map((task: any) => (
              <TaskItem
                key={task.id}
                task={task}
                onTaskUpdate={refetch}
                onEditTask={() => handleEditTask(task)}
              />
            ))}
          </div>
        )}
        {!isLoading && upcomingTasks.length === 0 && (
          <p className='text-sm text-dark-text-secondary text-center py-4'>
            No upcoming tasks. Looks clear!
          </p>
        )}
      </CardContent>
      <CardFooter className='border-t border-dark-border pt-3'>
        <Button
          variant='ghost'
          className='w-full justify-start text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-hover pl-1'
          onClick={() => {
            setEditingTask(null);
            setCreateModalOpen(true);
          }}
        >
          <PlusCircle className='mr-2 h-4 w-4' /> Create task
        </Button>
      </CardFooter>
      <CreateTaskDialog
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTaskCreated={refetch}
        projects={[]}
        taskToEdit={editingTask ?? undefined}
      />
    </Card>
  );
}
