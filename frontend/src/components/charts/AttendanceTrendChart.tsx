import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AttendanceTrendPoint } from '../../types';

interface AttendanceTrendChartProps {
  data: AttendanceTrendPoint[];
}

const AttendanceTrendChart = ({ data }: AttendanceTrendChartProps) => (
  <ResponsiveContainer width="100%" height={320}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="20%" stopColor="#22c55e" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
      <XAxis dataKey="date" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend />
      <Area
        type="monotone"
        dataKey="PRESENT"
        stroke="#16a34a"
        fill="url(#colorPresent)"
        strokeWidth={3}
      />
      <Area type="monotone" dataKey="LATE" stroke="#f97316" fill="rgba(249,115,22,0.1)" />
      <Area type="monotone" dataKey="EXCUSED" stroke="#0ea5e9" fill="rgba(14,165,233,0.1)" />
      <Area type="monotone" dataKey="ABSENT" stroke="#ef4444" fill="rgba(239,68,68,0.08)" />
    </AreaChart>
  </ResponsiveContainer>
);

export default AttendanceTrendChart;
