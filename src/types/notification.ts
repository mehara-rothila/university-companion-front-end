export interface Notification {
  id: number;
  title: string;
  message: string;
  type:
    | 'GENERAL'
    | 'ACADEMIC'
    | 'FINANCIAL_AID'
    | 'LOST_FOUND'
    | 'WELLNESS'
    | 'DINING'
    | 'LIBRARY'
    | 'SOCIAL'
    | 'SYSTEM'
    | 'EMERGENCY';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  target: 'ALL_STUDENTS' | 'SPECIFIC_USERS' | 'ADMIN_ONLY';
  targetUserIds?: number[];
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  createdBy?: number;
}

export interface NotificationPreference {
  id: number;
  userId: number;
  enabledTypes: string[];
  createdAt: string;
  updatedAt: string;
}
