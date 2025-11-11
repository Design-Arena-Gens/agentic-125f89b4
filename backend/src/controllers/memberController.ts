import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const memberInputSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  department: z.string().min(1),
  batch: z.string().min(1),
  joinDate: z.coerce.date(),
  status: z.string().min(1),
  position: z.string().min(1),
  skills: z.string().min(1),
  notes: z.string().optional(),
});

const memberQuerySchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  status: z.string().optional(),
});

const updateMemberSchema = memberInputSchema.partial();

const buildVin = async () => {
  const lastMember = await prisma.member.findFirst({
    orderBy: { id: 'desc' },
  });

  if (!lastMember) {
    return 'VIN-001';
  }

  const match = lastMember.vin.match(/VIN-(\d+)/);
  const nextValue = match ? Number(match[1]) + 1 : lastMember.id + 1;
  return `VIN-${nextValue.toString().padStart(3, '0')}`;
};

export const listMembers = async (req: Request, res: Response) => {
  const { search, department, status } = memberQuerySchema.parse(req.query);

  const where = {
    AND: [
      search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { vin: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      department ? { department } : {},
      status ? { status } : {},
    ] as Record<string, unknown>[],
  };

  if (req.user?.role === 'MEMBER') {
    if (!req.user.memberId) {
      return res.status(403).json({ message: 'Member profile not linked' });
    }
    where.AND.push({ id: req.user.memberId });
  }

  type RawMember = Record<string, unknown> & {
    attendance?: Array<Record<string, unknown>>;
    performance?: Array<Record<string, unknown>>;
  };

  const members = (await prisma.member.findMany({
    where,
    orderBy: { firstName: 'asc' },
    include: {
      attendance: true,
      performance: true,
    },
  })) as RawMember[];

  const formatted = members.map((member: RawMember) => {
    const attendanceRecords = (member.attendance ?? []) as Array<{ status: string }>;
    const performanceRecords = (member.performance ?? []) as Array<{ score: number }>;

    const totalAttendance = attendanceRecords.length;
    const attendanceSummary = attendanceRecords.reduce<Record<string, number>>((acc, record) => {
      acc[record.status] = (acc[record.status] ?? 0) + 1;
      return acc;
    }, {});

    const averageScore =
      performanceRecords.length === 0
        ? null
        : Math.round(
            performanceRecords.reduce((acc, record) => acc + record.score, 0) /
              performanceRecords.length,
          );

    return {
      ...member,
      attendanceSummary,
      totalAttendance,
      performanceSummary: {
        count: performanceRecords.length,
        averageScore,
      },
    };
  });

  res.json({ members: formatted });
};

export const getMember = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (req.user?.role === 'MEMBER' && req.user.memberId !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      attendance: { orderBy: { date: 'desc' }, take: 20 },
      performance: { orderBy: { recordedAt: 'desc' }, take: 20 },
    },
  });

  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }

  res.json({ member });
};

export const createMember = async (req: Request, res: Response) => {
  const payload = memberInputSchema.parse(req.body);

  const vin = await buildVin();

  const member = await prisma.member.create({
    data: {
      ...payload,
      vin,
    },
  });

  res.status(201).json({ member });
};

export const updateMember = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const payload = updateMemberSchema.parse(req.body);

  if (req.user?.role === 'MEMBER') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const member = await prisma.member.update({
      where: { id },
      data: payload,
    });

    res.json({ member });
  } catch (error) {
    res.status(404).json({ message: 'Member not found' });
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    await prisma.member.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: 'Member not found' });
  }
};
