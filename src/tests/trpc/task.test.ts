// @ts-nocheck
/// <reference types="vitest/globals" />
import { type inferProcedureInput } from '@trpc/server';
import { expect, test, describe, beforeEach, vi } from 'vitest';
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
    taskUser: {
      createMany: vi.fn(),
    },
    taskTag: {
      createMany: vi.fn(),
    },
  },
}));

vi.mock('~/server/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    auth: {},
  },
}));

describe('Task Router', () => {
  const MOCK_USER_ID_UUID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  const MOCK_PROJECT_ID_UUID = 'b2c3d4e5-f6a7-8901-2345-678901bcdef0';
  const MOCK_TAG_ID_UUID = 'c3d4e5f6-a7b8-9012-3456-789012cdef01';

  const mockSession: Session = {
    expires: new Date(Date.now() + 2 * 86400).toISOString(),
    user: {
      id: MOCK_USER_ID_UUID,
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  const ctx = createInnerTRPCContext({
    session: mockSession,
    headers: new Headers(),
  });
  const caller = appRouter.createCaller(ctx);

  beforeEach(() => {
    vi.resetAllMocks();

    (db.task.create as vi.Mock).mockImplementation(async (args) => ({
      id: 'mock-created-task-uuid',
      ...args.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    (db.taskUser.createMany as vi.Mock).mockResolvedValue({ count: 1 });
    (db.taskTag.createMany as vi.Mock).mockResolvedValue({ count: 1 });
    (db.project.findUnique as vi.Mock).mockResolvedValue({
      id: MOCK_PROJECT_ID_UUID,
      title: 'Mock Project',
    });
  });

  test('should create a task successfully with a project', async () => {
    const input: inferProcedureInput<AppRouter['task']['create']> = {
      title: 'New Test Task with Project',
      description: 'This is a test task description.',
      projectId: MOCK_PROJECT_ID_UUID,
      status: 'TODO',
      priority: 'MEDIUM',
      assigneeIds: [MOCK_USER_ID_UUID],
      tags: [{ id: MOCK_TAG_ID_UUID, name: 'Test Tag' }],
    };

    const result = await caller.task.create(input);

    expect(db.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: input.title,
          projectId: input.projectId,
        }),
      })
    );
    expect(db.taskUser.createMany).toHaveBeenCalled();
    expect(db.taskTag.createMany).toHaveBeenCalled();
    expect(result.title).toBe(input.title);
    expect(result.projectId).toBe(input.projectId);
  });

  test('should create a task successfully without a project (personal task)', async () => {
    const input: inferProcedureInput<AppRouter['task']['create']> = {
      title: 'New Personal Test Task',
      projectId: null,
      status: 'TODO',
      priority: 'LOW',
      assigneeIds: [MOCK_USER_ID_UUID],
    };

    const result = await caller.task.create(input);

    expect(db.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: input.title,
          projectId: null,
        }),
      })
    );
    expect(result.title).toBe(input.title);
    expect(result.projectId).toBeNull();
  });
});
