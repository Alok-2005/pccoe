// File: web/src/api/services.ts
import client from './client';

// Auth services
export const authAPI = {
  register: (data: any) => client.post('/auth/register', data),
  login: (data: any) => client.post('/auth/login', data),
  getCurrentUser: () => client.get('/auth/me'),
  updateProfile: (data: any) => client.put('/auth/profile', data),
};

// Prediction services
export const predictionAPI = {
  getPrediction: (data?: any) => client.post('/predict', data),
  getHistory: (userId: string, limit?: number) => 
    client.get(`/predict/history/${userId}`, { params: { limit } }),
  getStats: () => client.get('/predict/stats'),
};

// Report services
export const reportAPI = {
  generateReport: (data?: any) => client.post('/reports/generate', data),
  getUserReports: (userId: string) => client.get(`/reports/user/${userId}`),
  downloadReport: (reportId: string) => 
    client.get(`/reports/${reportId}`, { responseType: 'blob' }),
};

// Family services
export const familyAPI = {
  createFamily: (data: any) => client.post('/families', data),
  getFamily: (familyId: string) => client.get(`/families/${familyId}`),
  addMember: (familyId: string, data: any) => 
    client.post(`/families/${familyId}/members`, data),
  updateMember: (familyId: string, memberId: string, data: any) => 
    client.put(`/families/${familyId}/members/${memberId}`, data),
  getFamilyAlerts: (familyId: string) => 
    client.get(`/families/${familyId}/alerts`),
};

// Assistant services
export const assistantAPI = {
  chat: (data: any) => client.post('/assistant/chat', data),
  getHistory: (userId: string) => client.get(`/assistant/history/${userId}`),
  clearConversation: (conversationId: string) => 
    client.delete(`/assistant/conversation/${conversationId}`),
};

// Environment services
export const environmentAPI = {
  getByCity: (city: string) => client.get(`/environment/${city}`),
  getByCoordinates: (lat: number, lng: number) => 
    client.get('/environment/coords', { params: { lat, lng } }),
};

// Admin services
export const adminAPI = {
  getDashboard: () => client.get('/admin/dashboard'),
  getRiskHeatmap: (params?: any) => client.get('/admin/risk-heatmap', { params }),
  uploadDataset: (data: any) => client.post('/admin/datasets', data),
};