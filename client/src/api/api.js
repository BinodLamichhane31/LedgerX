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

export default instance;