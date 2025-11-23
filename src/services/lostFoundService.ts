import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_URL = `${API_BASE_URL}/api`;

export interface LostFoundItem {
  id: number;
  type: 'LOST' | 'FOUND';
  title: string;
  description: string;
  category: string;
  location: string;
  dateReported: string;
  imageUrl?: string;
  reward?: number;
  contactMethod: 'ANONYMOUS' | 'DIRECT';
  status: 'PENDING' | 'ACTIVE' | 'RESOLVED' | 'EXPIRED' | 'REJECTED';
  postedBy: string;
  postedByUserId: number;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LostFoundItemRequest {
  type: 'LOST' | 'FOUND';
  title: string;
  description: string;
  category: string;
  location: string;
  imageUrl?: string;
  reward?: number;
  contactMethod: 'ANONYMOUS' | 'DIRECT';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  tags?: string[];
}

export interface LostFoundStats {
  totalItems: number;
  lostItems: number;
  foundItems: number;
  resolvedItems: number;
  categories: string[];
  locations: string[];
}

export interface LostFoundFilters {
  type?: string;
  category?: string;
  location?: string;
  search?: string;
  status?: string;
}

class LostFoundService {
  private api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get all items with optional filters
  async getItems(filters?: LostFoundFilters): Promise<LostFoundItem[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters?.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters?.location && filters.location !== 'all') {
        params.append('location', filters.location);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }

      const response = await this.api.get(`/lost-found/items?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching lost-found items:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        params: filters
      });
      throw error;
    }
  }

  // Get a single item by ID
  async getItemById(id: number): Promise<LostFoundItem> {
    try {
      const response = await this.api.get(`/lost-found/items/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lost-found item:', error);
      throw error;
    }
  }

  // Create a new item
  async createItem(item: LostFoundItemRequest): Promise<LostFoundItem> {
    try {
      const response = await this.api.post('/lost-found/items', item);
      return response.data;
    } catch (error) {
      console.error('Error creating lost-found item:', error);
      throw error;
    }
  }

  // Update an existing item
  async updateItem(id: number, item: LostFoundItemRequest): Promise<LostFoundItem> {
    try {
      const response = await this.api.put(`/lost-found/items/${id}`, item);
      return response.data;
    } catch (error) {
      console.error('Error updating lost-found item:', error);
      throw error;
    }
  }

  // Update item status
  async updateItemStatus(id: number, status: string): Promise<LostFoundItem> {
    try {
      const response = await this.api.put(`/lost-found/items/${id}/status?status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Error updating item status:', error);
      throw error;
    }
  }

  // Delete an item
  async deleteItem(id: number): Promise<void> {
    try {
      await this.api.delete(`/lost-found/items/${id}`);
    } catch (error) {
      console.error('Error deleting lost-found item:', error);
      throw error;
    }
  }

  // Get items posted by a specific user
  async getUserItems(userId: number): Promise<LostFoundItem[]> {
    try {
      const response = await this.api.get(`/lost-found/items/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user items:', error);
      throw error;
    }
  }

  // Get statistics
  async getStats(): Promise<LostFoundStats> {
    try {
      const response = await this.api.get('/lost-found/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching lost-found stats:', error);
      throw error;
    }
  }

  // Admin: Get pending items for review
  async getPendingItems(adminId: number): Promise<LostFoundItem[]> {
    try {
      const response = await this.api.get(`/lost-found/admin/pending?adminId=${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending items:', error);
      throw error;
    }
  }

  // Admin: Approve an item
  async approveItem(itemId: number, adminId: number): Promise<LostFoundItem> {
    try {
      const response = await this.api.post(`/lost-found/${itemId}/approve?adminId=${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error approving item:', error);
      throw error;
    }
  }

  // Admin: Reject an item
  async rejectItem(itemId: number, adminId: number): Promise<LostFoundItem> {
    try {
      const response = await this.api.post(`/lost-found/${itemId}/reject?adminId=${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting item:', error);
      throw error;
    }
  }
}

const lostFoundService = new LostFoundService();
export default lostFoundService;