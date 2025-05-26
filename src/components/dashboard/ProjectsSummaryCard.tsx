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
  Briefcase,
  Loader2,
  PlusCircle,
  MoreHorizontal,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { CreateProjectDialog } from '~/components/projects/CreateProjectDialog';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

export function ProjectsSummaryCard() {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const {
    data: projects,
    isLoading,
    refetch,
  } = api.project.getAll.useQuery(undefined, {});

  const recentProjects = projects?.slice(0, 3) ?? [];

  return (
    <Card className='bg-dark-surface border-dark-border flex flex-col'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center space-x-2'>
          <div className='p-2 bg-blue-500/20 rounded-md'>
            <Briefcase className='h-5 w-5 text-blue-400' />
          </div>
          <CardTitle className='text-lg font-semibold text-dark-text-primary'>
            Projects
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
              onClick={() => setCreateModalOpen(true)}
              className='hover:!bg-dark-hover'
            >
              <PlusCircle className='mr-2 h-4 w-4' /> Create project
            </DropdownMenuItem>
            <Link href='/projects'>
              <DropdownMenuItem className='hover:!bg-dark-hover'>
                <ArrowRight className='mr-2 h-4 w-4' /> View all projects
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
        {!isLoading && recentProjects.length > 0 && (
          <div className='space-y-3'>
            <div className='pb-2 border-b border-dark-border'>
              <nav className='flex space-x-4' aria-label='Project tabs'>
                <button className='px-2 py-1 text-sm font-medium text-dark-accent border-b-2 border-dark-accent'>
                  Recents
                </button>
              </nav>
            </div>
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className='block p-3 rounded-md hover:bg-dark-hover transition-colors -mx-3'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <div
                      className={`h-3 w-3 rounded-full ${project.id.endsWith('a') || project.id.endsWith('1') ? 'bg-pink-400' : project.id.endsWith('b') || project.id.endsWith('2') ? 'bg-purple-400' : 'bg-teal-400'}`}
                    ></div>
                    <span className='text-sm font-medium text-dark-text-primary'>
                      {project.title}
                    </span>
                  </div>
                  <span className='text-xs text-dark-text-secondary'>
                    {project._count.tasks} tasks
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!isLoading && recentProjects.length === 0 && (
          <p className='text-sm text-dark-text-secondary text-center py-4'>
            No projects yet. Get started by creating one!
          </p>
        )}
      </CardContent>
      <CardFooter className='border-t border-dark-border pt-3'>
        <Button
          variant='ghost'
          className='w-full justify-start text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-hover pl-1'
          onClick={() => setCreateModalOpen(true)}
        >
          <PlusCircle className='mr-2 h-4 w-4' /> Create project
        </Button>
      </CardFooter>
      <CreateProjectDialog
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onProjectCreated={refetch}
      />
    </Card>
  );
}
