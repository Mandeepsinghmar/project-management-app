'use client';
import { type Task, type Project, type Tag, type User } from '@prisma/client';
import TaskItem from './TaskItem';
import { useState } from 'react';
import { CreateTaskDialog } from './CreateTaskDialog';
import { PlusCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';

type FullTask = Task & {
  project?: Project | null;
  assignees: { user: User }[];
  tags: { tag: Tag }[];
};

interface TaskListClientProps {
  tasks: FullTask[];
  onTaskUpdate: () => void;
  projects: Pick<Project, 'id' | 'title'>[];
  projectId?: string;
  hideProjectSelector: boolean;
}

const SECTIONS = {
  OVERDUE: 'Overdue',
  TODAY: 'Due today',
  UPCOMING: 'Upcoming',
  LATER: 'Later',
  COMPLETED: 'Completed',
  INPROGRESS: 'In progress',
};

export function TaskListClient({
  tasks,
  onTaskUpdate,
  // projects,
  projectId,
  hideProjectSelector,
}: TaskListClientProps) {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<FullTask | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const categorizedTasks: Record<string, FullTask[]> = {
    [SECTIONS.OVERDUE]: [],
    [SECTIONS.TODAY]: [],
    [SECTIONS.UPCOMING]: [],
    [SECTIONS.LATER]: [],
    [SECTIONS.COMPLETED]: [],
    [SECTIONS.INPROGRESS]: [],
  };

  tasks.forEach((task) => {
    if (task.status === 'DONE') {
      categorizedTasks[SECTIONS.COMPLETED].push(task);
    } else if (task.status === 'IN_PROGRESS') {
      categorizedTasks[SECTIONS.INPROGRESS].push(task);
    } else if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        categorizedTasks[SECTIONS.OVERDUE].push(task);
      } else if (dueDate.getTime() === today.getTime()) {
        categorizedTasks[SECTIONS.TODAY].push(task);
      } else {
        categorizedTasks[SECTIONS.UPCOMING].push(task);
      }
    } else {
      categorizedTasks[SECTIONS.LATER].push(task);
    }
  });

  const handleEditTask = (task: FullTask) => {
    setEditingTask(task);
    setCreateModalOpen(true);
  };

  const handleTaskCreatedOrUpdated = () => {
    setEditingTask(null);
    onTaskUpdate();
  };

  const closeDialog = () => {
    setEditingTask(null);
    setCreateModalOpen(false);
  };

  return (
    <div className='space-y-6'>
      {Object.entries(categorizedTasks).map(([sectionTitle, sectionTasks]) => {
        if (sectionTasks.length === 0 && sectionTitle !== SECTIONS.LATER)
          return null;

        return (
          <div key={sectionTitle}>
            <h2 className='text-lg font-medium text-dark-text-primary mb-2 sticky top-0 bg-dark-bg py-1'>
              {sectionTitle}{' '}
              <span className='text-sm text-dark-text-secondary'>
                ({sectionTasks.length})
              </span>
            </h2>
            {sectionTasks.length > 0 ? (
              <div className='space-y-px bg-dark-surface rounded-md'>
                {sectionTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onTaskUpdate={onTaskUpdate}
                    onEditTask={() => handleEditTask(task)}
                  />
                ))}
              </div>
            ) : (
              <p className='text-sm text-dark-text-secondary italic ml-1'>
                No tasks in this section.
              </p>
            )}
            {(sectionTitle === SECTIONS.LATER || projectId) && (
              <Button
                variant='ghost'
                className='mt-2 w-full justify-start text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-hover pl-1'
                onClick={() => {
                  setEditingTask(null);
                  setCreateModalOpen(true);
                }}
              >
                <PlusCircle className='mr-2 h-4 w-4' /> Add task...
              </Button>
            )}
          </div>
        );
      })}
      <CreateTaskDialog
        isOpen={isCreateModalOpen}
        onClose={closeDialog}
        onTaskCreated={handleTaskCreatedOrUpdated}
        projects={[]}
        taskToEdit={editingTask ?? undefined}
        defaultProjectId={projectId}
        hideProjectSelector={hideProjectSelector}
      />
    </div>
  );
}
