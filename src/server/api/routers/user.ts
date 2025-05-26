import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc';
import { updateUserProfileSchema, signUpSchema } from '~/lib/validators';
import { TRPCError } from '@trpc/server';

import { db } from '~/server/db';
import { supabaseAdmin } from '~/lib/supabaseAdmin';

export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });
    }
    return user;
  }),

  updateProfile: protectedProcedure
    .input(updateUserProfileSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          image: input.image,
        },
      });
    }),

  searchUsers: protectedProcedure
    .input(z.object({ query: z.string().min(1).optional() }))
    .query(async ({ ctx, input }) => {
      if (!input.query) return [];
      return ctx.db.user.findMany({
        where: {
          OR: [
            { name: { contains: input.query, mode: 'insensitive' } },
            { email: { contains: input.query, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, email: true, image: true },
        take: 10,
      });
    }),

  getMyTasks: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
          sortBy: z
            .enum(['dueDate', 'priority', 'createdAt'])
            .optional()
            .default('createdAt'),
          sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.task.findMany({
        where: {
          assignees: {
            some: {
              userId: ctx.session.user.id,
            },
          },
          ...(input?.status && { status: input.status }),
        },
        include: {
          project: { select: { id: true, title: true } },
          tags: { include: { tag: true } },
          assignees: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          },
        },
        orderBy: {
          [input?.sortBy ?? 'createdAt']: input?.sortOrder ?? 'desc',
        },
      });
    }),

  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
    const { email, password, name } = input;

    const { data: supabaseUserData, error: supabaseError } =
      await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

    if (supabaseError) {
      if (supabaseError.message.includes('User already registered')) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A user with this email already exists.',
        });
      }
      console.error('Supabase sign up error:', supabaseError.message);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          supabaseError.message ||
          'Failed to create user account with Supabase.',
      });
    }

    if (!supabaseUserData.user) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'User was not created by Supabase, but no error was thrown.',
      });
    }

    try {
      const newUserInPrisma = await db.user.create({
        data: {
          id: supabaseUserData.user.id,
          email: supabaseUserData.user.email!,
          name: name || supabaseUserData.user.email!.split('@')[0],
          emailVerified: supabaseUserData.user.email_confirmed_at
            ? new Date(supabaseUserData.user.email_confirmed_at)
            : null,
        },
      });

      return {
        success: true,
        message: supabaseUserData.user.email_confirmed_at
          ? 'Account created successfully! Please sign in.'
          : 'Account created successfully! Please check your email to confirm your account.',
        userId: newUserInPrisma.id,
        emailConfirmed: !!supabaseUserData.user.email_confirmed_at,
      };
    } catch (prismaError: any) {
      console.error(
        'Prisma user creation error after Supabase sign up:',
        prismaError
      );

      const targetError = (prismaError.meta?.target as string[]) ?? [];
      if (prismaError.code === 'P2002' && targetError.includes('email')) {
        throw new TRPCError({
          code: 'CONFLICT',
          message:
            'A user profile with this email already exists in our system.',
        });
      }
      if (prismaError.code === 'P2002' && targetError.includes('PRIMARY')) {
        console.warn(
          `Prisma user with ID ${supabaseUserData.user.id} already exists.`
        );
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'User profile conflict. Please try again or contact support.',
        });
      }

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
        supabaseUserData.user.id
      );
      if (deleteError) {
        console.error(
          `CRITICAL: Failed to rollback Supabase user ${supabaseUserData.user.id} after Prisma failure:`,
          deleteError.message
        );
      } else {
        console.log(
          `Successfully rolled back Supabase user ${supabaseUserData.user.id}`
        );
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'Failed to create user profile in our system after account creation.',
      });
    }
  }),

  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    console.log(
      `BACKEND (getDashboardStats): Fetching stats for user ID: ${userId}`
    );

    const anyDoneTasks = await db.task.count({ where: { status: 'DONE' } });
    console.log(`BACKEND: Any DONE tasks at all: ${anyDoneTasks}`);
    const tasksForThisUser = await db.task.count({
      where: { assignees: { some: { userId: userId } } },
    });
    console.log(
      `BACKEND: Tasks assigned to user ${userId} (any status): ${tasksForThisUser}`
    );

    const completedTasksCount = await db.task.count({
      where: {
        status: 'DONE',
        assignees: {
          some: {
            userId: userId,
          },
        },
      },
    });

    console.log(
      `BACKEND (getDashboardStats): Prisma db.task.count returned: ${completedTasksCount}`
    );

    const projectsUserIsIn = await db.project.findMany({
      where: {
        OR: [
          { createdById: userId },
          { projectUsers: { some: { userId: userId } } },
        ],
      },
      include: {
        projectUsers: {
          select: {
            userId: true,
          },
        },
      },
    });

    const collaboratorIds = new Set<string>();
    projectsUserIsIn.forEach((project) => {
      project.projectUsers.forEach((pu) => {
        if (pu.userId !== userId) {
          collaboratorIds.add(pu.userId);
        }
      });
    });

    return {
      completedTasksCount,
      collaboratorsCount: collaboratorIds.size,
    };
  }),
});
