import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import type { DashboardSummary } from '../../types';
import StatsCard from '../../components/shared/StatsCard';
import AttendanceTrendChart from '../../components/charts/AttendanceTrendChart';
import PerformanceRadarChart from '../../components/charts/PerformanceRadarChart';
import styles from './Dashboard.module.css';

const DashboardPage = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await api.get<{ summary: DashboardSummary }>('/dashboard/summary');
        setSummary(response.data.summary);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const presentRate = useMemo(() => {
    if (!summary) return 0;
    const total =
      summary.todayAttendance.PRESENT +
      summary.todayAttendance.LATE +
      summary.todayAttendance.EXCUSED +
      summary.todayAttendance.ABSENT;
    if (total === 0) return 0;
    return Math.round((summary.todayAttendance.PRESENT / total) * 100);
  }, [summary]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (!summary) {
    return <div>No dashboard data available.</div>;
  }

  return (
    <div className={styles.grid}>
      <section className={styles.statsRow}>
        <StatsCard
          label="Total Members"
          value={summary.totalMembers}
          trend={{ label: '+4 new this month', positive: true }}
          meta="Across all cohorts"
        />
        <StatsCard
          label="Active Contributors"
          value={summary.activeMembers}
          trend={{ label: 'Core team steady', positive: true }}
          meta="Core + leadership roles"
        />
        <StatsCard
          label="Attendance Today"
          value={`${summary.todayAttendance.PRESENT} present`}
          trend={{
            label: `${presentRate}% attendance rate`,
            positive: presentRate >= 75,
          }}
          meta={`Late: ${summary.todayAttendance.LATE} • Excused: ${summary.todayAttendance.EXCUSED}`}
        />
      </section>

      <section className={styles.cards}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Daily Attendance Pulse</h2>
            <span style={{ color: '#6b7280' }}>Rolling 2 weeks</span>
          </div>
          <AttendanceTrendChart data={summary.attendanceTrend} />
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Performance Radar</h2>
            <span style={{ color: '#6b7280' }}>Average score by category</span>
          </div>
          <PerformanceRadarChart data={summary.performanceSummary} />
        </article>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Category Highlights</h2>
        </div>
        <ul className={styles.list}>
          {summary.performanceSummary.map((category) => (
            <li key={category.category}>
              <span>{category.category}</span>
              <span>
                {category.averageScore}/100 • {category.averageRating}/10 rating
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default DashboardPage;
