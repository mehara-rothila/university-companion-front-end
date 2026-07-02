import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_URL = `${API_BASE_URL}/api/lost-found/messages`;

// Types
export interface UserSummary {
  id: number;
  username: string;
  fullName: string;
  profileImage?: string;
}

export interface ItemSummary {
  id: number;
  title: string;
  type: 'LOST' | 'FOUND';
  imageUrl?: string;
  category: string;
  location: string;
  contactMethod: 'ANONYMOUS' | 'DIRECT';
}

export interface MessageSummary {
  content: string;
  sentAt: string;
  senderId: number;
  isRead: boolean;
}

export interface Conversation {
  id: number;
  item: ItemSummary;
  requester: UserSummary;
  owner: UserSummary;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  initialMessage?: string;
  lastMessage?: MessageSummary;
  unreadCount?: number;
}

export interface Message {
  id: number;
  conversationId: number;
  sender: {
    id: number;
    username: string;
    fullName: string;
    profileImage?: string;
  };
  content: string;
  sentAt: string;
  readAt?: string;
  isRead: boolean;
  messageType: 'TEXT' | 'SYSTEM';
}

export interface ConversationRequest {
  itemId: number;
  initialMessage?: string;
}

export interface MessageRequest {
  conversationId: number;
  content: string;
}

export interface UnreadCounts {
  unreadMessages: number;
  pendingRequests: number;
  total: number;
}

export interface BlockedUser {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  profileImage?: string;
  blockedAt: string;
  reason?: string;
}

export interface BlockUserRequest {
  userId: number;
  reason?: string;
}

export interface ReportUserRequest {
  userId: number;
  reason: string;
  description?: string;
  conversationId?: number;
}

export type ReportReason =
  | 'HARASSMENT'
  | 'SPAM'
  | 'INAPPROPRIATE_CONTENT'
  | 'SCAM'
  | 'FAKE_ITEM'
  | 'OFFENSIVE_LANGUAGE'
  | 'OTHER';

export interface BlockStatus {
  isBlocked: boolean;
  hasBlockedMe: boolean;
  anyBlock: boolean;
}

export interface UserReport {
  id: number;
  reporterId: number;
  reporterUsername: string;
  reporterFullName: string;
  reporterImage?: string;
  reportedUserId: number;
  reportedUsername: string;
  reportedFullName: string;
  reportedUserImage?: string;
  conversationId?: number;
  reason: ReportReason;
  description?: string;
  status: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  reviewedAt?: string;
  reviewedById?: number;
  reviewedByUsername?: string;
  adminNotes?: string;
}

