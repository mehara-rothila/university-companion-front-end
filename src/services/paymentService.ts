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
  orderId?: string;
  transactionRef?: string;
  message: string;
  errorCode?: string;
  formData?: Record<string, string>;
}

export interface PaymentStatus {
  status: string;
  amount?: number;
  donationId?: number;
  financialAidId?: number;
  order_id?: string;
  payment_status?: string;
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
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async initiatePayment(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    try {
      const response = await this.api.post<PaymentInitiateResponse>('/payment/initiate', request);
      return response.data;
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Failed to initiate payment. Please try again.',
        errorCode: 'NETWORK_ERROR'
      };
    }
  }

  async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    try {
      const response = await this.api.get<PaymentStatus>(`/payment/status/${orderId}`);
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

  // Submit payment via form POST (required by PayHere)
  submitPaymentForm(paymentUrl: string, formData: Record<string, string>): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;

    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }

  openPaymentInNewTab(paymentUrl: string): Window | null {
    return window.open(paymentUrl, '_blank', 'noopener,noreferrer');
  }

  async handlePaymentCallback(orderId: string): Promise<PaymentStatus> {
    return this.getPaymentStatus(orderId);
  }

  parseCallbackParams(): { orderId?: string; status?: string; paymentId?: string } {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    return {
      orderId: params.get('order_id') || undefined,
      status: params.get('status') || undefined,
      paymentId: params.get('payment_id') || undefined,
    };
  }
}

const paymentService = new PaymentService();
export default paymentService;
