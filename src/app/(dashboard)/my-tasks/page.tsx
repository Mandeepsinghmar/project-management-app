'use client';
import { api } from '~/trpc/react';
import { TaskListClient } from '~/components/tasks/TaskListClient';
import { CreateTaskDialog } from '~/components/tasks/CreateTaskDialog';
import { Button } from '~/components/ui/button';
import {
  PlusCircle,
  ListFilter,
  ArrowDownUp,
  LayoutList,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { type TaskStatus } from '@prisma/client';

export default function MyTasksPage() {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>(
    'createdAt'
  );

  const { data: tasksData, isLoading, refetch } = api.task.getAll.useQuery({});
  const tasks = tasksData ?? [];

  // const { data: allProjects } = api.project.getAll.useQuery();

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <LayoutList className='h-7 w-7 text-dark-accent' />
          <h1 className='text-2xl font-semibold text-dark-text-primary'>
            My tasks
          </h1>
        </div>
        <div className='flex items-center space-x-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='border-dark-border text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary'
              >
                <ListFilter className='mr-2 h-4 w-4' /> Filters{' '}
                {filterStatus !== 'ALL' ? `(${filterStatus})` : ''}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56 bg-dark-surface border-dark-border text-dark-text-primary'>
              <DropdownMenuRadioGroup
                value={filterStatus}
                onValueChange={(value) =>
                  setFilterStatus(value as TaskStatus | 'ALL')
                }
              >
                <DropdownMenuRadioItem
                  value='ALL'
                  className='hover:bg-dark-hover'
                >
                  All
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='TODO'
                  className='hover:bg-dark-hover'
                >
                  To Do
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='IN_PROGRESS'
                  className='hover:bg-dark-hover'
                >
                  In Progress
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='DONE'
                  className='hover:bg-dark-hover'
                >
                  Done
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='border-dark-border text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary'
              >
                <ArrowDownUp className='mr-2 h-4 w-4' /> Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56 bg-dark-surface border-dark-border text-dark-text-primary'>
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(value as 'dueDate' | 'priority' | 'createdAt')
                }
              >
                <DropdownMenuRadioItem
                  value='createdAt'
                  className='hover:bg-dark-hover'
                >
                  Creation Date
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='dueDate'
                  className='hover:bg-dark-hover'
                >
                  Due Date
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='priority'
                  className='hover:bg-dark-hover'
                >
                  Priority
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setCreateModalOpen(true)}
            className='bg-dark-accent hover:bg-purple-500 text-white'
          >
            <PlusCircle className='mr-2 h-4 w-4' /> Add task
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className='flex justify-center items-center py-10'>
          <Loader2 className='h-8 w-8 animate-spin text-dark-accent' />
        </div>
      )}
      {!isLoading && tasks && (
        <TaskListClient
          tasks={tasks as any}
          onTaskUpdate={refetch}
          projects={[]}
        />
      )}
      {!isLoading && (!tasks || tasks.length === 0) && (
        <div className='text-center py-10 text-dark-text-secondary'>
          <p>No tasks found. Create your first task!</p>
        </div>
      )}

      <CreateTaskDialog
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTaskCreated={refetch}
        projects={[]}
      />
    </div>
  );
}
