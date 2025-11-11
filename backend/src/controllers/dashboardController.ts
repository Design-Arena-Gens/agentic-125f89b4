import type { Request, Response } from 'express';
import dayjs from 'dayjs';
import { prisma } from '../lib/prisma.js';
import { AttendanceStatuses } from '../types/domain.js';

const DAYS_HISTORY = 14;

export const getDashboardSummary = async (_req: Request, res: Response) => {
  const attendanceArgs = {
    where: {
      date: {
        gte: dayjs().subtract(DAYS_HISTORY, 'day').startOf('day').toDate(),
      },
    },
    include: { member: true },
    orderBy: { date: 'asc' as const },
  };

  const performanceArgs = {
    where: {
      recordedAt: {
        gte: dayjs().subtract(30, 'day').toDate(),
      },
    },
  };

  const [totalMembers, activeMembers, latestAttendance, performanceRecords] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({
      where: { status: { in: ['Active', 'Core', 'Regular'] } },
    }),
    prisma.attendanceRecord.findMany(attendanceArgs),
    prisma.performanceRecord.findMany(performanceArgs),
  ]);

  const attendanceData = latestAttendance as Array<{ status: string; date: Date }>;
  const performanceData = performanceRecords as Array<{
    category: string;
    score: number;
    rating: number;
  }>;

  const attendanceTrendMap = new Map<string, Record<string, number>>();
  for (let i = DAYS_HISTORY; i >= 0; i -= 1) {
    const dateKey = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
    attendanceTrendMap.set(
      dateKey,
      AttendanceStatuses.reduce(
        (acc, status) => {
          acc[status] = 0;
          return acc;
        },
        {} as Record<string, number>,
      ),
    );
  }

  attendanceData.forEach((entry) => {
    const dateKey = dayjs(entry.date).format('YYYY-MM-DD');
    const daily = attendanceTrendMap.get(dateKey);
    if (daily) {
      daily[entry.status] += 1;
    }
  });

  const attendanceTrend = Array.from(attendanceTrendMap.entries()).map(([date, summary]) => ({
    date,
    ...summary,
  }));

  const categoryPerformance = performanceData.reduce<
    Record<string, { totalScore: number; totalRating: number; count: number }>
  >((acc, record) => {
    const category = record.category;
    if (!acc[category]) {
      acc[category] = { totalScore: 0, totalRating: 0, count: 0 };
    }

    acc[category].totalScore += record.score;
    acc[category].totalRating += record.rating;
    acc[category].count += 1;

    return acc;
  }, {});

  const performanceSummary = Object.entries(categoryPerformance).map(([category, stats]) => ({
    category,
    averageScore: Math.round(stats.totalScore / stats.count),
    averageRating: Number((stats.totalRating / stats.count).toFixed(1)),
  }));

  const todayKey = dayjs().format('YYYY-MM-DD');
  const defaultAttendance = AttendanceStatuses.reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<string, number>,
  );

  const todayAttendance = attendanceTrend.find((item) => item.date === todayKey) ?? {
    date: todayKey,
    ...defaultAttendance,
  };

  res.json({
    summary: {
      totalMembers,
      activeMembers,
      todayAttendance,
      performanceSummary,
      attendanceTrend,
    },
  });
};
