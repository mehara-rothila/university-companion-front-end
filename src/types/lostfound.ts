export interface LostFoundItem {
  id: number;
  type: 'LOST' | 'FOUND';
  title: string;
  description: string;
  category: string;
  location: string;
  dateReported: string;
  imageUrl?: string;
  reward?: number;
  contactMethod: 'ANONYMOUS' | 'DIRECT';
  status: 'PENDING' | 'ACTIVE' | 'RESOLVED' | 'EXPIRED' | 'REJECTED';
  postedBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LostFoundConversation {
  id: number;
  item: LostFoundItem;
  requester: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  owner: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  initialMessage?: string;
}

export interface LostFoundMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderName?: string;
  content: string;
  sentAt: string;
  readAt?: string;
  isRead: boolean;
  messageType: 'TEXT' | 'SYSTEM';
}

export interface LostFoundStats {
  totalItems: number;
  lostItems: number;
  foundItems: number;
  resolvedItems: number;
  categories: string[];
  locations: string[];
}
