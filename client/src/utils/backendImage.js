export const getBackendImageUrl = (imagePath) => {
    if(!imagePath) return null
    
    // If the path is already a full URL (previous Cloudinary integration), return it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 
        "http://localhost:6060/api"
    
    return `${API_BASE_URL}${imagePath}`;
}