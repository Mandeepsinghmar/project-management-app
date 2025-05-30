import { initTRPC, TRPCError } from '@trpc/server';
import { type Session, getServerSession } from 'next-auth';
import * as superjson from 'superjson';
import { ZodError } from 'zod';

import { authOptions } from '~/server/auth';
import { db } from '~/server/db';
import { type NextRequest } from 'next/server';

interface CreateContextOptions {
  session: Session | null;
  headers: Headers;
  req?: NextRequest;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
    headers: opts.headers,
    req: opts.req,
  };
};

export const createTRPCContext = async (opts: { req: NextRequest }) => {
  const { req } = opts;
  const headers = new Headers(req.headers);

  const session = await getServerSession(authOptions);

  return createInnerTRPCContext({
    session,
    headers,
    req,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
