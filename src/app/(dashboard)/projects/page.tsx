'use client';
import { useState } from 'react';
import { api } from '~/trpc/react';
import {
  FullProject,
  ProjectListClient,
} from '~/components/projects/ProjectListClient';
import { CreateProjectDialog } from '~/components/projects/CreateProjectDialog';
import { Button } from '~/components/ui/button';
import { PlusCircle, Loader2, LayoutGrid } from 'lucide-react';

export default function ProjectsPage() {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const { data: projects, isLoading, refetch } = api.project.getAll.useQuery();

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <LayoutGrid className='h-7 w-7 text-dark-accent' />
          <h1 className='text-2xl font-semibold text-dark-text-primary'>
            Projects
          </h1>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className='bg-dark-accent hover:bg-purple-500 text-white'
        >
          <PlusCircle className='mr-2 h-4 w-4' /> Create Project
        </Button>
      </div>

      {isLoading && (
        <div className='flex justify-center items-center py-10'>
          <Loader2 className='h-8 w-8 animate-spin text-dark-accent' />
        </div>
      )}
      {!isLoading && projects && (
        <ProjectListClient projects={projects} onProjectUpdate={refetch} />
      )}
      {!isLoading && (!projects || projects.length === 0) && (
        <div className='text-center py-10 text-dark-text-secondary'>
          <p>No projects found. Create your first project!</p>
        </div>
      )}

      <CreateProjectDialog
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onProjectCreated={refetch}
      />
    </div>
  );
}
