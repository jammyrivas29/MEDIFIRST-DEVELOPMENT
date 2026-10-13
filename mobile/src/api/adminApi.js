import api from './axiosConfig';

// ── Admin: Stats & Users ──
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const setUserActive = async (id, isActive) => {
  const response = await api.patch(`/admin/users/${id}/active`, { isActive });
  return response.data;
};

// ── Admin: Emergency Hotlines (CRUD) ──
export const getAdminHotlines = async () => {
  const response = await api.get('/admin/hotlines');
  return response.data;
};
export const createHotline = async (payload) => {
  const response = await api.post('/admin/hotlines', payload);
  return response.data;
};
export const updateHotline = async (id, payload) => {
  const response = await api.put(`/admin/hotlines/${id}`, payload);
  return response.data;
};
export const deleteHotline = async (id) => {
  const response = await api.delete(`/admin/hotlines/${id}`);
  return response.data;
};
export const getPublicHotlines = async () => {
  const response = await api.get('/hotlines');
  return response.data;
};

// ── Admin: System Settings ──
export const getSystemSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};
export const updateSystemSetting = async (key, payload) => {
  const response = await api.put(`/admin/settings/${key}`, payload);
  return response.data;
};

// ── Admin: Notifications (alerts) ──
export const createNotification = async (payload) => {
  const response = await api.post('/admin/notifications', payload);
  return response.data;
};

export const getAdminNotifications = async () => {
  const response = await api.get('/admin/notifications');
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/admin/notifications/${id}`);
  return response.data;
};

// ── User-facing: received notifications/alerts from admin ──
export const getUserNotifications = async () => {
  const response = await api.get('/user/notifications');
  return response.data;
};

// ── Public (guest) view: active admin broadcasts, no auth needed ──
export const getPublicNotifications = async () => {
  const response = await api.get('/notifications/public');
  return response.data;
};

export const deleteMyNotification = async (id) => {
  const response = await api.delete(`/user/notifications/${id}`);
  return response.data;
};

// ── Admin: Reports (incidents / concerns) ──
export const getAdminReports = async () => {
  const response = await api.get('/admin/reports');
  return response.data;
};

// ── Admin: Activity logs ──
export const getAdminActivity = async () => {
  const response = await api.get('/admin/activity');
  return response.data;
};

// ── First-aid content management ──
export const getAllGuidesAdmin = async () => {
  const response = await api.get('/first-aid');
  return response.data;
};

export const deleteGuide = async (id) => {
  const response = await api.delete(`/first-aid/${id}`);
  return response.data;
};

// ── Hospitals (admin CRUD + public read) ──
export const getHospitals = async () => {
  const response = await api.get('/hospitals');
  return response.data;
};

export const createHospital = async (payload) => {
  const response = await api.post('/hospitals/admin', payload);
  return response.data;
};

export const updateHospital = async (id, payload) => {
  const response = await api.put(`/hospitals/admin/${id}`, payload);
  return response.data;
};

export const deleteHospital = async (id) => {
  const response = await api.delete(`/hospitals/admin/${id}`);
  return response.data;
};

// ── Chatbot responses (admin CRUD + public match) ──
export const getChatbotResponses = async () => {
  const response = await api.get('/chatbot/admin');
  return response.data;
};

export const createChatbotResponse = async (payload) => {
  const response = await api.post('/chatbot/admin', payload);
  return response.data;
};

export const updateChatbotResponse = async (id, payload) => {
  const response = await api.put(`/chatbot/admin/${id}`, payload);
  return response.data;
};

export const deleteChatbotResponse = async (id) => {
  const response = await api.delete(`/chatbot/admin/${id}`);
  return response.data;
};
