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
  supportingDocuments?: string[];
  personalStory?: string;
  adminNotes?: string;
  rejectionReason?: string;
  applicant: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  reviewedBy?: number;
  reviewedAt?: string;
  applicationDeadline?: string;
  createdAt: string;
  updatedAt: string;
  isDonationEligible: boolean;
  raisedAmount: number;
  supporterCount: number;
}

export interface FinancialAidDonation {
  id: number;
  financialAidId: number;
  donorId: number;
  amount: number;
  isAnonymous: boolean;
  message?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  createdAt: string;
}

export interface FinancialAidStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  totalRaised: number;
  totalDonors: number;
}
