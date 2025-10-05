import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_URL = `${API_BASE_URL}/api`;

export interface FinancialAidApplication {
  id: number;
  title: string;
  description: string;
  aidType: 'SCHOLARSHIP' | 'GRANT' | 'EMERGENCY_FUND' | 'LOAN' | 'WORK_STUDY' | 'CUSTOM';
  category: string;
  requestedAmount: number;
  approvedAmount?: number;
  status: 'DRAFT' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'FUNDED' | 'EXPIRED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isAnonymous: boolean;
  supportingDocuments?: string;
  personalStory?: string;
  adminNotes?: string;
  rejectionReason?: string;
  applicantName?: string;
  applicantId?: number;
  reviewedByName?: string;
  reviewedAt?: string;
  applicationDeadline?: string;
  createdAt: string;
  updatedAt: string;
  isDonationEligible: boolean;
  raisedAmount: number;
  supporterCount: number;
}

export interface FinancialAidRequest {
  title: string;
  description: string;
  aidType: 'SCHOLARSHIP' | 'GRANT' | 'EMERGENCY_FUND' | 'LOAN' | 'WORK_STUDY' | 'CUSTOM';
  category: string;
  requestedAmount: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isAnonymous?: boolean;
  supportingDocuments?: string;
  personalStory?: string;
  applicationDeadline?: string;
  isDonationEligible?: boolean;
}

export interface DonationRequest {
  financialAidId: number;
  amount: number;
  isAnonymous?: boolean;
  message?: string;
}

export interface AdminReviewRequest {
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  approvedAmount?: number;
  adminNotes?: string;
  rejectionReason?: string;
  isDonationEligible?: boolean;
}

export interface FinancialAidStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalApprovedAmount: number;
  totalRaisedAmount: number;
  categories: string[];
}

export interface AdminDashboard {
  totalApplications: number;
  pendingReview: number;
  underReview: number;
  approved: number;
  rejected: number;
  criticalUrgency: number;
  highUrgency: number;
  recentPendingApplications: FinancialAidApplication[];
}

export interface FinancialAidFilters {
  status?: string;
  aidType?: string;
  category?: string;
  urgency?: string;
}

class FinancialAidService {
  private api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get all applications with optional filters
  async getApplications(filters?: FinancialAidFilters): Promise<FinancialAidApplication[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.aidType) {
        params.append('aidType', filters.aidType);
      }
      if (filters?.category) {
        params.append('category', filters.category);
      }
      if (filters?.urgency) {
        params.append('urgency', filters.urgency);
      }

      const response = await this.api.get(`/financial-aid/applications?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching financial aid applications:', error);
      throw error;
    }
  }

  // Get a single application by ID
  async getApplicationById(id: number): Promise<FinancialAidApplication> {
    try {
      const response = await this.api.get(`/financial-aid/applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching financial aid application:', error);
      throw error;
    }
  }

  // Create a new application
  async createApplication(application: FinancialAidRequest): Promise<FinancialAidApplication> {
    try {
      const response = await this.api.post('/financial-aid/applications', application);
      return response.data;
    } catch (error) {
      console.error('Error creating financial aid application:', error);
      throw error;
    }
  }

  // Update an existing application
  async updateApplication(id: number, application: FinancialAidRequest): Promise<FinancialAidApplication> {
    try {
      const response = await this.api.put(`/financial-aid/applications/${id}`, application);
      return response.data;
    } catch (error) {
      console.error('Error updating financial aid application:', error);
      throw error;
    }
  }

  // Delete an application
  async deleteApplication(id: number): Promise<void> {
    try {
      await this.api.delete(`/financial-aid/applications/${id}`);
    } catch (error) {
      console.error('Error deleting financial aid application:', error);
      throw error;
    }
  }

  // Get applications for a specific user
  async getUserApplications(userId: number): Promise<FinancialAidApplication[]> {
    try {
      const response = await this.api.get(`/financial-aid/applications/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user applications:', error);
      throw error;
    }
  }

  // Get donation-eligible applications
  async getDonationEligibleApplications(): Promise<FinancialAidApplication[]> {
    try {
      const response = await this.api.get('/financial-aid/donations');
      return response.data;
    } catch (error) {
      console.error('Error fetching donation-eligible applications:', error);
      throw error;
    }
  }

  // Make a donation
  async makeDonation(donation: DonationRequest): Promise<any> {
    try {
      const response = await this.api.post('/financial-aid/donations', donation);
      return response.data;
    } catch (error) {
      console.error('Error making donation:', error);
      throw error;
    }
  }

  // Get financial aid statistics
  async getStats(): Promise<FinancialAidStats> {
    try {
      const response = await this.api.get('/financial-aid/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching financial aid stats:', error);
      throw error;
    }
  }

  // Admin functions
  async getAdminDashboard(): Promise<AdminDashboard> {
    try {
      const response = await this.api.get('/admin/financial-aid/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      throw error;
    }
  }

  async getAllApplicationsForAdmin(filters?: FinancialAidFilters): Promise<FinancialAidApplication[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.urgency) {
        params.append('urgency', filters.urgency);
      }

      const response = await this.api.get(`/admin/financial-aid/applications?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching applications for admin:', error);
      throw error;
    }
  }

  async getPendingApplicationsForAdmin(): Promise<FinancialAidApplication[]> {
    try {
      const response = await this.api.get('/admin/financial-aid/applications/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending applications:', error);
      throw error;
    }
  }

  async reviewApplication(id: number, review: AdminReviewRequest): Promise<FinancialAidApplication> {
    try {
      const response = await this.api.put(`/admin/financial-aid/applications/${id}/review`, review);
      return response.data;
    } catch (error) {
      console.error('Error reviewing application:', error);
      throw error;
    }
  }

  async updateApplicationStatus(id: number, status: string): Promise<FinancialAidApplication> {
    try {
      const response = await this.api.put(`/admin/financial-aid/applications/${id}/status?status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  async getApplicationsByUrgency(urgency: string): Promise<FinancialAidApplication[]> {
    try {
      const response = await this.api.get(`/admin/financial-aid/applications/by-urgency/${urgency}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching applications by urgency:', error);
      throw error;
    }
  }

  async getApplicationsByCategory(category: string): Promise<FinancialAidApplication[]> {
    try {
      const response = await this.api.get(`/admin/financial-aid/applications/by-category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching applications by category:', error);
      throw error;
    }
  }
}

const financialAidService = new FinancialAidService();
export default financialAidService;