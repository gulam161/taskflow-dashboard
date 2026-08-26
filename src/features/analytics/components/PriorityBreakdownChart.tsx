import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { PriorityBreakdownEntry } from '../api/analytics-service';

interface PriorityBreakdownChartProps {
  data: PriorityBreakdownEntry[];
}

export function PriorityBreakdownChart({ data }: PriorityBreakdownChartProps) {
  const hasData = data.some((d) => d.low > 0 || d.medium > 0 || d.high > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No task data available
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
          <XAxis
            dataKey="label"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              borderColor: '#334155',
              borderRadius: '0.75rem',
              color: '#f8fafc',
              fontSize: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Bar
            dataKey="low"
            name="Low Priority"
            stackId="priority"
            fill="#38bdf8"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="medium"
            name="Medium Priority"
            stackId="priority"
            fill="#f59e0b"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="high"
            name="High Priority"
            stackId="priority"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
