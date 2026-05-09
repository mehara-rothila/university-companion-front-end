export interface Competition {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  category: string;
  location: string;
  prizes?: string;
  maxParticipants?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  organizerId: number;
  internalEnrollmentEnabled: boolean;
  externalEnrollmentUrl?: string;
  createdAt: string;
  rejectionReason?: string;
  hidden?: boolean;
  enrollmentCount?: number;
  formFields?: FormField[];
}

export interface FormField {
  id: number;
  competitionId: number;
  fieldLabel: string;
  fieldType: 'TEXT' | 'NUMBER' | 'EMAIL' | 'SELECT' | 'TEXTAREA' | 'DATE' | 'CHECKBOX';
  required: boolean;
  order: number;
  options?: string;
  placeholder?: string;
}

export interface CompetitionEnrollment {
  id: number;
  competitionId: number;
  userId: number;
  formResponses?: string;
  status: 'ENROLLED' | 'WITHDRAWN';
  enrolledAt: string;
  withdrawnAt?: string;
  userName?: string;
  userEmail?: string;
}

export interface CreateCompetitionData {
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  category: string;
  location: string;
  prizes?: string;
  maxParticipants?: number;
  internalEnrollmentEnabled: boolean;
  externalEnrollmentUrl?: string;
  formFields?: CreateFormFieldData[];
}

export interface CreateFormFieldData {
  fieldLabel: string;
  fieldType: string;
  required: boolean;
  order: number;
  options?: string;
  placeholder?: string;
}

export interface EnrollmentData {
  userId: number;
  formResponses?: string;
}
