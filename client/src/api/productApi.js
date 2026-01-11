import axios from "./api";
export const addProductApi = async (data) => axios.post(
    '/products',
    data,
     {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }
)
export const getProductsByShopApi = async (params) => axios.get('/products',{params})
export const getProductByIdApi = async (id) => axios.get(`/products/${id}`)
export const updateProductApi = async (id,data) => axios.put(
    `/products/${id}`,
    data,
     {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }
)
export const deleteProductApi = async (id) => axios.delete(`/products/${id}`)