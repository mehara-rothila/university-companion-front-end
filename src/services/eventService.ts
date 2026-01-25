import axios from 'axios';
import type {
  Event,
  EventRegistration,
  EventComment,
  CreateEventRequest,
  UpdateEventRequest,
  RegisterEventRequest,
  RejectEventRequest,
  AddCommentRequest,
} from '@/types/event';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const BASE_URL = `${API_URL}/api/events`;

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

export const eventService = {
  // Event CRUD operations
  createEvent: async (eventData: CreateEventRequest): Promise<{ id: number; message: string }> => {
    const response = await api.post('', eventData);
    return response.data;
  },

  getApprovedEvents: async (): Promise<Event[]> => {
    const response = await api.get('/approved');
    return response.data;
  },

  getAllEvents: async (): Promise<Event[]> => {
    const response = await api.get('/admin/all');
    return response.data;
  },

  getUpcomingEvents: async (): Promise<Event[]> => {
    const response = await api.get('/upcoming');
    return response.data;
  },

  getPastEvents: async (): Promise<Event[]> => {
    const response = await api.get('/past');
    return response.data;
  },

  getEventsByCategory: async (category: string): Promise<Event[]> => {
    const response = await api.get(`/category/${category}`);
    return response.data;
  },

  getEventById: async (id: number): Promise<Event> => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  getMyEvents: async (creatorId: number): Promise<Event[]> => {
    const response = await api.get(`/my-events/${creatorId}`);
    return response.data;
  },

  updateEvent: async (id: number, eventData: UpdateEventRequest): Promise<{ message: string }> => {
    const response = await api.put(`/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id: number, userId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/${id}`, {
      params: { userId },
    });
    return response.data;
  },

  // Registration operations
  registerForEvent: async (
    eventId: number,
    registrationData: RegisterEventRequest
  ): Promise<{ message: string; status: string }> => {
    const response = await api.post(`/${eventId}/register`, registrationData);
    return response.data;
  },

  cancelRegistration: async (eventId: number, userId: number): Promise<{ message: string }> => {
    const response = await api.post(`/${eventId}/cancel-registration`, null, {
      params: { userId },
    });
    return response.data;
  },

  getEventRegistrations: async (eventId: number, creatorId: number): Promise<EventRegistration[]> => {
    const response = await api.get(`/${eventId}/registrations`, {
      params: { creatorId },
    });
    return response.data;
  },

  isUserRegistered: async (
    eventId: number,
    userId: number
  ): Promise<{ isRegistered: boolean; isWaitlisted: boolean; status: string }> => {
    const response = await api.get(`/${eventId}/is-registered`, {
      params: { userId },
    });
    return response.data;
  },

  getUserRegisteredEvents: async (userId: number): Promise<Event[]> => {
    const response = await api.get(`/user/${userId}/registered`);
    return response.data;
  },

  // Comment operations
  getEventComments: async (eventId: number): Promise<EventComment[]> => {
    const response = await api.get(`/${eventId}/comments`);
    return response.data;
  },

  addEventComment: async (
    eventId: number,
    commentData: AddCommentRequest
  ): Promise<{ id: number; message: string }> => {
    const response = await api.post(`/${eventId}/comments`, commentData);
    return response.data;
  },

  deleteEventComment: async (
    eventId: number,
    commentId: number,
    userId: number
  ): Promise<{ message: string }> => {
    const response = await api.delete(`/${eventId}/comments/${commentId}`, {
      params: { userId },
    });
    return response.data;
  },

  // Admin operations (authorization via JWT token in header)
  getPendingEvents: async (): Promise<Event[]> => {
    const response = await api.get('/admin/pending');
    return response.data;
  },

  approveEvent: async (eventId: number): Promise<{ message: string }> => {
    const response = await api.post(`/${eventId}/approve`);
    return response.data;
  },

  rejectEvent: async (
    eventId: number,
    data: RejectEventRequest
  ): Promise<{ message: string }> => {
    const response = await api.post(`/${eventId}/reject`, data);
    return response.data;
  },

  hideEvent: async (eventId: number): Promise<{ message: string }> => {
    const response = await api.post(`/${eventId}/hide`);
    return response.data;
  },

  unhideEvent: async (eventId: number): Promise<{ message: string }> => {
    const response = await api.post(`/${eventId}/unhide`);
    return response.data;
  },
};
