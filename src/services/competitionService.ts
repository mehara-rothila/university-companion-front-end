import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_URL = `${API_BASE_URL}/api/competitions`;

export interface Competition {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  registrationDeadline: string | null;
  category: string;
  location: string;
  prizes: string | null;
  maxParticipants: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  organizerId: number;
  internalEnrollmentEnabled: boolean;
  externalEnrollmentUrl: string | null;
  createdAt: string;
  rejectionReason: string | null;
  enrollmentCount?: number;
  formFields?: FormField[];
  organizerName?: string;
  organizerEmail?: string;
}

export interface FormField {
  id?: number;
  competitionId?: number;
  fieldLabel: string;
  fieldType: 'TEXT' | 'EMAIL' | 'PHONE' | 'NUMBER' | 'TEXTAREA' | 'DROPDOWN' | 'CHECKBOX' | 'DATE';
  required: boolean;
  order: number;
  options?: string | null; // JSON string for dropdown/checkbox options
  placeholder?: string | null;
}

export interface Enrollment {
  id: number;
  userId: number;
  competitionId: number;
  formResponses: string; // JSON string
  enrolledAt: string;
  userName?: string;
  userEmail?: string;
}

export interface CreateCompetitionData {
  title: string;
  description: string;
  imageUrl?: string | null;
  startDate: string;
  endDate: string;
  registrationDeadline?: string | null;
  category: string;
  location: string;
  prizes?: string | null;
  maxParticipants?: number | null;
  organizerId: number;
  internalEnrollmentEnabled: boolean;
  externalEnrollmentUrl?: string | null;
  formFields?: Omit<FormField, 'id' | 'competitionId'>[];
}

export interface EnrollmentData {
  userId: number;
  formResponses: string; // JSON string of form responses
}

export const competitionService = {
  // Get all approved upcoming competitions
  getApprovedCompetitions: async (): Promise<Competition[]> => {
    try {
      const response = await axios.get(`${API_URL}/approved`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching approved competitions:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Get competition by ID with form fields
  getCompetitionById: async (id: number): Promise<Competition> => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching competition:', error);
      throw error;
    }
  },

  // Get competitions created by a user
  getMyCompetitions: async (organizerId: number): Promise<Competition[]> => {
    try {
      const response = await axios.get(`${API_URL}/my-competitions/${organizerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my competitions:', error);
      throw error;
    }
  },

  // Create a new competition
  createCompetition: async (competitionData: CreateCompetitionData): Promise<{ id: number; message: string }> => {
    try {
      const response = await axios.post(API_URL, competitionData);
      return response.data;
    } catch (error) {
      console.error('Error creating competition:', error);
      throw error;
    }
  },

  // Enroll in a competition
  enrollInCompetition: async (competitionId: number, enrollmentData: EnrollmentData): Promise<{ message: string }> => {
    try {
      const response = await axios.post(`${API_URL}/${competitionId}/enroll`, enrollmentData);
      return response.data;
    } catch (error) {
      console.error('Error enrolling in competition:', error);
      throw error;
    }
  },

  // Withdraw from a competition
  withdrawFromCompetition: async (competitionId: number, userId: number): Promise<{ message: string }> => {
    try {
      const response = await axios.post(`${API_URL}/${competitionId}/withdraw`, null, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error withdrawing from competition:', error);
      throw error;
    }
  },

  // Check if user is enrolled in a competition
  isUserEnrolled: async (competitionId: number, userId: number): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_URL}/${competitionId}/is-enrolled`, {
        params: { userId }
      });
      return response.data.isEnrolled;
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      throw error;
    }
  },

  // Get enrollments for a competition (organizer only)
  getCompetitionEnrollments: async (competitionId: number, organizerId: number): Promise<Enrollment[]> => {
    try {
      const response = await axios.get(`${API_URL}/${competitionId}/enrollments`, {
        params: { organizerId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }
  },

  // Export enrollments as CSV (organizer only)
  exportEnrollments: async (competitionId: number, organizerId: number): Promise<void> => {
    try {
      const response = await axios.get(`${API_URL}/${competitionId}/enrollments/export`, {
        params: { organizerId },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `enrollments_${competitionId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting enrollments:', error);
      throw error;
    }
  },

  // Admin: Get pending competitions (authorization via JWT token in header)
  getPendingCompetitions: async (): Promise<Competition[]> => {
    try {
      const response = await axios.get(`${API_URL}/admin/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending competitions:', error);
      throw error;
    }
  },

  // Admin: Approve competition
  approveCompetition: async (competitionId: number): Promise<{ message: string }> => {
    try {
      const response = await axios.post(`${API_URL}/${competitionId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving competition:', error);
      throw error;
    }
  },

  // Admin: Reject competition
  rejectCompetition: async (competitionId: number, reason: string): Promise<{ message: string }> => {
    try {
      const response = await axios.post(`${API_URL}/${competitionId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting competition:', error);
      throw error;
    }
  },

  // Admin: Hide competition
  hideCompetition: async (competitionId: number): Promise<{ message: string }> => {
    try {
      const response = await axios.post(`${API_URL}/${competitionId}/hide`);
      return response.data;
    } catch (error) {
      console.error('Error hiding competition:', error);
      throw error;
    }
  },

  // Admin: Unhide competition
  unhideCompetition: async (competitionId: number): Promise<{ message: string }> => {
    try {
      const response = await axios.post(`${API_URL}/${competitionId}/unhide`);
      return response.data;
    } catch (error) {
      console.error('Error unhiding competition:', error);
      throw error;
    }
  },

  // Admin: Get all competitions (all statuses)
  getAllCompetitions: async (): Promise<Competition[]> => {
    try {
      const response = await axios.get(`${API_URL}/admin/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all competitions:', error);
      throw error;
    }
  },

  // Admin: Delete competition permanently
  deleteCompetition: async (competitionId: number): Promise<{ message: string }> => {
    try {
      const response = await axios.delete(`${API_URL}/${competitionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting competition:', error);
      throw error;
    }
  },
};
