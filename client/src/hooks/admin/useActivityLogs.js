import { useQuery } from "@tanstack/react-query";
import { getActivityLogsService, getLogModulesService } from "../../services/admin/ActivityLogService";
import { useState } from "react";

export const useGetActivityLogs = () => {
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState(""); // For searching metadata/IP
    
    // Filter states
    const [action, setAction] = useState("");
    const [module, setModule] = useState("");
    const [userId, setUserId] = useState(""); // If we implement user filtering
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

    const query = useQuery({
        queryKey: ['admin_activity_logs', pageNumber, pageSize, search, action, module, userId, dateRange.startDate, dateRange.endDate],
        queryFn: () => getActivityLogsService({
            page: pageNumber,
            limit: pageSize,
            search,
            action,
            module,
            userId,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
        }),
        keepPreviousData: true
    });

    return {
        ...query,
        pageNumber,
        setPageNumber,
        pageSize,
        setPageSize,
        search,
        setSearch,
        action,
        setAction,
        module,
        setModule,
        userId,
        setUserId,
        dateRange,
        setDateRange
    };
};

export const useGetLogModules = () => {
    return useQuery({
        queryKey: ['admin_activity_log_modules'],
        queryFn: getLogModulesService,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};
