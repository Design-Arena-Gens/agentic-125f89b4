export type Role = 'ADMIN' | 'INSTRUCTOR' | 'MEMBER';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';

export type PerformanceCategory =
  | 'MECHANICAL'
  | 'ELECTRONICS'
  | 'PROGRAMMING'
  | 'STRATEGY'
  | 'DESIGN'
  | 'OUTREACH';

export interface Member {
  id: number;
  vin: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  batch: string;
  joinDate: string;
  status: string;
  position: string;
  skills: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  totalAttendance?: number;
  attendanceSummary?: Partial<Record<AttendanceStatus, number>>;
  performanceSummary?: {
    count: number;
    averageScore: number | null;
  };
  attendance?: AttendanceRecord[];
  performance?: PerformanceRecord[];
}

export interface AttendanceRecord {
  id: number;
  date: string;
  status: AttendanceStatus;
  notes?: string | null;
  memberId: number;
}

export interface PerformanceRecord {
  id: number;
  memberId: number;
  category: PerformanceCategory;
  score: number;
  rating: number;
  notes?: string | null;
  recordedAt: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  memberId?: number | null;
  member?: Member | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AttendanceTrendPoint {
  date: string;
  PRESENT: number;
  LATE: number;
  ABSENT: number;
  EXCUSED: number;
}

export interface PerformanceCategorySummary {
  category: PerformanceCategory;
  averageScore: number;
  averageRating: number;
}

export interface DashboardSummary {
  totalMembers: number;
  activeMembers: number;
  todayAttendance: {
    PRESENT: number;
    LATE: number;
    ABSENT: number;
    EXCUSED: number;
  };
  performanceSummary: PerformanceCategorySummary[];
  attendanceTrend: AttendanceTrendPoint[];
}
