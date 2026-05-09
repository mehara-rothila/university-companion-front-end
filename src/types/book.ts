export interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  bookType: 'PHYSICAL' | 'DIGITAL';
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  category: 'TEXTBOOK' | 'REFERENCE' | 'PROGRAMMING' | 'ENGINEERING' | 'OTHER';
  lendingType: 'FREE' | 'SELL' | 'TRADE';
  price?: number;
  imageUrl?: string;
  pdfUrl?: string;
  pdfSize?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  ownerId: number;
  ownerName?: string;
  ownerEmail?: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookRequest {
  id: number;
  bookId: number;
  requesterId: number;
  requesterName?: string;
  requesterEmail?: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'COMPLETED' | 'RETURNED';
  requestType: 'BORROW' | 'DOWNLOAD' | 'PURCHASE';
  message?: string;
  createdAt: string;
  updatedAt: string;
}
