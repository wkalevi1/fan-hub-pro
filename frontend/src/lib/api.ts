import axios from 'axios';
export const API_BASE_URL = '/api';
export const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
