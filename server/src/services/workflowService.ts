import { execFile } from 'node:child_process';
import { writeFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import type { CreateWorkflowInput, UpdateWorkflowInput } from '../validators/index.js';

const prisma = new PrismaClient();

const ENGINE_PATH =
  process.env.ENGINE_PATH ||
  join(process.cwd(), '..', 'engine', 'bin', 'runner.exe');

interface EngineStep {
  nodeId: string;
  status: 'success' | 'failed' | 'skipped';
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  durationMs: number;
}

interface EngineResult {
  id: string;
  status: string;
  steps: EngineStep[];
  errorMessage: string | null;
  completedAt: string;
}

function runEngine(workflowJson: unknown, inputJson: unknown): Promise<EngineResult> {
  return new Promise((resolve, reject) => {
    const tmpDir = tmpdir();
    const workflowPath = join(tmpDir, `autoflow-wf-${randomUUID()}.json`);
    const inputPath = join(tmpDir, `autoflow-in-${randomUUID()}.json`);

    Promise.all([
      writeFile(workflowPath, JSON.stringify(workflowJson)),
      writeFile(inputPath, JSON.stringify(inputJson)),
    ])
      .then(() => {
        execFile(
          ENGINE_PATH,
          [`--workflow=${workflowPath}`, `--input=${inputPath}`],
          { timeout: 30000 },
          (err, stdout, stderr) => {
            // Cleanup temp files
            unlink(workflowPath).catch(() => {});
            unlink(inputPath).catch(() => {});

            if (err) {
              // Extract the useful error message from Go's log output
              const match = stderr.match(/"error":\s*"([^"]+)"/);
              const cleanError = match
                ? match[1]
                : stderr.split('\n').pop() || 'Unknown engine error';
              reject(new Error(cleanError));
              return;
            }

            try {
              const result = JSON.parse(stdout.trim()) as EngineResult;
              resolve(result);
            } catch (parseErr) {
              reject(new Error(`Failed to parse engine output: ${stdout.slice(0, 200)}`));
            }
          }
        );
      })
      .catch(reject);
  });
}

export async function listWorkflows(userId: string, status?: string) {
  const where: Record<string, unknown> = { userId };
  if (status) {
    where.status = status.toUpperCase();
  }

  return prisma.workflow.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      nodes: true,
      edges: true,
      status: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getWorkflow(userId: string, workflowId: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
  });

  if (!workflow || workflow.userId !== userId) {
    throw new AppError('Workflow not found', 404);
  }

  return workflow;
}

export async function createWorkflow(userId: string, input: CreateWorkflowInput) {
  return prisma.workflow.create({
    data: {
      name: input.name,
      description: input.description || '',
      userId,
    },
  });
}

export async function updateWorkflow(
  userId: string,
  workflowId: string,
  input: UpdateWorkflowInput
) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
  });

  if (!workflow || workflow.userId !== userId) {
    throw new AppError('Workflow not found', 404);
  }

  return prisma.workflow.update({
    where: { id: workflowId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.nodes !== undefined && { nodes: input.nodes }),
      ...(input.edges !== undefined && { edges: input.edges }),
      ...(input.status !== undefined && { status: input.status }),
    },
  });
}

export async function deleteWorkflow(userId: string, workflowId: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
  });

  if (!workflow || workflow.userId !== userId) {
    throw new AppError('Workflow not found', 404);
  }

  await prisma.workflow.delete({ where: { id: workflowId } });
}

export async function triggerWorkflow(userId: string, workflowId: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
  });

  if (!workflow || workflow.userId !== userId) {
    throw new AppError('Workflow not found', 404);
  }

  // Create execution record as RUNNING
  const execution = await prisma.execution.create({
    data: {
      workflowId,
      status: 'RUNNING',
    },
  });

  // Build workflow JSON for the engine
  const nodes = workflow.nodes as any[] | null;
  const edges = workflow.edges as any[] | null;

  if (!nodes || nodes.length === 0) {
    // No nodes to execute — mark as success immediately
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: 'SUCCESS',
        completedAt: new Date(),
        steps: [],
      },
    });
    return prisma.execution.findUnique({ where: { id: execution.id } });
  }

  try {
    // Run the Go engine
    const engineInput = { executionId: execution.id };
    const engineResult = await runEngine(
      { id: workflow.id, name: workflow.name, nodes, edges },
      engineInput
    );

    // Update execution with results
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: engineResult.status.toUpperCase() === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
        completedAt: new Date(engineResult.completedAt),
        steps: engineResult.steps.map((s) => ({
          nodeId: s.nodeId,
          nodeLabel:
            ((nodes as any[]).find((n: any) => n.id === s.nodeId) as any)?.label || s.nodeId,
          status: s.status,
          input: s.input,
          output: s.output,
          error: s.error,
          durationMs: s.durationMs,
        })),
        errorMessage: engineResult.errorMessage,
      },
    });
  } catch (engineErr) {
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errorMessage:
          engineErr instanceof Error ? engineErr.message : 'Engine execution failed',
      },
    });
  }

  return prisma.execution.findUnique({
    where: { id: execution.id },
    include: {
      workflow: { select: { name: true } },
    },
  });
}
