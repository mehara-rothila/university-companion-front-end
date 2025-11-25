import axios from 'axios';
import type {
  StudentAchievement,
  CreateAchievementRequest,
  UpdateAchievementRequest,
  AchievementComment,
} from '@/types/achievement';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const BASE_URL = `${API_URL}/api/achievements`;

export const achievementService = {
  // Achievement CRUD operations
  createAchievement: async (achievementData: CreateAchievementRequest): Promise<{ achievementId: number; message: string }> => {
    const response = await axios.post(BASE_URL, achievementData);
    return response.data;
  },

  getApprovedAchievements: async (): Promise<StudentAchievement[]> => {
    const response = await axios.get(`${BASE_URL}/approved`);
    return response.data;
  },

  getApprovedAchievementsByCategory: async (category: string): Promise<StudentAchievement[]> => {
    const response = await axios.get(`${BASE_URL}/approved/category/${category}`);
    return response.data;
  },

  getAchievementsByStudent: async (studentId: number): Promise<StudentAchievement[]> => {
    const response = await axios.get(`${BASE_URL}/student/${studentId}`);
    return response.data;
  },

  getAchievementById: async (id: number): Promise<StudentAchievement> => {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  getPopularAchievements: async (): Promise<StudentAchievement[]> => {
    const response = await axios.get(`${BASE_URL}/popular`);
    return response.data;
  },

  getRecentAchievements: async (): Promise<StudentAchievement[]> => {
    const response = await axios.get(`${BASE_URL}/recent`);
    return response.data;
  },

  updateAchievement: async (
    id: number,
    userId: number,
    achievementData: UpdateAchievementRequest
  ): Promise<{ message: string; achievement: StudentAchievement }> => {
    const response = await axios.put(`${BASE_URL}/${id}`, achievementData, {
      params: { userId },
    });
    return response.data;
  },

  deleteAchievement: async (id: number, userId: number): Promise<{ message: string }> => {
    const response = await axios.delete(`${BASE_URL}/${id}`, {
      params: { userId },
    });
    return response.data;
  },

  // Admin operations
  getPendingAchievements: async (adminId: number): Promise<StudentAchievement[]> => {
    const response = await axios.get(`${BASE_URL}/admin/pending`, {
      params: { adminId },
    });
    return response.data;
  },

  approveAchievement: async (achievementId: number, adminId: number): Promise<{ message: string }> => {
    const response = await axios.post(`${BASE_URL}/${achievementId}/approve`, null, {
      params: { adminId },
    });
    return response.data;
  },

  rejectAchievement: async (
    achievementId: number,
    adminId: number,
    data: { reason: string }
  ): Promise<{ message: string }> => {
    const response = await axios.post(`${BASE_URL}/${achievementId}/reject`, data, {
      params: { adminId },
    });
    return response.data;
  },

  hideAchievement: async (achievementId: number, adminId: number): Promise<{ message: string }> => {
    const response = await axios.post(`${BASE_URL}/${achievementId}/hide`, null, {
      params: { adminId },
    });
    return response.data;
  },

  unhideAchievement: async (achievementId: number, adminId: number): Promise<{ message: string }> => {
    const response = await axios.post(`${BASE_URL}/${achievementId}/unhide`, null, {
      params: { adminId },
    });
    return response.data;
  },

  // Engagement operations
  likeAchievement: async (achievementId: number): Promise<{ message: string }> => {
    const response = await axios.post(`${BASE_URL}/${achievementId}/like`);
    return response.data;
  },

  unlikeAchievement: async (achievementId: number): Promise<{ message: string }> => {
    const response = await axios.post(`${BASE_URL}/${achievementId}/unlike`);
    return response.data;
  },

  shareAchievement: async (achievementId: number): Promise<{ message: string }> => {
    const response = await axios.post(`${BASE_URL}/${achievementId}/share`);
    return response.data;
  },

  // Comment operations
  addComment: async (
    achievementId: number,
    userId: number,
    comment: string
  ): Promise<{ message: string; commentId: number }> => {
    const response = await axios.post(
      `${BASE_URL}/${achievementId}/comments`,
      { comment },
      { params: { userId } }
    );
    return response.data;
  },

  getComments: async (achievementId: number): Promise<AchievementComment[]> => {
    const response = await axios.get(`${BASE_URL}/${achievementId}/comments`);
    return response.data;
  },

  deleteComment: async (commentId: number, userId: number): Promise<{ message: string }> => {
    const response = await axios.delete(`${BASE_URL}/comments/${commentId}`, {
      params: { userId },
    });
    return response.data;
  },
};
