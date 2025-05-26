'use client';
import Link from 'next/link';
import {
  Home,
  CheckSquare,
  Folder,
  PlusCircle,
  LayoutList,
  BarChartHorizontal,
  Briefcase,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useState } from 'react';
import { CreateTaskDialog } from '~/components/tasks/CreateTaskDialog';
import { CreateProjectDialog } from '~/components/projects/CreateProjectDialog';

const mainNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/my-tasks', label: 'My tasks', icon: CheckSquare },
  { href: '/projects', label: 'My projects', icon: Briefcase },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: projects, refetch: refetchProjects } =
    api.project.getSidebarProjects.useQuery();
  const utils = api.useUtils();

  const [isCreateTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setCreateProjectModalOpen] = useState(false);

  const handleTaskCreated = () => {
    setCreateTaskModalOpen(false);
  };

  const handleProjectCreated = () => {
    refetchProjects();
    utils.project.getAll.invalidate();
    setCreateProjectModalOpen(false);
  };

  return (
    <div className='flex h-full w-64 flex-col border-r border-dark-border bg-dark-surface p-4 space-y-4'>
      <div className='flex items-center space-x-2 mb-6'>
        <svg
          viewBox='0 0 100 100'
          className='h-8 w-8 fill-current text-dark-accent '
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
        <span className='text-xl font-semibold text-dark-text-primary'>
          Manox
        </span>{' '}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='default'
            className='w-full bg-dark-accent hover:bg-purple-500 text-white'
          >
            <PlusCircle className='mr-2 h-4 w-4' /> Create
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56 bg-dark-surface border-dark-border text-dark-text-primary'>
          <DropdownMenuItem
            className='hover:!bg-dark-hover'
            onSelect={() => setCreateTaskModalOpen(true)}
          >
            <LayoutList className='mr-2 h-4 w-4' /> Task
          </DropdownMenuItem>
          <DropdownMenuItem
            className='hover:!bg-dark-hover'
            onSelect={() => setCreateProjectModalOpen(true)}
          >
            <Folder className='mr-2 h-4 w-4' /> Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <nav className='space-y-1'>
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center rounded-md px-3 py-2 text-sm font-medium text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary',
              pathname === item.href && 'bg-dark-hover text-dark-text-primary'
            )}
          >
            <item.icon className='mr-3 h-5 w-5' />
            {item.label}
          </Link>
        ))}
        <div
          className={cn(
            'flex items-center rounded-md px-3 py-2 text-sm font-medium text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary'
          )}
        >
          <BarChartHorizontal className='mr-3 h-5 w-5' />
          Insights
        </div>
      </nav>

      <div className='pt-4 flex-grow overflow-y-auto'>
        <div className='flex justify-between items-center mb-2'>
          <h2 className='text-xs font-semibold uppercase text-dark-text-secondary'>
            Projects
          </h2>
          <Button
            variant='ghost'
            size='sm'
            className='text-dark-text-secondary hover:text-dark-text-primary'
            onClick={() => setCreateProjectModalOpen(true)}
          >
            <PlusCircle className='h-4 w-4' />
          </Button>
        </div>
        <nav className='space-y-1'>
          {projects?.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary truncate', // Added truncate
                pathname === `/projects/${project.id}` &&
                  'bg-dark-hover text-dark-text-primary'
              )}
            >
              <Folder className='mr-3 h-5 w-5 flex-shrink-0 text-pink-400' />
              <span className='truncate'>{project.title}</span>
            </Link>
          ))}
          {(!projects || projects.length === 0) && (
            <p className='px-3 py-2 text-sm text-dark-text-secondary italic'>
              No projects yet.
            </p>
          )}
        </nav>
      </div>

      <CreateTaskDialog
        isOpen={isCreateTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        projects={[]}
      />
      <CreateProjectDialog
        isOpen={isCreateProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
