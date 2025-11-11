import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import {
  PerformanceCategories,
  type PerformanceCategory,
} from '../types/domain.js';

const performanceQuerySchema = z.object({
  category: z.enum(PerformanceCategories).optional(),
});

const performanceInputSchema = z.object({
  memberId: z.number().int(),
  category: z.enum(PerformanceCategories),
  score: z.number().int().min(0).max(100),
  rating: z.number().int().min(1).max(10),
  notes: z.string().optional(),
  recordedAt: z.coerce.date().optional(),
});

export const listPerformance = async (req: Request, res: Response) => {
  const { category } = performanceQuerySchema.parse(req.query);

  const records = await prisma.performanceRecord.findMany({
    where: category ? { category } : {},
    include: {
      member: true,
    },
    orderBy: {
      recordedAt: 'desc',
    },
  });

  res.json({ performance: records });
};

export const getMemberPerformance = async (req: Request, res: Response) => {
  const memberId = Number(req.params.memberId);

  if (req.user?.role === 'MEMBER' && req.user.memberId !== memberId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const records = await prisma.performanceRecord.findMany({
    where: { memberId },
    orderBy: { recordedAt: 'desc' },
    include: { member: true },
  });
  res.json({ performance: records });
};

export const createPerformance = async (req: Request, res: Response) => {
  const payload = performanceInputSchema.parse(req.body);

  const record = await prisma.performanceRecord.create({
    data: {
      ...payload,
    },
  });

  res.status(201).json({ performance: record });
};
