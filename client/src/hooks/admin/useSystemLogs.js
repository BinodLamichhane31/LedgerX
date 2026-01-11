import { useQuery } from "@tanstack/react-query";
import { getSystemLogsService } from "../../services/admin/systemLogsService";


export const useGetSystemLogs = (params) => {
  return useQuery({
    queryKey: ["systemLogs", params],
    queryFn: () => getSystemLogsService(params),
    keepPreviousData: true,
    retry: 1,
    staleTime: 1000 * 60, 
  });
};
