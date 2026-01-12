import React from 'react';
import { useGetSystemLogs } from '../../hooks/admin/useSystemLogs';
import { format } from 'date-fns';
import { Activity, UserPlus, Trash2, Edit, LogIn, AlertCircle } from 'lucide-react';

const getActionIcon = (message) => {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('create') || lowerMsg.includes('add')) return <UserPlus size={16} className="text-emerald-500" />;
  if (lowerMsg.includes('delete') || lowerMsg.includes('remove')) return <Trash2 size={16} className="text-rose-500" />;
  if (lowerMsg.includes('update') || lowerMsg.includes('edit')) return <Edit size={16} className="text-amber-500" />;
  if (lowerMsg.includes('login') || lowerMsg.includes('signin')) return <LogIn size={16} className="text-blue-500" />;
  return <Activity size={16} className="text-indigo-500" />;
};

const RecentActivity = () => {
  const { data: logsData, isLoading } = useGetSystemLogs({ limit: 5, page: 1 });
  
  const logs = logsData?.data || [];

  return (
    <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
           <p className="text-sm text-slate-500">Latest system actions</p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
             <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-3 rounded bg-slate-100"></div>
                    <div className="w-1/2 h-2 rounded bg-slate-100"></div>
                </div>
             </div>
          ))
        ) : logs.length > 0 ? (
          logs.map((log) => (
            <div key={log._id} className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-slate-100">
                    {getActionIcon(log.message)}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{log.message}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">
                        {log.timestamp ? format(new Date(log.timestamp), 'MMM d, h:mm a') : 'Just now'}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 lowercase">{log.level}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
            <div className="py-8 text-center text-slate-400">
                <p>No recent activity found.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
