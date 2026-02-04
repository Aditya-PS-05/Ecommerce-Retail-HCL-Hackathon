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
      return authApi.get('/api/auth' + url.replace('/auth', ''), config);
    } else if (url.startsWith('/products') || url.startsWith('/search')) {
      return productsApi.get('/api' + url, config);
    } else if (url.startsWith('/categories')) {
      return categoriesApi.get('/api' + url, config);
    } else if (url.startsWith('/inventory')) {
      return inventoryApi.get('/api' + url, config);
    } else if (url.startsWith('/orders')) {
      return ordersApi.get('/api' + url, config);
    }
    return productsApi.get('/api' + url, config);
  },
  post: async (url, data, config) => {
    if (url.startsWith('/auth')) {
      return authApi.post('/api/auth' + url.replace('/auth', ''), data, config);
    } else if (url.startsWith('/products')) {
      return productsApi.post('/api' + url, data, config);
    } else if (url.startsWith('/categories')) {
      return categoriesApi.post('/api' + url, data, config);
    } else if (url.startsWith('/inventory')) {
      return inventoryApi.post('/api' + url, data, config);
    } else if (url.startsWith('/orders')) {
      return ordersApi.post('/api' + url, data, config);
    }
    return productsApi.post('/api' + url, data, config);
  },
  patch: async (url, data, config) => {
    if (url.startsWith('/auth')) {
      return authApi.patch('/api/auth' + url.replace('/auth', ''), data, config);
    } else if (url.startsWith('/products')) {
      return productsApi.patch('/api' + url, data, config);
    } else if (url.startsWith('/categories')) {
      return categoriesApi.patch('/api' + url, data, config);
    } else if (url.startsWith('/inventory')) {
      return inventoryApi.patch('/api' + url, data, config);
    } else if (url.startsWith('/orders')) {
      return ordersApi.patch('/api' + url, data, config);
    }
    return productsApi.patch('/api' + url, data, config);
  },
  delete: async (url, config) => {
    if (url.startsWith('/auth')) {
      return authApi.delete('/api/auth' + url.replace('/auth', ''), config);
    } else if (url.startsWith('/products')) {
      return productsApi.delete('/api' + url, config);
    } else if (url.startsWith('/categories')) {
      return categoriesApi.delete('/api' + url, config);
    } else if (url.startsWith('/inventory')) {
      return inventoryApi.delete('/api' + url, config);
    } else if (url.startsWith('/orders')) {
      return ordersApi.delete('/api' + url, config);
    }
    return productsApi.delete('/api' + url, config);
  },
};

export default api;
