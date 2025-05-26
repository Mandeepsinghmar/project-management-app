import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { createProjectSchema, updateProjectSchema } from '~/lib/validators';
import { TRPCError } from '@trpc/server';
import { FullProject } from '~/components/projects/ProjectListClient';

export const projectRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }): Promise<FullProject[]> => {
    return ctx.db.project.findMany({
      where: {
        OR: [
          { createdById: ctx.session.user.id },
          { projectUsers: { some: { userId: ctx.session.user.id } } },
        ],
      },
      select: {
        id: true,
        title: true, 
        description: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            projectUsers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  getSidebarProjects: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      where: {
        OR: [
          { createdById: ctx.session.user.id },
          { projectUsers: { some: { userId: ctx.session.user.id } } },
        ],
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: { title: 'asc' },
      take: 10,
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.id,
          OR: [
            { createdById: ctx.session.user.id },
            { projectUsers: { some: { userId: ctx.session.user.id } } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdById: true,
          createdAt: true,
          updatedAt: true,
          createdBy: { select: { id: true, name: true, image: true } },
          _count: { select: { tasks: true, projectUsers: true } },
          tasks: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              title: true,
              status: true,
              dueDate: true,
              priority: true,
              projectId: true,
              assignees: {
                select: {
                  user: { select: { id: true, name: true, image: true } },
                },
              },
              tags: { include: { tag: true } },
            },
          },
          projectUsers: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found or access denied.',
        });
      }
      return project;
    }),

  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          title: input.title,
          description: input.description,
          createdById: ctx.session.user.id,
        },
      });
      await ctx.db.projectUser.create({
        data: {
          projectId: project.id,
          userId: ctx.session.user.id,
        },
      });
      return project;
    }),

  update: protectedProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...projectData } = input;
      const existingProject = await ctx.db.project.findFirst({
        where: { id, createdById: ctx.session.user.id },
      });
      if (!existingProject) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot update this project.',
        });
      }
      return ctx.db.project.update({
        where: { id },
        data: projectData,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.id, createdById: ctx.session.user.id },
      });
      if (!project) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot delete this project.',
        });
      }
      return ctx.db.project.delete({ where: { id: input.id } });
    }),

  addUserToProject: protectedProcedure
    .input(
      z.object({ projectId: z.string().uuid(), userId: z.string().uuid() })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, createdById: ctx.session.user.id },
      });
      if (!project) throw new TRPCError({ code: 'FORBIDDEN' });

      return ctx.db.projectUser.create({
        data: {
          projectId: input.projectId,
          userId: input.userId,
        },
      });
    }),

  removeUserFromProject: protectedProcedure
    .input(
      z.object({ projectId: z.string().uuid(), userId: z.string().uuid() })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, createdById: ctx.session.user.id },
      });
      if (!project) throw new TRPCError({ code: 'FORBIDDEN' });
      if (
        input.userId === ctx.session.user.id &&
        project.createdById === ctx.session.user.id
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Project creator cannot be removed.',
        });
      }

      return ctx.db.projectUser.delete({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: input.userId,
          },
        },
      });
    }),

  getUsersNotInProject: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const projectUsers = await ctx.db.projectUser.findMany({
        where: { projectId: input.projectId },
        select: { userId: true },
      });
      const userIdsInProject = projectUsers.map((pu) => pu.userId);

      return ctx.db.user.findMany({
        where: {
          id: { notIn: userIdsInProject },
        },
        select: { id: true, name: true, email: true, image: true },
        orderBy: { name: 'asc' },
      });
    }),
});
