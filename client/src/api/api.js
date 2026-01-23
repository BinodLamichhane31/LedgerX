import axios  from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:6060/api"
axios.defaults.withCredentials = true;

const instance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type':'application/json'
    }
})

// CSRF Protection: Read XSRF-TOKEN cookie and send it in header
instance.interceptors.request.use(
    (config) => {
        // Get CSRF token from cookie
        const csrfToken = getCookie('XSRF-TOKEN');
        
        if (csrfToken) {
            // Add CSRF token to all requests (middleware will verify for state-changing methods)
            config.headers['x-csrf-token'] = csrfToken;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Helper function to get cookie value by name
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
}

export default instance;