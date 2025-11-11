import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import {
  AttendanceStatuses,
  type AttendanceStatus,
} from '../types/domain.js';

const attendanceQuerySchema = z.object({
  date: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined)),
});

const bulkAttendanceSchema = z.object({
  records: z
    .array(
      z.object({
        memberId: z.number().int(),
        date: z.coerce.date(),
        status: z.enum(AttendanceStatuses),
        notes: z.string().optional(),
      }),
    )
    .min(1),
});

export const getAttendance = async (req: Request, res: Response) => {
  if (req.user?.role === 'MEMBER') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { date } = attendanceQuerySchema.parse(req.query);

  const startOfDay = date ? new Date(date.setHours(0, 0, 0, 0)) : undefined;
  const endOfDay = date ? new Date(date.setHours(23, 59, 59, 999)) : undefined;

  const records = await prisma.attendanceRecord.findMany({
    where: date
      ? {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        }
      : {},
    include: {
      member: true,
    },
    orderBy: { date: 'desc' },
  });

  res.json({ attendance: records });
};

export const getMemberAttendance = async (req: Request, res: Response) => {
  const memberId = Number(req.params.memberId);

  if (req.user?.role === 'MEMBER' && req.user.memberId !== memberId) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const records = await prisma.attendanceRecord.findMany({
    where: { memberId },
    orderBy: { date: 'desc' },
  });
  res.json({ attendance: records });
};

export const bulkUpsertAttendance = async (req: Request, res: Response) => {
  const { records } = bulkAttendanceSchema.parse(req.body);

  const result = await prisma.$transaction(
    records.map(({ memberId, date, status, notes }) =>
      prisma.attendanceRecord.upsert({
        where: {
          memberId_date: {
            memberId,
            date,
          },
        },
        update: {
          status,
          notes,
        },
        create: {
          memberId,
          date,
          status,
          notes,
        },
      }),
    ),
  );

  res.json({ attendance: result });
};
