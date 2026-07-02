import axios from 'axios';
import type {
  StudentAchievement,
  CreateAchievementRequest,
  UpdateAchievementRequest,
  AchievementComment,
} from '@/types/achievement';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const BASE_URL = `${API_URL}/api/achievements`;

// Create axios instance with interceptor for authentication
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const achievementService = {
  // Achievement CRUD operations
  createAchievement: async (
    achievementData: CreateAchievementRequest
  ): Promise<{ achievementId: number; message: string }> => {
    const response = await api.post('', achievementData);
    return response.data;
  },

  getApprovedAchievements: async (): Promise<StudentAchievement[]> => {
    const response = await api.get('/approved');
    return response.data;
  },

  getApprovedAchievementsByCategory: async (category: string): Promise<StudentAchievement[]> => {
    const response = await api.get(`/approved/category/${category}`);
    return response.data;
  },

  getAchievementsByStudent: async (studentId: number): Promise<StudentAchievement[]> => {
    const response = await api.get(`/student/${studentId}`);
    return response.data;
  },

  getAchievementById: async (id: number): Promise<StudentAchievement> => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  getPopularAchievements: async (): Promise<StudentAchievement[]> => {
    const response = await api.get('/popular');
    return response.data;
  },

  getRecentAchievements: async (): Promise<StudentAchievement[]> => {
    const response = await api.get('/recent');
    return response.data;
  },

  updateAchievement: async (
    id: number,
    achievementData: UpdateAchievementRequest
  ): Promise<{ message: string; achievement: StudentAchievement }> => {
    const response = await api.put(`/${id}`, achievementData);
    return response.data;
  },

  deleteAchievement: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  // Admin operations (authorization via JWT token in header)
  getPendingAchievements: async (): Promise<StudentAchievement[]> => {
    const response = await api.get('/admin/pending');
    return response.data;
  },

  getAllAchievements: async (): Promise<StudentAchievement[]> => {
    const response = await api.get('/admin/all');
    return response.data;
  },

  approveAchievement: async (achievementId: number): Promise<{ message: string }> => {
    const response = await api.post(`/${achievementId}/approve`);
    return response.data;
  },

  rejectAchievement: async (
    achievementId: number,
    data: { reason: string }
  ): Promise<{ message: string }> => {
    const response = await api.post(`/${achievementId}/reject`, data);
    return response.data;
  },

  hideAchievement: async (achievementId: number): Promise<{ message: string }> => {
    const response = await api.post(`/${achievementId}/hide`);
    return response.data;
  },

  unhideAchievement: async (achievementId: number): Promise<{ message: string }> => {
    const response = await api.post(`/${achievementId}/unhide`);
    return response.data;
  },

  updateAchievementImage: async (
    achievementId: number,
    imageUrl: string | null
  ): Promise<{ message: string }> => {
    const response = await api.put(`/${achievementId}/image`, { imageUrl });
    return response.data;
  },

  // Engagement operations
  likeAchievement: async (achievementId: number): Promise<{ message: string }> => {
    const response = await api.post(`/${achievementId}/like`);
    return response.data;
  },

  unlikeAchievement: async (achievementId: number): Promise<{ message: string }> => {
    const response = await api.post(`/${achievementId}/unlike`);
    return response.data;
  },

  shareAchievement: async (achievementId: number): Promise<{ message: string }> => {
    const response = await api.post(`/${achievementId}/share`);
    return response.data;
  },

  // Comment operations
  addComment: async (
    achievementId: number,
    comment: string
  ): Promise<{ message: string; commentId: number }> => {
    const response = await api.post(`/${achievementId}/comments`, { comment });
    return response.data;
  },

  getComments: async (achievementId: number): Promise<AchievementComment[]> => {
    const response = await api.get(`/${achievementId}/comments`);
    return response.data;
  },

  deleteComment: async (commentId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};
