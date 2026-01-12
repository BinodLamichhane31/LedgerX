import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const UserGrowthChart = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-[300px] w-full bg-slate-50 flex items-center justify-center rounded-xl animate-pulse">
        <p className="text-slate-400">Loading chart data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
        <div className="h-[300px] w-full bg-slate-50 flex items-center justify-center rounded-xl">
          <p className="text-slate-400">No data available for the last 30 days.</p>
        </div>
      );
  }

  return (
    <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800">User Growth</h2>
        <p className="text-sm text-slate-500">New registrations in the last 30 days</p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
                minTickGap={30}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                allowDecimals={false}
            />
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
            />
            <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#4f46e5" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorUsers)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserGrowthChart;
