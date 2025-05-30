import {
  type Project as PrismaProject,
  type User as PrismaUser,
  type Task as PrismaTask,
  type Tag as PrismaTag,
} from '@prisma/client';

export type TaskInProject = PrismaTask & {
  assignees: { user: Pick<PrismaUser, 'id' | 'name' | 'image'> }[];
  tags: { tag: Pick<PrismaTag, 'id' | 'name' | 'colorCode'> }[];
};

export type ProjectMemberUser = Pick<
  PrismaUser,
  'id' | 'name' | 'email' | 'image'
>;

export type FullProjectDetails = PrismaProject & {
  createdBy: Pick<PrismaUser, 'id' | 'name' | 'image'>;
  tasks: TaskInProject[];
  projectUsers: { user: ProjectMemberUser }[];
  _count: {
    tasks: number;
    projectUsers: number;
  };
};
