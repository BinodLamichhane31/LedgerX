import { getProfileApi, loginUserApi, logoutUserApi, registerUserApi, updateProfileApi, uploadProfileImageApi, changePasswordApi, forgotPasswordApi, resetPasswordApi, getSessionsApi, revokeSessionApi, logoutAllApi } from "../api/authApi";

export const registerUserService = async (formData) =>{
    try {
        const response = await registerUserApi(formData)
        return response.data
        
    } catch (error) {
        throw error.response?.data || {message: "Registration Failed"}
        
    }
}

export const loginUserService = async (formData) =>{
    try {
        const response = await loginUserApi(formData)
        return response.data
        
    } catch (error) {
        throw error.response?.data || {message: "Login Failed"}
        
    }
}

export const logoutUserService = async () =>{
    try {
        const response = await logoutUserApi()
        return response.data
        
    } catch (error) {
        throw error.response?.data || { message: "Logout Failed" };
    }

}

export const getProfileService = async () => {
  try {
    const res = await getProfileApi();
    
    return res.data; 
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};

export const updateProfileService = async (updateData) => {
    try {
        const response = await updateProfileApi(updateData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to update profile" };
    }
}

export const uploadProfileImageService = async (formData) => {
    try {
        const response = await uploadProfileImageApi(formData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to upload image" };
    }
}

export const changePasswordService = async (passwordData) => {
    try {
        const response = await changePasswordApi(passwordData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to change password" };
    }
}

export const forgotPasswordService = async (data) => {
    try {
        const response = await forgotPasswordApi(data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to send reset email" };
    }
}

export const resetPasswordService = async (token, data) => {
    try {
        const response = await resetPasswordApi(token, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to reset password" };
    }
}

// Session management services
export const getSessionsService = async () => {
    try {
        const response = await getSessionsApi();
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch sessions" };
    }
};

export const revokeSessionService = async (sessionId) => {
    try {
        const response = await revokeSessionApi(sessionId);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to revoke session" };
    }
};

export const logoutAllService = async () => {
    try {
        const response = await logoutAllApi();
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to logout from all devices" };
    }
};
