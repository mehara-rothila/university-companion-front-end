// services/payhereService.ts - PayHere JS SDK Integration

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

declare global {
  interface Window {
    payhere: {
      startPayment: (payment: PayHerePayment) => void;
      onCompleted: (paymentId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
    };
  }
}

class PayHereService {
  private merchantId: string;
  private isSandbox: boolean;
  private notifyUrl: string;
  private sdkLoaded: boolean = false;

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

  // Load PayHere JS SDK
  loadPayHereScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window not available'));
        return;
      }

      if (window.payhere && this.sdkLoaded) {
        console.log('PayHere SDK already loaded');
        resolve();
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="payhere.js"]');
      if (existingScript) {
        // Wait for it to load
        if (window.payhere) {
          this.sdkLoaded = true;
          resolve();
          return;
        }
        existingScript.addEventListener('load', () => {
          this.sdkLoaded = true;
          resolve();
        });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load PayHere SDK')));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.payhere.lk/lib/payhere.js';
      script.async = true;

      script.onload = () => {
        console.log('PayHere JS SDK loaded successfully');
        this.sdkLoaded = true;
        resolve();
      };

      script.onerror = () => {
        console.error('Failed to load PayHere SDK');
        reject(new Error('Failed to load PayHere SDK'));
      };

      document.head.appendChild(script);
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

  // Start payment with PayHere JS SDK
  async startPayment(
    donationData: DonationData,
    onSuccess: (result: PaymentResult) => void,
    onError: (error: string) => void,
    onCancel: () => void
  ): Promise<void> {
    try {
      console.log('Starting PayHere payment...');
      console.log('Donation data:', donationData);

      // Load SDK
      await this.loadPayHereScript();

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

      // Setup PayHere callbacks
      window.payhere.onCompleted = function(paymentId: string) {
        console.log('Payment completed:', paymentId);
        onSuccess({
          paymentId,
          orderId,
          transactionId: paymentId,
          method: 'payhere',
          status: 'completed',
          amount: donationData.amount,
          currency: 'LKR',
          paidAt: new Date().toISOString(),
          gateway: 'payhere',
          reference: orderId
        });
      };

      window.payhere.onDismissed = function() {
        console.log('Payment dismissed/cancelled');
        onCancel();
      };

      window.payhere.onError = function(error: string) {
        console.error('PayHere error:', error);
        onError(`Payment error: ${error}`);
      };

      // Start PayHere payment popup
      console.log('Starting PayHere payment popup...');
      window.payhere.startPayment(payment);

    } catch (error) {
      console.error('Payment initialization error:', error);
      onError(error instanceof Error ? error.message : 'Payment initialization failed');
    }
  }

  // Check if SDK is loaded
  isReady(): boolean {
    return typeof window !== 'undefined' && !!window.payhere && this.sdkLoaded;
  }
}

const payhereService = new PayHereService();
export default payhereService;
