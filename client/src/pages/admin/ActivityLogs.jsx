import { useState, Fragment } from 'react';
import { useGetActivityLogs, useGetLogModules } from '../../hooks/admin/useActivityLogs';
import Pagination from '../../components/common/Pagination';
import { Search, Filter, Calendar, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const ActivityLogs = () => {
    const {
        data,
        isLoading,
        isError,
        pageNumber,
        setPageNumber,
        search,
        setSearch,
        action,
        setAction,
        module,
        setModule,
        dateRange,
        setDateRange
    } = useGetActivityLogs();

    const { data: moduleData } = useGetLogModules();
    
    // For expanding row to show metadata
    const [expandedRow, setExpandedRow] = useState(null);

    const logs = data?.data || [];
    const pagination = data?.pagination || {};
    const modules = moduleData?.data?.modules || [];
    const actions = moduleData?.data?.actions || [];

    const toggleRow = (id) => {
        if (expandedRow === id) {
            setExpandedRow(null);
        } else {
            setExpandedRow(id);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText size={24} className="text-blue-600"/>
                    </div>
                    Activity Logs
                </h1>
                <p className="mt-1 text-slate-500">Audit trail of system activities and security events.</p>
            </div>

            <div className="p-4 mb-6 bg-white border border-slate-200 shadow-sm rounded-xl">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute text-slate-400 left-3 top-3" size={20} />
                        <input 
                            type="text" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search IP, Email..."
                            className="w-full py-2.5 pl-10 pr-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Filter Action */}
                    <select
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        className="py-2.5 px-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Actions</option>
                        {actions.map(act => (
                            <option key={act} value={act}>{act}</option>
                        ))}
                    </select>

                    {/* Filter Module */}
                    <select
                        value={module}
                        onChange={(e) => setModule(e.target.value)}
                        className="py-2.5 px-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Modules</option>
                        {modules.map(mod => (
                            <option key={mod} value={mod}>{mod}</option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        <input 
                            type="date" 
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                            className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                         <input 
                            type="date" 
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                            className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading logs...</div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No logs found matching your criteria.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Timestamp</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Action</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Module</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">IP Address</th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.map((log) => (
                                    <Fragment key={log._id}>
                                        <tr className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {log.user_id ? `${log.user_id.fname} ${log.user_id.lname}` : 'System/Guest'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {log.user_id ? log.user_id.email : (log.metadata.email || '-')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${log.action.includes('DELETE') || log.action.includes('FAILED') ? 'bg-red-100 text-red-800' : 
                                                      log.action.includes('UPDATE') || log.action.includes('CHANGE') ? 'bg-yellow-100 text-yellow-800' : 
                                                      'bg-green-100 text-green-800'}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.module}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.ip_address}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => toggleRow(log._id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    {expandedRow === log._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Expanded Row for Metadata */}
                                        {expandedRow === log._id && (
                                            <tr className="bg-gray-50">
                                                <td colSpan="6" className="px-6 py-4">
                                                    <div className="text-sm text-gray-700">
                                                        <h4 className="font-semibold mb-2">Metadata & Technical Details:</h4>
                                                        <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                                                            {JSON.stringify({
                                                                userAgent: log.user_agent,
                                                                metadata: log.metadata
                                                            }, null, 2)}
                                                        </pre>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {!isLoading && logs.length > 0 && (
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={setPageNumber}
                />
            )}
        </div>
    );
};

export default ActivityLogs;
