import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, createApiKeySchema } from '../validators/index.js';
import * as authService from '../services/authService.js';

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.userId!);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/api-keys
router.post(
  '/api-keys',
  authenticate,
  validate(createApiKeySchema),
  async (req, res, next) => {
    try {
      const apiKey = await authService.createApiKey(req.userId!, req.body.name);
      res.status(201).json(apiKey);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/auth/api-keys/:id
router.delete('/api-keys/:id', authenticate, async (req, res, next) => {
  try {
    await authService.deleteApiKey(req.userId!, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
