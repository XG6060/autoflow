import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { config } from '../config.js';
import { AppError } from '../middleware/errorHandler.js';
import type { RegisterInput, LoginInput } from '../validators/index.js';
import type { AuthPayload } from '../middleware/auth.js';

const prisma = new PrismaClient();

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, config.bcryptRounds);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      createdAt: true,
    },
  });

  const token = generateToken({ userId: user.id, email: user.email });

  return { token, user };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken({ userId: user.id, email: user.email });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      createdAt: user.createdAt,
    },
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

export async function createApiKey(userId: string, name: string) {
  const key = `af_${uuidv4().replace(/-/g, '')}`;

  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      key,
      userId,
    },
  });

  return {
    id: apiKey.id,
    name: apiKey.name,
    key: apiKey.key,
    lastUsedAt: apiKey.lastUsedAt,
    createdAt: apiKey.createdAt,
  };
}

export async function deleteApiKey(userId: string, keyId: string) {
  const apiKey = await prisma.apiKey.findUnique({ where: { id: keyId } });

  if (!apiKey || apiKey.userId !== userId) {
    throw new AppError('API key not found', 404);
  }

  await prisma.apiKey.delete({ where: { id: keyId } });
}

function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}
