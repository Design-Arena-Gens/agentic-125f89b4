export const Roles = ['ADMIN', 'INSTRUCTOR', 'MEMBER'] as const;
export type Role = (typeof Roles)[number];

export const AttendanceStatuses = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as const;
export type AttendanceStatus = (typeof AttendanceStatuses)[number];

export const PerformanceCategories = [
  'MECHANICAL',
  'ELECTRONICS',
  'PROGRAMMING',
  'STRATEGY',
  'DESIGN',
  'OUTREACH',
] as const;
export type PerformanceCategory = (typeof PerformanceCategories)[number];

export const isRole = (value: unknown): value is Role =>
  typeof value === 'string' && Roles.includes(value as Role);

export const isAttendanceStatus = (value: unknown): value is AttendanceStatus =>
  typeof value === 'string' && AttendanceStatuses.includes(value as AttendanceStatus);

export const isPerformanceCategory = (value: unknown): value is PerformanceCategory =>
  typeof value === 'string' && PerformanceCategories.includes(value as PerformanceCategory);
