'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import paymentService, { PaymentStatus } from '@/services/paymentService';

function PaymentCallbackContent() {
  const { isDarkMode } = useDarkMode();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<PaymentStatus | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const orderId = searchParams.get('order_id');
      const paymentStatus = searchParams.get('status');

      if (!orderId) {
        setStatus('failed');
        return;
      }

      try {
        const details = await paymentService.getPaymentStatus(orderId);
        setPaymentDetails(details);

        if (details.status === 'COMPLETED' || paymentStatus === 'success' || paymentStatus === '2') {
          setStatus('success');
        } else if (details.status === 'FAILED' || paymentStatus === 'failed' || paymentStatus === '-1') {
          setStatus('failed');
        } else if (details.status === 'PENDING') {
          setStatus('pending');
        } else {
          setStatus('pending');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('failed');
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className={`max-w-md w-full p-8 rounded-2xl shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Processing Payment...
              </h2>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Please wait while we verify your payment.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Payment Successful!
              </h2>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Thank you for your generous donation. Your support helps fellow students in need.
              </p>
              {paymentDetails?.amount && (
                <p className={`mt-4 text-lg font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Amount: LKR {paymentDetails.amount.toLocaleString()}
                </p>
              )}
              <div className="mt-6 space-y-3">
                <Link
                  href="/financial-aid"
                  className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Return to Financial Aid
                </Link>
                <Link
                  href="/dashboard"
                  className={`block w-full px-4 py-2 border rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Payment Failed
              </h2>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                We couldn&apos;t process your payment. Please try again or contact support if the issue persists.
              </p>
              <div className="mt-6 space-y-3">
                <Link
                  href="/financial-aid"
                  className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Try Again
                </Link>
                <button
                  onClick={() => router.back()}
                  className={`block w-full px-4 py-2 border rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          {status === 'pending' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
                <svg className="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Payment Pending
              </h2>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Your payment is being processed. You&apos;ll receive a notification once it&apos;s complete.
              </p>
              <div className="mt-6 space-y-3">
                <Link
                  href="/financial-aid"
                  className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Return to Financial Aid
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full p-8 rounded-2xl shadow-xl bg-white dark:bg-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Loading...
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
