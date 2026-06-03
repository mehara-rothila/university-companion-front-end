'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import AuthGuard from '@/components/AuthGuard';
import { Heart, HandCoins, Users, FolderOpen } from 'lucide-react';

interface Donation {
  id: number;
  amount: number;
  status: string;
  message?: string;
  isAnonymous: boolean;
  transactionId?: string;
  createdAt: string;
  financialAidId?: number;
  financialAidTitle?: string;
  category?: string;
}

export default function MyDonationsPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) loadDonations();
  }, [user]);

  const loadDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${backendUrl}/api/financial-aid/donations/my`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      if (!res.ok) throw new Error(`Failed to load donations (${res.status})`);
      const data = await res.json();
      setDonations(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      console.error('Error loading donations:', e);
      setError(e instanceof Error ? e.message : 'Failed to load your donations.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) =>
    `Rs. ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const completed = donations.filter((d) => d.status === 'COMPLETED');
  const totalDonated = completed.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const appsSupported = new Set(completed.map((d) => d.financialAidId).filter(Boolean)).size;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      REFUNDED: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    };
    return map[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const cardClass = isDarkMode
    ? 'bg-gray-800/90 border border-gray-700'
    : 'bg-white border border-gray-200';

  return (
    <AuthGuard>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <AnimatedBackground />
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              My Donations
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Your contribution history to student financial aid
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className={`p-4 sm:p-6 rounded-xl ${cardClass} backdrop-blur-sm shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Donated</p>
                  <p className="text-xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {formatCurrency(totalDonated)}
                  </p>
                </div>
                <HandCoins className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 dark:text-green-400 opacity-20 hidden sm:block" />
              </div>
            </div>

            <div className={`p-4 sm:p-6 rounded-xl ${cardClass} backdrop-blur-sm shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Donations</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {completed.length}
                  </p>
                </div>
                <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-purple-600 dark:text-purple-400 opacity-20 hidden sm:block" />
              </div>
            </div>

            <div className={`p-4 sm:p-6 rounded-xl ${cardClass} backdrop-blur-sm shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Students Supported</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {appsSupported}
                  </p>
                </div>
                <Users className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400 opacity-20 hidden sm:block" />
              </div>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your donations...</p>
            </div>
          ) : error ? (
            <div className={`text-center py-12 rounded-xl ${cardClass} backdrop-blur-sm`}>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={loadDonations}
                className="mt-4 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
              >
                Try again
              </button>
            </div>
          ) : donations.length === 0 ? (
            <div className={`text-center py-12 rounded-xl ${cardClass} backdrop-blur-sm`}>
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">No donations yet</p>
              <p className="text-gray-500 dark:text-gray-500 mt-2">
                Support a student to see your contribution history here.
              </p>
              <Link
                href="/financial-aid"
                className="inline-block mt-4 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
              >
                Browse Community Support
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {donations.map((d) => (
                <div
                  key={d.id}
                  className={`p-4 sm:p-6 rounded-xl ${cardClass} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2.5 sm:p-3 rounded-lg flex-shrink-0 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-lg text-gray-900 dark:text-white mb-1 truncate">
                          {d.financialAidTitle || `Financial Aid #${d.financialAidId ?? ''}`}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <span className={`px-2 py-0.5 rounded ${statusBadge(d.status)}`}>{d.status}</span>
                          {d.category && (
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{d.category}</span>
                          )}
                          {d.isAnonymous && (
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Anonymous</span>
                          )}
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                            {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        {d.message && (
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 italic truncate">
                            “{d.message}”
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 self-end sm:self-start">
                      <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(d.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
