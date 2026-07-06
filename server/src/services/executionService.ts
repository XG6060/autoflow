import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

interface ExecutionFilters {
  userId: string;
  workflowId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export async function listExecutions(filters: ExecutionFilters) {
  const where: Record<string, unknown> = {
    workflow: { userId: filters.userId },
  };

  if (filters.workflowId) {
    where.workflowId = filters.workflowId;
  }
  if (filters.status) {
    where.status = filters.status.toUpperCase();
  }

  return prisma.execution.findMany({
    where,
    orderBy: { startedAt: 'desc' },
    take: filters.limit || 50,
    skip: filters.offset || 0,
    include: {
      workflow: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function getExecution(userId: string, executionId: string) {
  const execution = await prisma.execution.findFirst({
    where: {
      id: executionId,
      workflow: { userId },
    },
    include: {
      workflow: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!execution) {
    throw new AppError('Execution not found', 404);
  }

  return execution;
}

export async function getExecutionStats(userId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalWorkflows, activeWorkflows, executionsToday, successfulToday, totalToday] =
    await Promise.all([
      prisma.workflow.count({ where: { userId } }),
      prisma.workflow.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.execution.count({
        where: {
          workflow: { userId },
          startedAt: { gte: startOfDay },
        },
      }),
      prisma.execution.count({
        where: {
          workflow: { userId },
          startedAt: { gte: startOfDay },
          status: 'SUCCESS',
        },
      }),
      prisma.execution.count({
        where: {
          workflow: { userId },
          startedAt: { gte: startOfDay },
        },
      }),
    ]);

  const successRate = totalToday > 0 ? Math.round((successfulToday / totalToday) * 100) : 100;

  const recentExecutions = await prisma.execution.findMany({
    where: { workflow: { userId } },
    orderBy: { startedAt: 'desc' },
    take: 10,
    include: {
      workflow: {
        select: { name: true },
      },
    },
  });

  return {
    totalWorkflows,
    activeWorkflows,
    executionsToday,
    successRate,
    recentExecutions,
  };
}
