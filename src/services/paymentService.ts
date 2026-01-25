import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_URL = `${API_BASE_URL}/api`;

export interface PaymentInitiateRequest {
  financialAidId: number;
  amount: number;
  isAnonymous?: boolean;
  message?: string;
  donorName?: string;
  donorEmail?: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  paymentUrl?: string;
  sessionId?: string;
  transactionRef?: string;
  message: string;
  errorCode?: string;
}

export interface PaymentStatus {
  status: string;
  amount?: number;
  donationId?: number;
  financialAidId?: number;
  sessionId?: string;
  message?: string;
}

class PaymentService {
  private api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.api.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });
  }

  // Confirm Stripe payment with backend (called from callback page)
  async confirmStripePayment(sessionId: string): Promise<PaymentStatus> {
    try {
      const response = await this.api.post<PaymentStatus>('/payment/stripe/confirm', {
        sessionId
      });
      return response.data;
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      return {
        status: 'ERROR',
        message: error.response?.data?.message || 'Failed to confirm payment'
      };
    }
  }

  async getPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    try {
      const response = await this.api.get<PaymentStatus>(`/payment/status/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      return {
        status: 'ERROR',
        message: 'Failed to get payment status'
      };
    }
  }

  redirectToPayment(paymentUrl: string): void {
    window.location.href = paymentUrl;
  }

  parseCallbackParams(): { sessionId?: string; status?: string } {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    return {
      sessionId: params.get('session_id') || undefined,
      status: params.get('status') || undefined,
    };
  }
}

const paymentService = new PaymentService();
export default paymentService;
