import { type Task, type Project, type User, type Tag } from '@prisma/client';

export type DetailedTask = Task & {
  project: Pick<Project, 'id' | 'title'>;
  assignedTo?: Pick<User, 'id' | 'name' | 'image'> | null;
  tags: { tag: Tag }[];
};

export type DetailedProject = Project & {
  createdBy: Pick<User, 'id' | 'name' | 'image'>;
  tasks: DetailedTask[];
  projectUsers: {
    user: Pick<User, 'id' | 'name' | 'image' | 'email'>;
    assignedAt: Date;
  }[];
  _count: {
    tasks: number;
    projectUsers: number;
  };
};

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  description?: string;
}
