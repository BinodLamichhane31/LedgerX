import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomXAxisTick = ({ x, y, payload }) => {
  if (!payload || !payload.value) return null;

  const [month, year] = payload.value.split(' ');
  const currentYear = new Date().getFullYear().toString();

  const tickColor = year === currentYear ? '#374151' : '#9ca3af';

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill={tickColor} transform="rotate(-35)" fontSize={12}>
        {month}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border shadow-xl bg-white/95 backdrop-blur-md border-slate-100 rounded-xl"
      >
        <p className="mb-2 font-bold text-slate-800 text-md">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <p className="text-sm font-medium text-slate-600">Sales: <span className="text-indigo-600 font-bold">Rs. {payload[0].value.toLocaleString()}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
             <p className="text-sm font-medium text-slate-600">Purchases: <span className="text-emerald-600 font-bold">Rs. {payload[1].value.toLocaleString()}</span></p>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
};

const formatYAxis = (tick) => {
  if (tick >= 1000) {
    return `${tick / 1000}k`;
  }
  return tick;
};

const DashboardChart = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-slate-50/50 rounded-xl">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const hasData = data && data.some(d => d.sales > 0 || d.purchases > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-gray-50 rounded-xl">
        <p className="text-gray-500">Not enough data to display chart.</p>
      </div>
    );
  }
  
  const currentYear = new Date().getFullYear().toString();
  const yearChangeIndex = data.findIndex(d => d.name.includes(currentYear));
  const referenceLineX = yearChangeIndex > 0 ? data[yearChangeIndex].name : null;

  return (
    <div className="w-full h-96">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 30 }}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
          
          <XAxis 
            dataKey="name" 
            tick={<CustomXAxisTick />}
            axisLine={false} 
            tickLine={false} 
            interval={0}
            height={50}
          />
          
          <YAxis 
            tickFormatter={formatYAxis} 
            tick={{ fill: '#6b7280', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false} 
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(156, 163, 175, 0.3)', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{ paddingTop: '40px' }} />

          {referenceLineX && (
            <ReferenceLine x={referenceLineX} stroke="#6b7280" strokeDasharray="4 4">
              <Label 
                value={currentYear} 
                position="top" 
                fill="#6b7280" 
                fontSize={12} 
                fontWeight="bold" 
                dy={-10} 
              />
            </ReferenceLine>
          )}

          <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} />
          <Area type="monotone" dataKey="purchases" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPurchases)" activeDot={{ r: 6, strokeWidth: 0, fill: '#059669' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardChart;