export const getBackendImageUrl = (imagePath) => {
    if(!imagePath) return null
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 
        "http://localhost:6060/api"
    
    return `${API_BASE_URL}${imagePath}`;
}