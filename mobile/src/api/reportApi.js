import api from './axiosConfig';

// Submit feedback or a concern/report (visible to admin in the Admin Panel)
// NOTE: reports are mounted under /api/user (userRoutes), so the path is /user/reports
export const submitReport = async ({ type = 'feedback', subject, message, rating = null }) => {
  const response = await api.post('/user/reports', { type, subject, message, rating });
  return response.data;
};
