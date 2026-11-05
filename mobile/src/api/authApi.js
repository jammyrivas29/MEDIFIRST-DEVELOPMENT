import api from './axiosConfig';

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const verifyResetCode = async (email, code) => {
  const response = await api.post('/auth/verify-reset-code', { email, code });
  return response.data;
};

export const resetPasswordWithCode = async (email, code, password) => {
  const response = await api.post('/auth/reset-password-code', { email, code, password });
  return response.data;
};
