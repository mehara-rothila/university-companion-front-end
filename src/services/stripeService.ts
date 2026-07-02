// services/stripeService.ts - Stripe Payment Integration

interface DonationData {
  financialAidId: number;
  amount: number;
  donorName?: string;
  donorEmail?: string;
  isAnonymous?: boolean;
  message?: string;
}

interface CheckoutResponse {
  sessionId: string;
  url: string;
}

class StripeService {
  constructor() {
    console.log('Stripe Service initialized');
  }

  // Create checkout session and redirect to Stripe
  async startPayment(donationData: DonationData): Promise<void> {
    try {
      console.log('Starting Stripe payment...');
      console.log('Donation data:', donationData);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      // Create checkout session via API
      const response = await fetch('/api/payment/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(donationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const data: CheckoutResponse = await response.json();
      console.log('Checkout session created:', data.sessionId);

      // Store session info for callback
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'pendingStripePayment',
          JSON.stringify({
            sessionId: data.sessionId,
            amount: donationData.amount,
            financialAidId: donationData.financialAidId,
          })
        );
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        console.log('Redirecting to Stripe checkout...');
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      throw error;
    }
  }

  // Get pending payment from session storage
  static getPendingPayment(): { sessionId: string; amount: number; financialAidId: number } | null {
    if (typeof window === 'undefined') return null;

    const data = sessionStorage.getItem('pendingStripePayment');
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  // Clear pending payment
  static clearPendingPayment(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pendingStripePayment');
    }
  }

  // Get session ID from URL params
  static getSessionIdFromUrl(): string | null {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    return params.get('session_id');
  }
}

const stripeService = new StripeService();
export default stripeService;
