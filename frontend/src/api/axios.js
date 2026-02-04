import axios from 'axios';

const createApiInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - attach token to requests
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors globally
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const { response } = error;
      
      if (response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create API instances for each microservice
export const authApi = createApiInstance(process.env.REACT_APP_AUTH_API_URL);
export const productsApi = createApiInstance(process.env.REACT_APP_PRODUCTS_API_URL);
export const categoriesApi = createApiInstance(process.env.REACT_APP_CATEGORIES_API_URL);
export const inventoryApi = createApiInstance(process.env.REACT_APP_INVENTORY_API_URL);
export const ordersApi = createApiInstance(process.env.REACT_APP_ORDERS_API_URL);

// Default export for backward compatibility (uses products API)
const api = {
  get: async (url, config) => {
    if (url.startsWith('/auth')) {
      return authApi.get(url.replace('/auth', ''), config);
    } else if (url.startsWith('/products') || url.startsWith('/search')) {
      return productsApi.get(url, config);
    } else if (url.startsWith('/categories')) {
      return categoriesApi.get(url, config);
    } else if (url.startsWith('/inventory')) {
      return inventoryApi.get(url.replace('/inventory', ''), config);
    } else if (url.startsWith('/orders')) {
      return ordersApi.get(url.replace('/orders', '/api/orders'), config);
    }
    return productsApi.get(url, config);
  },
  post: async (url, data, config) => {
    if (url.startsWith('/auth')) {
      return authApi.post('/api/auth' + url.replace('/auth', ''), data, config);
    } else if (url.startsWith('/products')) {
      return productsApi.post(url, data, config);
    } else if (url.startsWith('/categories')) {
      return categoriesApi.post(url, data, config);
    } else if (url.startsWith('/inventory')) {
      return inventoryApi.post(url.replace('/inventory', ''), data, config);
    } else if (url.startsWith('/orders')) {
      return ordersApi.post(url.replace('/orders', '/api/orders'), data, config);
    }
    return productsApi.post(url, data, config);
  },
  patch: async (url, data, config) => {
    if (url.startsWith('/auth')) {
      return authApi.patch('/api/auth' + url.replace('/auth', ''), data, config);
    } else if (url.startsWith('/products')) {
      return productsApi.patch(url, data, config);
    } else if (url.startsWith('/categories')) {
      return categoriesApi.patch(url, data, config);
    } else if (url.startsWith('/inventory')) {
      return inventoryApi.patch(url.replace('/inventory', ''), data, config);
    } else if (url.startsWith('/orders')) {
      return ordersApi.patch(url.replace('/orders', '/api/orders'), data, config);
    }
    return productsApi.patch(url, data, config);
  },
  delete: async (url, config) => {
    if (url.startsWith('/auth')) {
      return authApi.delete('/api/auth' + url.replace('/auth', ''), config);
    } else if (url.startsWith('/products')) {
      return productsApi.delete(url, config);
    } else if (url.startsWith('/categories')) {
      return categoriesApi.delete(url, config);
    } else if (url.startsWith('/inventory')) {
      return inventoryApi.delete(url.replace('/inventory', ''), config);
    } else if (url.startsWith('/orders')) {
      return ordersApi.delete(url.replace('/orders', '/api/orders'), config);
    }
    return productsApi.delete(url, config);
  },
};

export default api;
