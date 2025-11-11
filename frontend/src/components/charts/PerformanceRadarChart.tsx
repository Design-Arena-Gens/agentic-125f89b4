import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import type { PerformanceCategorySummary } from '../../types';

interface PerformanceRadarChartProps {
  data: PerformanceCategorySummary[];
}

const PerformanceRadarChart = ({ data }: PerformanceRadarChartProps) => (
  <ResponsiveContainer width="100%" height={320}>
    <RadarChart data={data}>
      <PolarGrid />
      <PolarAngleAxis dataKey="category" />
      <PolarRadiusAxis angle={45} domain={[0, 100]} />
      <Radar
        name="Score"
        dataKey="averageScore"
        stroke="#6366f1"
        fill="#6366f1"
        fillOpacity={0.4}
      />
    </RadarChart>
  </ResponsiveContainer>
);

export default PerformanceRadarChart;
