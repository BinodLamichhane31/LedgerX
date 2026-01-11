import { getProfileApi, loginUserApi, logoutUserApi, registerUserApi, updateProfileApi, uploadProfileImageApi } from "../api/authApi";

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
    console.log("service:",res.data);
    
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