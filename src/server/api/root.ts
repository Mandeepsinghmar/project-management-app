import { taskRouter } from '~/server/api/routers/task';
import { projectRouter } from '~/server/api/routers/project';
import { userRouter } from '~/server/api/routers/user';
import { createTRPCRouter } from '~/server/api/trpc';

export const appRouter = createTRPCRouter({
  task: taskRouter,
  project: projectRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
