'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import AuthGuard from '@/components/AuthGuard';
import axios from 'axios';
import Link from 'next/link';
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Eye, Filter, ArrowLeft } from 'lucide-react';

interface DisbursementStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
}

interface Disbursement {
  id: number;
  financialAidId: number;
  applicationTitle: string;
  applicantName: string;
  amount: number;
  status: string;
  method: string;
  transactionReference: string;
  disbursedByName: string;
  disbursedAt: string;
  scheduledDate: string;
  notes: string;
  createdAt: string;
}

export default function DisbursementTrackingPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();

  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [stats, setStats] = useState<DisbursementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED'>('ALL');
  const [selectedDisbursement, setSelectedDisbursement] = useState<Disbursement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [statsResponse, pendingResponse] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/financial-aid/disbursements/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/financial-aid/disbursements/pending`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      setStats(statsResponse.data);
      setDisbursements(pendingResponse.data);
    } catch (error) {
      console.error('Error fetching disbursement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDisbursementStatus = async (disbursementId: number, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this disbursement as ${newStatus}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/financial-aid/disbursements/${disbursementId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Status updated successfully');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-300',
        icon: Clock,
      },
      PROCESSING: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        icon: AlertCircle,
      },
      COMPLETED: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        icon: CheckCircle,
      },
      FAILED: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        icon: XCircle,
      },
      CANCELLED: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-300',
        icon: XCircle,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit`}
      >
        <Icon size={14} />
        {status}
      </span>
    );
  };

  const filteredDisbursements =
    filter === 'ALL' ? disbursements : disbursements.filter((d) => d.status === filter);

  return (
    <AuthGuard>
      <Navigation />
      <main
        className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}
      >
        <AnimatedBackground variant="dashboard" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          {/* Breadcrumbs */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/admin"
              className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 shadow-sm backdrop-blur-sm transition-all duration-200`}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Admin Panel
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8 p-6 rounded-2xl border bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50 shadow-md backdrop-blur-sm animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <DollarSign className="text-green-600" size={40} />
              Disbursement Tracking
            </h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Monitor and manage financial aid disbursements
            </p>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div
                className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total
                    </p>
                    <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                  <DollarSign size={32} className="text-blue-600 opacity-20" />
                </div>
              </div>

              <div
                className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pending
                    </p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock size={32} className="text-yellow-600 opacity-20" />
                </div>
              </div>

              <div
                className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Completed
                    </p>
                    <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle size={32} className="text-green-600 opacity-20" />
                </div>
              </div>

              <div
                className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Failed
                    </p>
                    <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
                  </div>
                  <XCircle size={32} className="text-red-600 opacity-20" />
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div
            className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-4 mb-6 border backdrop-blur-sm`}
          >
            <div className="flex gap-2 overflow-x-auto">
              {['ALL', 'PENDING', 'COMPLETED', 'FAILED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as typeof filter)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Disbursements Table */}
          <div
            className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}
          >
            <h2 className="text-2xl font-bold mb-6">Disbursement Records</h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredDisbursements.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No disbursements found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <th className="text-left py-3 px-4">Application</th>
                      <th className="text-left py-3 px-4">Applicant</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Method</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Scheduled</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDisbursements.map((disbursement) => (
                      <tr
                        key={disbursement.id}
                        className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">{disbursement.applicationTitle}</div>
                        </td>
                        <td className="py-3 px-4 text-sm">{disbursement.applicantName}</td>
                        <td className="py-3 px-4 font-semibold text-green-600">
                          ${disbursement.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {disbursement.method.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(disbursement.status)}</td>
                        <td className="py-3 px-4 text-sm">
                          {disbursement.scheduledDate
                            ? new Date(disbursement.scheduledDate).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedDisbursement(disbursement);
                                setShowDetailModal(true);
                              }}
                              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            {disbursement.status === 'PENDING' && (
                              <button
                                onClick={() =>
                                  updateDisbursementStatus(disbursement.id, 'COMPLETED')
                                }
                                className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedDisbursement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border`}
            >
              <h3 className="text-2xl font-bold mb-4">Disbursement Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Application
                  </label>
                  <p className="font-medium">{selectedDisbursement.applicationTitle}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Applicant</label>
                  <p>{selectedDisbursement.applicantName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Amount</label>
                    <p className="text-2xl font-bold text-green-600">
                      ${selectedDisbursement.amount.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                    {getStatusBadge(selectedDisbursement.status)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Method</label>
                  <p>{selectedDisbursement.method.replace('_', ' ')}</p>
                </div>

                {selectedDisbursement.transactionReference && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Transaction Reference
                    </label>
                    <p className="font-mono text-sm">{selectedDisbursement.transactionReference}</p>
                  </div>
                )}

                {selectedDisbursement.disbursedByName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Disbursed By
                    </label>
                    <p>{selectedDisbursement.disbursedByName}</p>
                  </div>
                )}

                {selectedDisbursement.scheduledDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Scheduled Date
                    </label>
                    <p>{new Date(selectedDisbursement.scheduledDate).toLocaleString()}</p>
                  </div>
                )}

                {selectedDisbursement.disbursedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Completed At
                    </label>
                    <p>{new Date(selectedDisbursement.disbursedAt).toLocaleString()}</p>
                  </div>
                )}

                {selectedDisbursement.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                    <p className="text-sm">{selectedDisbursement.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
