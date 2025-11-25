export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AchievementCategory =
  | 'Competition'
  | 'Academic'
  | 'Project'
  | 'Award'
  | 'Research'
  | 'Sports'
  | 'Cultural'
  | 'Leadership'
  | 'Community Service'
  | 'Other';

export interface StudentAchievement {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  achievementDate?: string;
  status: ApprovalStatus;
  studentId: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: number;
  rejectedAt?: string;
  rejectedBy?: number;
  rejectionReason?: string;
  hidden: boolean;
  likes: number;
  comments: number;
  shares: number;

  // Student info (populated by backend)
  studentName?: string;
  studentEmail?: string;
  studentImageUrl?: string;
  studentMajor?: string;
  studentYear?: number;

  // Comments list
  commentsList?: AchievementComment[];
}

export interface AchievementComment {
  id: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userImageUrl?: string;
  userRole?: string;
}

export interface CreateAchievementRequest {
  studentId: number;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  achievementDate?: string;
}

export interface UpdateAchievementRequest {
  title?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  achievementDate?: string;
}
