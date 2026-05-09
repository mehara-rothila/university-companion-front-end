// Event-related types and interfaces

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum RegistrationStatus {
  REGISTERED = 'REGISTERED',
  WAITLISTED = 'WAITLISTED',
  CANCELLED = 'CANCELLED',
}

export enum EventCategory {
  SOCIAL = 'Social',
  ACADEMIC = 'Academic',
  SPORTS = 'Sports',
  CULTURAL = 'Cultural',
  CLUB_ACTIVITY = 'Club Activity',
  WORKSHOP = 'Workshop',
  SEMINAR = 'Seminar',
  NETWORKING = 'Networking',
  OTHER = 'Other',
}

export interface Event {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  eventDate: string; // ISO 8601 date string
  eventTime: string; // ISO 8601 time string
  endTime: string; // ISO 8601 time string
  registrationDeadline?: string; // ISO 8601 date string
  category: string;
  location: string;
  organizerName: string;
  maxAttendees?: number;
  status: ApprovalStatus;
  creatorId: number;
  createdAt: string;
  rejectionReason?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  updatedAt?: string;
  hidden?: boolean;
  rejectedBy?: number;
  rejectedAt?: string;
  // Additional fields from API response
  registeredCount?: number;
  waitlistCount?: number;
  spotsAvailable?: number;
  creatorName?: string;
  creatorEmail?: string;
  creatorRole?: string; // STUDENT, FACULTY, ADMIN
  approvedBy?: number; // User ID who approved (null if not approved)
  approvedAt?: string; // Timestamp when approved
}

export interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  status: RegistrationStatus;
  registeredAt: string;
  cancelledAt?: string;
  movedToWaitlistAt?: string;
  movedFromWaitlistAt?: string;
  waitlistPosition?: number; // Position in waitlist (1-based, null if not waitlisted)
  // Additional fields from API response
  userName?: string;
  userEmail?: string;
}

export interface EventComment {
  id: number;
  eventId: number;
  userId: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  // Additional fields from API response
  userName?: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  imageUrl?: string;
  eventDate: string;
  eventTime: string;
  endTime: string;
  registrationDeadline?: string;
  category: string;
  location: string;
  organizerName: string;
  maxAttendees?: number;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
}

export interface RegisterEventRequest {
}

export interface RejectEventRequest {
  reason: string;
}

export interface AddCommentRequest {
  comment: string;
}

export interface EventFilters {
  category?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  showPastEvents?: boolean;
  showUpcomingEvents?: boolean;
}
