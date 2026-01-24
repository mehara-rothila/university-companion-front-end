// services/payhereService.ts - PayHere Form Redirect Integration

interface PayHerePayment {
  sandbox: boolean;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  custom_1?: string;
  custom_2?: string;
}

interface DonationData {
  financialAidId: number;
  amount: number;
  donorName?: string;
  donorEmail?: string;
  isAnonymous?: boolean;
  message?: string;
}

interface PaymentResult {
  paymentId: string;
  orderId: string;
  transactionId: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
  paidAt: string;
  gateway: string;
  reference: string;
}

class PayHereService {
  private merchantId: string;
  private isSandbox: boolean;
  private notifyUrl: string;

  constructor() {
    this.merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || '';
    this.isSandbox = process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === 'true';
    this.notifyUrl = process.env.NEXT_PUBLIC_PAYHERE_NOTIFY_URL ||
                     `${process.env.NEXT_PUBLIC_API_URL}/api/payment/webhook`;

    console.log('PayHere Service initialized:', {
      merchantId: this.merchantId ? `${this.merchantId.substring(0, 4)}...` : 'Not set',
      isSandbox: this.isSandbox,
      notifyUrl: this.notifyUrl
    });
  }

  // Generate hash via API
  private async generateHash(orderId: string, amount: string, currency: string = 'LKR'): Promise<{
    hash: string;
    merchantId: string;
  }> {
    console.log('Requesting hash from API...');

    const response = await fetch('/api/payment/generate-hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount, currency })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Hash generation failed');
    }

    const data = await response.json();
    console.log('Hash received from API');

    return {
      hash: data.hash,
      merchantId: data.merchantId || this.merchantId
    };
  }

  // Create payment object
  private async createPayment(donationData: DonationData, orderId: string): Promise<PayHerePayment> {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const amount = donationData.amount.toFixed(2);

    // Parse donor name
    const fullName = donationData.donorName || 'Anonymous Donor';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Anonymous';
    const lastName = nameParts.slice(1).join(' ') || 'Donor';

    // Generate hash
    const { hash, merchantId } = await this.generateHash(orderId, amount, 'LKR');

    return {
      sandbox: this.isSandbox,
      merchant_id: merchantId,
      return_url: `${baseUrl}/financial-aid/payment/callback?order_id=${orderId}`,
      cancel_url: `${baseUrl}/financial-aid/payment/cancel?order_id=${orderId}`,
      notify_url: this.notifyUrl,
      order_id: orderId,
      items: `Donation for Financial Aid #${donationData.financialAidId}`,
      amount: amount,
      currency: 'LKR',
      hash: hash,
      first_name: firstName,
      last_name: lastName,
      email: donationData.donorEmail || 'donor@athena.mehara.io',
      phone: '0770000000',
      address: 'University Campus',
      city: 'Colombo',
      country: 'Sri Lanka',
      custom_1: `AID-${donationData.financialAidId}`,
      custom_2: donationData.isAnonymous ? 'anonymous' : 'named'
    };
  }

  // Start payment with form redirect (bypasses domain restrictions)
  async startPayment(
    donationData: DonationData,
    onSuccess: (result: PaymentResult) => void,
    onError: (error: string) => void,
    onCancel: () => void
  ): Promise<void> {
    try {
      console.log('Starting PayHere payment (form redirect)...');
      console.log('Donation data:', donationData);

      // Generate unique order ID
      const orderId = `DON_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      // Create payment object
      const payment = await this.createPayment(donationData, orderId);

      console.log('Payment object created:', {
        orderId: payment.order_id,
        amount: payment.amount,
        merchant_id: payment.merchant_id,
        sandbox: payment.sandbox
      });

      // Store order info for callback handling
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingPayment', JSON.stringify({
          orderId,
          amount: donationData.amount,
          financialAidId: donationData.financialAidId
        }));
      }

      // Create and submit form to PayHere
      this.submitPaymentForm(payment);

    } catch (error) {
      console.error('Payment initialization error:', error);
      onError(error instanceof Error ? error.message : 'Payment initialization failed');
    }
  }

  // Submit payment via form POST to PayHere
  private submitPaymentForm(payment: PayHerePayment): void {
    const checkoutUrl = payment.sandbox
      ? 'https://sandbox.payhere.lk/pay/checkout'
      : 'https://www.payhere.lk/pay/checkout';

    console.log('Submitting payment form to:', checkoutUrl);

    // Create form element
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = checkoutUrl;
    form.style.display = 'none';

    // Add all payment fields
    const fields: Record<string, string> = {
      merchant_id: payment.merchant_id,
      return_url: payment.return_url,
      cancel_url: payment.cancel_url,
      notify_url: payment.notify_url,
      order_id: payment.order_id,
      items: payment.items,
      currency: payment.currency,
      amount: payment.amount,
      first_name: payment.first_name,
      last_name: payment.last_name,
      email: payment.email,
      phone: payment.phone,
      address: payment.address,
      city: payment.city,
      country: payment.country,
      hash: payment.hash
    };

    if (payment.custom_1) fields.custom_1 = payment.custom_1;
    if (payment.custom_2) fields.custom_2 = payment.custom_2;

    // Create hidden inputs
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    // Append form and submit
    document.body.appendChild(form);
    console.log('Form created, submitting...');
    form.submit();
  }

  // Check payment status from callback
  static getCallbackParams(): { orderId?: string; status?: string } {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    return {
      orderId: params.get('order_id') || undefined,
      status: params.get('status') || undefined
    };
  }

  // Get pending payment from session storage
  static getPendingPayment(): { orderId: string; amount: number; financialAidId: number } | null {
    if (typeof window === 'undefined') return null;

    const data = sessionStorage.getItem('pendingPayment');
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
      sessionStorage.removeItem('pendingPayment');
    }
  }
}

const payhereService = new PayHereService();
export default payhereService;
