import axios from '../../api/api'; // Configured axios instance

export const getActivityLogsService = async ({ page = 1, limit = 20, search = '', action, module, startDate, endDate, userId }) => {
    const params = {
        page,
        limit,
        search,
        action,
        module,
        startDate,
        endDate,
        userId
    };
    // Filter out undefined/null/empty strings to keep URL clean
    Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
            delete params[key];
        }
    });

    const response = await axios.get('/admin/activity-logs', { params });
    return response.data;
};

export const getLogModulesService = async () => {
    const response = await axios.get('/admin/activity-logs/modules');
    return response.data;
};
