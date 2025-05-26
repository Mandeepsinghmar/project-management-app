import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { createTaskSchema, updateTaskSchema } from '~/lib/validators';
import { Prisma } from '@prisma/client';

export const taskRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ projectId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.projectId) {
        return ctx.db.task.findMany({
          where: { projectId: input.projectId },
          orderBy: { createdAt: 'desc' },
          include: {
            project: { select: { id: true, title: true } },
            tags: { include: { tag: true } },
            assignees: {
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
            },
          },
        });
      } else {
        return ctx.db.task.findMany({
          where: {
            OR: [
              { assignees: { some: { userId: ctx.session.user.id } } },
              { projectId: null },
            ],
          },
          orderBy: { createdAt: 'desc' },
          include: {
            project: { select: { id: true, title: true } },
            tags: { include: { tag: true } },
            assignees: {
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
            },
          },
        });
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.db.task.findUnique({
        where: { id: input.id },
        include: {
          assignees: { include: { user: true } },
          project: true,
          tags: { include: { tag: true } },
        },
      });
      if (!task) throw new Error('Task not found');
      return task;
    }),

  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        title,
        description,
        projectId: processedProjectId,
        dueDate,
        status,
        priority,
        tags,
        assigneeIds: inputAssigneeIds,
      } = input;
      const finalAssigneeIds =
        inputAssigneeIds && inputAssigneeIds.length > 0
          ? inputAssigneeIds
          : [ctx.session.user.id];

      const taskCreateData: Prisma.TaskUncheckedCreateInput = {
        title: title,
        ...(description !== undefined && { description: description }),
        ...(processedProjectId !== undefined && {
          projectId: processedProjectId,
        }),
        ...(dueDate !== undefined && { dueDate: dueDate }),
        ...(status !== undefined && { status: status }),
        ...(priority !== undefined && { priority: priority }),
      };

      const task = await ctx.db.task.create({
        data: taskCreateData,
      });

      if (finalAssigneeIds.length > 0) {
        await ctx.db.taskUser.createMany({
          data: finalAssigneeIds.map((userId) => ({ taskId: task.id, userId })),
          skipDuplicates: true,
        });
      }

      if (tags && tags.length > 0) {
        await ctx.db.taskTag.createMany({
          data: tags.map((tag) => ({ taskId: task.id, tagId: tag.id })),
          skipDuplicates: true,
        });
      }
      return task;
    }),

  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, tags, assigneeIds, ...taskData } = input;
      const updatedTask = await ctx.db.task.update({
        where: { id },
        data: {
          ...taskData,
          projectId: taskData.projectId === '' ? null : taskData.projectId,
        },
      });

      if (assigneeIds !== undefined) {
        await ctx.db.taskUser.deleteMany({ where: { taskId: id } });
        if (assigneeIds.length > 0) {
          await ctx.db.taskUser.createMany({
            data: assigneeIds.map((userId) => ({ taskId: id, userId })),
            skipDuplicates: true,
          });
        }
      }

      if (tags !== undefined) {
        await ctx.db.taskTag.deleteMany({ where: { taskId: id } });
        if (tags.length > 0) {
          await ctx.db.taskTag.createMany({
            data: tags.map((tag) => ({ taskId: id, tagId: tag.id })),
            skipDuplicates: true,
          });
        }
      }
      return updatedTask;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.delete({ where: { id: input.id } });
    }),

  getAllTags: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.tag.findMany();
  }),

  createTag: protectedProcedure
    .input(
      z.object({ name: z.string().min(1), colorCode: z.string().optional() })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.tag.create({
          data: {
            name: input.name,
            colorCode: input.colorCode,
          },
        });
      } catch (e: any) {
        if (e.code === 'P2002' && e.meta?.target?.includes('name')) {
          throw new Error('A tag with this name already exists.');
        }
        throw new Error('Failed to create tag.');
      }
    }),
});
