import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create axios instance with interceptor for authentication
const api = axios.create({
  baseURL: `${API_URL}/api/files`,
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

export interface UserFile {
  id: number;
  fileUrl: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'video';
  source: 'lost_found' | 'book_photo' | 'book_pdf' | 'chatbot_upload';
  sourceTitle: string;
  fileSize: number | null;
  uploadedAt: string;
  category: string;
}

export interface FileStats {
  totalFiles: number;
  imageCount: number;
  pdfCount: number;
  videoCount?: number;
  totalStorageBytes: number;
  totalStorageMB: number;
  breakdown: {
    lostFoundImages: number;
    bookPhotos: number;
    bookPdfs: number;
    chatbotUploads?: number;
    chatbotImages?: number;
    chatbotPdfs?: number;
    chatbotVideos?: number;
  };
}

export const fileManagementService = {
  // Get all files for a user
  getUserFiles: async (userId: number): Promise<UserFile[]> => {
    try {
      const response = await api.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user files:', error);
      throw error;
    }
  },

  // Get file statistics for a user
  getUserFileStats: async (userId: number): Promise<FileStats> => {
    try {
      const response = await api.get(`/user/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching file stats:', error);
      throw error;
    }
  },

  // Delete a lost & found image
  deleteLostFoundImage: async (itemId: number, userId: number): Promise<void> => {
    try {
      await api.delete(`/lost-found/${itemId}/image`, {
        params: { userId }
      });
    } catch (error) {
      console.error('Error deleting lost & found image:', error);
      throw error;
    }
  },

  // Delete a book photo
  deleteBookPhoto: async (bookId: number, userId: number): Promise<void> => {
    try {
      await api.delete(`/book/${bookId}/photo`, {
        params: { userId }
      });
    } catch (error) {
      console.error('Error deleting book photo:', error);
      throw error;
    }
  },

  // Delete a book PDF
  deleteBookPdf: async (bookId: number, userId: number): Promise<void> => {
    try {
      await api.delete(`/book/${bookId}/pdf`, {
        params: { userId }
      });
    } catch (error) {
      console.error('Error deleting book PDF:', error);
      throw error;
    }
  },

  // Delete a chatbot upload
  deleteChatbotUpload: async (uploadId: number, userId: number): Promise<void> => {
    try {
      await api.delete(`/chatbot-upload/${uploadId}`, {
        params: { userId }
      });
    } catch (error) {
      console.error('Error deleting chatbot upload:', error);
      throw error;
    }
  },

  // Format file size for display
  formatFileSize: (bytes: number | null): string => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;

    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    if (kb >= 1) return `${kb.toFixed(2)} KB`;
    return `${bytes} bytes`;
  },

  // Get source display name
  getSourceDisplayName: (source: string): string => {
    switch (source) {
      case 'lost_found':
        return 'Lost & Found';
      case 'book_photo':
        return 'Book Photo';
      case 'book_pdf':
        return 'Book PDF';
      case 'chatbot_upload':
        return 'Chatbot Upload';
      default:
        return source;
    }
  },
};
