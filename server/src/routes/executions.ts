import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as executionService from '../services/executionService.js';

const router = Router();

router.use(authenticate);

router.get('/stats', async (req, res, next) => {
  try {
    const stats = await executionService.getExecutionStats(req.userId!);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { workflowId, status, limit, offset } = req.query;
    const executions = await executionService.listExecutions({
      userId: req.userId!,
      workflowId: workflowId as string | undefined,
      status: status as string | undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });
    res.json(executions);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const execution = await executionService.getExecution(req.userId!, req.params.id);
    res.json(execution);
  } catch (err) {
    next(err);
  }
});

export default router;