class LostFoundMessageService {
  private api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });
  }

  // ==================== CONVERSATION METHODS ====================

  // Request to start a conversation about an item
  async requestConversation(request: ConversationRequest): Promise<Conversation> {
    try {
      const response = await this.api.post('/conversations/request', request);
      return response.data;
    } catch (error: any) {
      console.error('Error requesting conversation:', error);
      throw error;
    }
  }

  // Get all conversations for current user
  async getConversations(status?: string): Promise<Conversation[]> {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await this.api.get(`/conversations${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Get pending contact requests (as item owner)
  async getPendingRequests(): Promise<Conversation[]> {
    try {
      const response = await this.api.get('/conversations/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  }

  // Approve a contact request
  async approveConversation(conversationId: number): Promise<Conversation> {
    try {
      const response = await this.api.post(`/conversations/${conversationId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving conversation:', error);
      throw error;
    }
  }

  // Reject a contact request
  async rejectConversation(conversationId: number): Promise<Conversation> {
    try {
      const response = await this.api.post(`/conversations/${conversationId}/reject`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting conversation:', error);
      throw error;
    }
  }

  // Close a conversation
  async closeConversation(conversationId: number): Promise<Conversation> {
    try {
      const response = await this.api.post(`/conversations/${conversationId}/close`);
      return response.data;
    } catch (error) {
      console.error('Error closing conversation:', error);
      throw error;
    }
  }

  // ==================== MESSAGE METHODS ====================

  // Send a message
  async sendMessage(request: MessageRequest): Promise<Message> {
    try {
      const response = await this.api.post('/send', request);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get messages for a conversation
  async getMessages(conversationId: number): Promise<Message[]> {
    try {
      const response = await this.api.get(`/conversations/${conversationId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount(): Promise<UnreadCounts> {
    try {
      const response = await this.api.get('/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  // ==================== TYPING INDICATOR METHODS ====================

  // Send typing indicator
  async sendTypingIndicator(conversationId: number, isTyping: boolean): Promise<void> {
    try {
      await this.api.post(`/conversations/${conversationId}/typing?isTyping=${isTyping}`);
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      // Don't throw - typing indicators are not critical
    }
  }

  // ==================== ONLINE STATUS METHODS ====================

  // Update online status
  async updateOnlineStatus(isOnline: boolean): Promise<void> {
    try {
      await this.api.post(`/online-status?isOnline=${isOnline}`);
    } catch (error) {
      console.error('Error updating online status:', error);
      // Don't throw - online status is not critical
    }
  }

  // ==================== BLOCK USER METHODS ====================

  private userApi = axios.create({
    baseURL: `${API_BASE_URL}/api/users`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // User API interceptor initialized in constructor
  private userApiInitialized = false;
  private ensureUserApiInit() {
    if (this.userApiInitialized) return;
    this.userApiInitialized = true;
    this.userApi.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Block a user
  async blockUser(
    request: BlockUserRequest
  ): Promise<{ message: string; blockedUser: BlockedUser }> {
    this.ensureUserApiInit();
    try {
      const response = await this.userApi.post('/block', request);
      return response.data;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }

  // Unblock a user
  async unblockUser(userId: number): Promise<{ message: string }> {
    this.ensureUserApiInit();
    try {
      const response = await this.userApi.delete(`/block/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }

  // Get blocked users list
  async getBlockedUsers(): Promise<BlockedUser[]> {
    this.ensureUserApiInit();
    try {
      const response = await this.userApi.get('/blocked');
      return response.data;
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      throw error;
    }
  }

  // Check block status between current user and another user
  async checkBlockStatus(userId: number): Promise<BlockStatus> {
    this.ensureUserApiInit();
    try {
      const response = await this.userApi.get(`/block/check/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking block status:', error);
      throw error;
    }
  }

  // ==================== REPORT USER METHODS ====================

  // Report a user
  async reportUser(request: ReportUserRequest): Promise<{ message: string; reportId: number }> {
    this.ensureUserApiInit();
    try {
      const response = await this.userApi.post('/report', request);
      return response.data;
    } catch (error) {
      console.error('Error reporting user:', error);
      throw error;
    }
  }

  // Get report reasons
  async getReportReasons(): Promise<ReportReason[]> {
    this.ensureUserApiInit();
    try {
      const response = await this.userApi.get('/report/reasons');
      return response.data;
    } catch (error) {
      console.error('Error fetching report reasons:', error);
      throw error;
    }
  }

  // ==================== ADMIN REPORT METHODS ====================

  // Get all reports (Admin only)
  async getAdminReports(status?: string): Promise<UserReport[]> {
    this.ensureUserApiInit();
    try {
      const params = status ? `?status=${status}` : '';
      const response = await this.userApi.get(`/admin/reports${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin reports:', error);
      throw error;
    }
  }

  // Get pending reports count (Admin only)
  async getPendingReportsCount(): Promise<{ count: number }> {
    this.ensureUserApiInit();
    try {
      const response = await this.userApi.get('/admin/reports/pending-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending reports count:', error);
      throw error;
    }
  }

  // Update report status (Admin only)
  async updateReportStatus(
    reportId: number,
    status: string,
    adminNotes?: string
  ): Promise<{ message: string; report: UserReport }> {
    this.ensureUserApiInit();
    try {
      const response = await this.userApi.put(`/admin/reports/${reportId}`, {
        status,
        adminNotes,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  }

  // Delete report (Admin only)
  async deleteReport(reportId: number): Promise<{ message: string }> {
    this.ensureUserApiInit();
    try {
      const response = await this.userApi.delete(`/admin/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }
}

const lostFoundMessageService = new LostFoundMessageService();
export default lostFoundMessageService;
