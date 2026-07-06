import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createWorkflowSchema, updateWorkflowSchema } from '../validators/index.js';
import * as workflowService from '../services/workflowService.js';

const router = Router();

// All workflow routes require authentication
router.use(authenticate);

// GET /api/workflows
router.get('/', async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const workflows = await workflowService.listWorkflows(req.userId!, status);
    res.json(workflows);
  } catch (err) {
    next(err);
  }
});

// GET /api/workflows/:id
router.get('/:id', async (req, res, next) => {
  try {
    const workflow = await workflowService.getWorkflow(req.userId!, req.params.id);
    res.json(workflow);
  } catch (err) {
    next(err);
  }
});

// POST /api/workflows
router.post('/', validate(createWorkflowSchema), async (req, res, next) => {
  try {
    const workflow = await workflowService.createWorkflow(req.userId!, req.body);
    res.status(201).json(workflow);
  } catch (err) {
    next(err);
  }
});

// PUT /api/workflows/:id
router.put('/:id', validate(updateWorkflowSchema), async (req, res, next) => {
  try {
    const workflow = await workflowService.updateWorkflow(
      req.userId!,
      req.params.id,
      req.body
    );
    res.json(workflow);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/workflows/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await workflowService.deleteWorkflow(req.userId!, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /api/workflows/:id/run
router.post('/:id/run', async (req, res, next) => {
  try {
    const execution = await workflowService.triggerWorkflow(
      req.userId!,
      req.params.id
    );
    res.status(201).json(execution);
  } catch (err) {
    next(err);
  }
});

export default router;
