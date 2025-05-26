import { type inferProcedureInput } from '@trpc/server';
import { expect, test, vi, describe, beforeEach } from 'vitest';
import { appRouter, type AppRouter } from '~/server/api/root';
import { createInnerTRPCContext } from '~/server/api/trpc';
import { type Session } from 'next-auth';
import { db } from '~/server/db';

vi.mock('~/server/db', () => ({
  db: {
    task: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Task Router', () => {
  const mockSession: Session = {
    expires: new Date(Date.now() + 2 * 86400).toISOString(),
    user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
  };

  const ctx = createInnerTRPCContext({
    session: mockSession,
    headers: new Headers(),
  });
  const caller = appRouter.createCaller(ctx);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('should create a task successfully', async () => {
    const input: inferProcedureInput<AppRouter['task']['create']> = {
      title: 'New Test Task',
      description: 'This is a test task description.',
      projectId: 'clxkf5099000008ju9h70ahjb',
      status: 'TODO',
      priority: 'MEDIUM',
    };

    const mockCreatedTask = {
      id: 'clxkf5new000008juabcdefg',
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedToId: null,
      dueDate: null,
    };

    (db.task.create as vi.Mock).mockResolvedValue(mockCreatedTask);
    (db.project.findUnique as vi.Mock).mockResolvedValue({
      id: input.projectId,
      createdById: mockSession.user.id,
    });

    const result = await caller.task.create(input);

    expect(db.task.create).toHaveBeenCalledWith({
      data: {
        title: input.title,
        description: input.description,
        projectId: input.projectId,
        status: input.status,
        priority: input.priority,
      },
    });
    expect(result).toMatchObject(input);
    expect(result.id).toBeDefined();
  });
});
