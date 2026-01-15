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

export const eventService = {
  // Event CRUD operations
  createEvent: async (eventData: CreateEventRequest): Promise<{ id: number; message: string }> => {
    const response = await axios.post(BASE_URL, eventData);
    return response.data;
  },

  getApprovedEvents: async (): Promise<Event[]> => {
    const response = await axios.get(`${BASE_URL}/approved`);
    return response.data;
  },

  getAllEvents: async (): Promise<Event[]> => {
    const response = await axios.get(`${BASE_URL}/admin/all`);
    return response.data;
  },

  getUpcomingEvents: async (): Promise<Event[]> => {
    const response = await axios.get(`${BASE_URL}/upcoming`);
    return response.data;
  },

  getPastEvents: async (): Promise<Event[]> => {
    const response = await axios.get(`${BASE_URL}/past`);
    return response.data;
  },

  getEventsByCategory: async (category: string): Promise<Event[]> => {
    const response = await axios.get(`${BASE_URL}/category/${category}`);
    return response.data;
  },

  getEventById: async (id: number): Promise<Event> => {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  getMyEvents: async (creatorId: number): Promise<Event[]> => {
    const response = await axios.get(`${BASE_URL}/my-events/${creatorId}`);
    return response.data;
  },

  updateEvent: async (id: number, eventData: UpdateEventRequest): Promise<{ message: string }> => {
    const response = await axios.put(`${BASE_URL}/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id: number, userId: number): Promise<{ message: string }> => {
    const response = await axios.delete(`${BASE_URL}/${id}`, {
      params: { userId },
    });
    return response.data;
  },

  // Registration operations
  registerForEvent: async (
    eventId: number,
    registrationData: RegisterEventRequest
  ): Promise<{ message: string; status: string }> => {
    const response = await axios.post(`${BASE_URL}/${eventId}/register`, registrationData);
    return response.data;
  },

  cancelRegistration: async (eventId: number, userId: number): Promise<{ message: string }> => {
    const response = await axios.post(`${BASE_URL}/${eventId}/cancel-registration`, null, {
      params: { userId },
    });
    return response.data;
  },

  getEventRegistrations: async (eventId: number, creatorId: number): Promise<EventRegistration[]> => {
    const response = await axios.get(`${BASE_URL}/${eventId}/registrations`, {
      params: { creatorId },
    });
    return response.data;
  },

  isUserRegistered: async (
    eventId: number,
    userId: number
  ): Promise<{ isRegistered: boolean; isWaitlisted: boolean; status: string }> => {
    const response = await axios.get(`${BASE_URL}/${eventId}/is-registered`, {
      params: { userId },
    });
    return response.data;
  },

  getUserRegisteredEvents: async (userId: number): Promise<Event[]> => {
    const response = await axios.get(`${BASE_URL}/user/${userId}/registered`);
    return response.data;
  },

  // Comment operations
  getEventComments: async (eventId: number): Promise<EventComment[]> => {
    const response = await axios.get(`${BASE_URL}/${eventId}/comments`);
    return response.data;
  },

  addEventComment: async (
    eventId: number,
    commentData: AddCommentRequest
  ): Promise<{ id: number; message: string }> => {
    const response = await axios.post(`${BASE_URL}/${eventId}/comments`, commentData);
    return response.data;
  },

  deleteEventComment: async (
    eventId: number,
    commentId: number,
    userId: number
  ): Promise<{ message: string }> => {
    const response = await axios.delete(`${BASE_URL}/${eventId}/comments/${commentId}`, {
      params: { userId },
    });
    return response.data;
  },

  // Admin operations (authorization via JWT token in header)
  getPendingEvents: async (): Promise<Event[]> => {
    const response = await axios.get(`${BASE_URL}/admin/pending`);
    return response.data;
  },

  approveEvent: async (eventId: number): Promise<{ message: string }> => {
    const response = await axios.post(`${BASE_URL}/${eventId}/approve`);
    return response.data;
  },

  rejectEvent: async (
    eventId: number,
    data: RejectEventRequest
  ): Promise<{ message: string }> => {
    const response = await axios.post(`${BASE_URL}/${eventId}/reject`, data);
    return response.data;
  },

  hideEvent: async (eventId: number): Promise<{ message: string }> => {
    const response = await axios.post(`${BASE_URL}/${eventId}/hide`);
    return response.data;
  },

  unhideEvent: async (eventId: number): Promise<{ message: string }> => {
    const response = await axios.post(`${BASE_URL}/${eventId}/unhide`);
    return response.data;
  },
};
