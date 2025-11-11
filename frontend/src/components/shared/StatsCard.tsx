import type { ReactNode } from 'react';
import styles from './StatsCard.module.css';

interface StatsCardProps {
  label: string;
  value: ReactNode;
  accent?: ReactNode;
  trend?: {
    label: string;
    positive?: boolean;
  };
  meta?: string;
}

const StatsCard = ({ label, value, accent, trend, meta }: StatsCardProps) => (
  <article className={styles.card}>
    <div className={styles.label}>
      {accent}
      {label}
    </div>
    <div className={styles.value}>{value}</div>
    {trend ? (
      <div className={`${styles.trend} ${trend.positive ? styles.trendPositive : styles.trendNegative}`}>
        {trend.label}
      </div>
    ) : null}
    {meta ? <div className={styles.meta}>{meta}</div> : null}
  </article>
);

export default StatsCard;
