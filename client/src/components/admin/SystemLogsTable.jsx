import { AlertTriangle, Info, ShieldAlert, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const LogLevelBadge = ({ level }) => {
  const levelStyles = {
    info: {
      icon: <Info size={14} />,
      text: 'Info',
      className: 'bg-blue-100 text-blue-800',
    },
    warn: {
      icon: <ShieldAlert size={14} />,
      text: 'Warning',
      className: 'bg-yellow-100 text-yellow-800',
    },
    error: {
      icon: <XCircle size={14} />,
      text: 'Error',
      className: 'bg-red-100 text-red-800',
    },
  };

  const style = levelStyles[level] || { text: level, className: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.className}`}>
      {style.icon}
      {style.text}
    </span>
  );
};

const TableSkeleton = () => (
  <div className="overflow-hidden">
    <div className="w-full animate-pulse">
      {/* Skeleton Header */}
      <div className="flex h-12 bg-gray-100">
        <div className="w-1/4 p-3"><div className="h-4 bg-gray-200 rounded"></div></div>
        <div className="w-1/6 p-3"><div className="h-4 bg-gray-200 rounded"></div></div>
        <div className="flex-grow p-3"><div className="h-4 bg-gray-200 rounded"></div></div>
      </div>
      {/* Skeleton Rows */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex border-t border-gray-200">
          <div className="w-1/4 p-4"><div className="h-4 bg-gray-200 rounded"></div></div>
          <div className="w-1/6 p-4"><div className="w-20 h-4 bg-gray-300 rounded-full"></div></div>
          <div className="flex-grow p-4"><div className="h-4 bg-gray-200 rounded"></div></div>
        </div>
      ))}
    </div>
  </div>
);



const SystemLogsTable = ({ logs = [], isLoading, isError, error }) => {
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center text-red-600 rounded-lg bg-red-50">
        <AlertTriangle size={48} />
        <h3 className="mt-4 text-xl font-semibold">An Error Occurred</h3>
        <p className="mt-1">{error?.message || 'Failed to load system logs.'}</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500">
        <h3 className="text-xl font-medium">No Logs Found</h3>
        <p className="mt-1">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Timestamp
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Level
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Message
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((log) => (
            <tr key={log._id} className="transition-colors hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                {format(new Date(log.timestamp), 'MMM d, yyyy, h:mm:ss a')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <LogLevelBadge level={log.level} />
              </td>
              <td className="px-6 py-4 text-sm text-gray-800 break-words">
                {log.message}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SystemLogsTable;