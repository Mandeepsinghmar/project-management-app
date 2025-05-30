'use client';
import { type Project, type User } from '@prisma/client';
import ProjectCard from './ProjectCard';
import { useState } from 'react';
import { CreateProjectDialog } from './CreateProjectDialog';

export type FullProject = Project & {
  createdBy: Pick<User, 'id' | 'name' | 'image'>;
  _count: { tasks: number; projectUsers: number };
};

interface ProjectListClientProps {
  projects: FullProject[] | any;
  onProjectUpdate: () => void;
}

export function ProjectListClient({
  projects,
  onProjectUpdate,
}: ProjectListClientProps) {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setCreateModalOpen(true);
  };

  const handleProjectCreatedOrUpdated = () => {
    setEditingProject(null);
    onProjectUpdate();
  };

  const closeDialog = () => {
    setEditingProject(null);
    setCreateModalOpen(false);
  };

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={() => handleEditProject(project)}
            onDeleteSuccess={onProjectUpdate}
          />
        ))}
      </div>
      <CreateProjectDialog
        isOpen={isCreateModalOpen}
        onClose={closeDialog}
        onProjectCreated={handleProjectCreatedOrUpdated}
        projectToEdit={editingProject ?? undefined}
      />
    </>
  );
}
