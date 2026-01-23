import axios from "./api";
export const registerUserApi = (data) => axios.post("/auth/register",data)
export const loginUserApi = (data) => axios.post("/auth/login",data,{withCredentials:true})
export const logoutUserApi = () => axios.post("/auth/logout", {}, { withCredentials: true });
export const getProfileApi = () => axios.get("/auth/profile", { withCredentials: true });
export const updateProfileApi = (data) => axios.put("/auth/profile", data, { withCredentials: true });
export const changePasswordApi = (data) => axios.put("/auth/change-password", data, { withCredentials: true });
export const forgotPasswordApi = (data) => axios.post("/auth/forgot-password", data);
export const resetPasswordApi = (token, data) => axios.put(`/auth/reset-password/${token}`, data);
export const uploadProfileImageApi = (formData) => {
  return axios.put("/auth/upload-profile-image", formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
// Session management
export const getSessionsApi = () => axios.get("/auth/sessions", { withCredentials: true });
export const revokeSessionApi = (sessionId) => axios.delete(`/auth/sessions/${sessionId}`, { withCredentials: true });
export const logoutAllApi = () => axios.post("/auth/logout-all", {}, { withCredentials: true });
export const refreshTokenApi = () => axios.post("/auth/refresh", {}, { withCredentials: true });
