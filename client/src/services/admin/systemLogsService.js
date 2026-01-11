import { getSystemLogsApi } from "../../api/admin/systemLogApi"

export const getSystemLogsService = async (params) => {
    try {
        const response = await getSystemLogsApi(params)
        return response.data
        
    } catch (error) {
        throw error.response?.data?.message || {message:"Failed to fetch users."}
    }
}