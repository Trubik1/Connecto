import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30s total timeout — prevents buttons from getting stuck forever
});
export default api;