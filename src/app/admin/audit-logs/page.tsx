'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import AuthGuard from '@/components/AuthGuard';
import axios from 'axios';
import Link from 'next/link';
import { Shield, Filter, Search, Download, Eye, User, Clock, FileText, ArrowLeft } from 'lucide-react';

interface AuditLog {
  id: number;
  userId: number;
  userEmail: string;
  userRole: string;
  actionType: string;
  entityType: string;
  entityId: number;
  entityName: string;
  description: string;
  oldValue: string;
  newValue: string;
  ipAddress: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('ALL');
  const [entityTypeFilter, setEntityTypeFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const actionTypes = [
    'ALL',
    'LOGIN',
    'LOGOUT',
    'CREATE',
    'UPDATE',
    'DELETE',
    'APPROVE',
    'REJECT',
    'ROLE_CHANGE',
    'DISBURSE_FUNDS',
    'MARK_ATTENDANCE',
    'REGISTER_EVENT',
    'CANCEL_REGISTRATION',
  ];

  const entityTypes = [
    'ALL',
    'USER',
    'EVENT',
    'COMPETITION',
    'ACHIEVEMENT',
    'BOOK',
    'FINANCIAL_AID',
    'DISBURSEMENT',
    'NOTIFICATION',
    'ATTENDANCE',
    'EVENT_REGISTRATION',
  ];

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, actionTypeFilter, entityTypeFilter, logs]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/audit-logs?page=0&size=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLogs(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // Mock data for demonstration if endpoint not ready
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Action type filter
    if (actionTypeFilter !== 'ALL') {
      filtered = filtered.filter((log) => log.actionType === actionTypeFilter);
    }

    // Entity type filter
    if (entityTypeFilter !== 'ALL') {
      filtered = filtered.filter((log) => log.entityType === entityTypeFilter);
    }

    setFilteredLogs(filtered);
  };

  const exportLogsCSV = () => {
    if (!filteredLogs.length) return;

    const headers = [
      'Timestamp',
      'User',
      'Role',
      'Action',
      'Entity Type',
      'Entity Name',
      'Description',
      'IP Address',
    ];
    const rows = filteredLogs.map((log) => [
      new Date(log.createdAt).toLocaleString(),
      log.userEmail,
      log.userRole,
      log.actionType,
      log.entityType,
      log.entityName || '-',
      log.description,
      log.ipAddress || '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getActionBadge = (actionType: string) => {
    const actionConfig: Record<string, { bg: string; text: string }> = {
      LOGIN: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300' },
      LOGOUT: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300' },
      CREATE: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
      },
      UPDATE: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-300',
      },
      DELETE: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
      APPROVE: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
      },
      REJECT: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
      ROLE_CHANGE: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-800 dark:text-purple-300',
      },
    };

    const config = actionConfig[actionType] || {
      bg: 'bg-gray-100 dark:bg-gray-700',
      text: 'text-gray-800 dark:text-gray-300',
    };

    return (
      <span className={`${config.bg} ${config.text} px-2 py-1 rounded-full text-xs font-medium`}>
        {actionType.replace('_', ' ')}
      </span>
    );
  };

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
              <Shield className="text-blue-600" size={40} />
              Audit Logs
            </h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Track all critical actions and system changes
            </p>
          </div>

          {/* Filters */}
          <div
            className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 mb-6 border backdrop-blur-sm`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="col-span-full">
                <label className="block mb-2 font-medium text-sm">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by user, entity, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Action Type Filter */}
              <div>
                <label className="block mb-2 font-medium text-sm">Action Type</label>
                <select
                  value={actionTypeFilter}
                  onChange={(e) => setActionTypeFilter(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {actionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Entity Type Filter */}
              <div>
                <label className="block mb-2 font-medium text-sm">Entity Type</label>
                <select
                  value={entityTypeFilter}
                  onChange={(e) => setEntityTypeFilter(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {entityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Button */}
              <div className="flex items-end">
                <button
                  onClick={exportLogsCSV}
                  disabled={!filteredLogs.length}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div
              className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Logs
                  </p>
                  <p className="text-3xl font-bold text-blue-600">{logs.length}</p>
                </div>
                <FileText size={32} className="text-blue-600 opacity-20" />
              </div>
            </div>

            <div
              className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Filtered Results
                  </p>
                  <p className="text-3xl font-bold text-green-600">{filteredLogs.length}</p>
                </div>
                <Filter size={32} className="text-green-600 opacity-20" />
              </div>
            </div>

            <div
              className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Last 24 Hours
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {
                      logs.filter(
                        (log) =>
                          new Date(log.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                      ).length
                    }
                  </p>
                </div>
                <Clock size={32} className="text-purple-600 opacity-20" />
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div
            className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}
          >
            <h2 className="text-2xl font-bold mb-6">Activity Log</h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery || actionTypeFilter !== 'ALL' || entityTypeFilter !== 'ALL'
                  ? 'No logs match the current filters'
                  : 'No audit logs found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <th className="text-left py-3 px-4">Timestamp</th>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Action</th>
                      <th className="text-left py-3 px-4">Entity</th>
                      <th className="text-left py-3 px-4">Description</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr
                        key={log.id}
                        className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                      >
                        <td className="py-3 px-4 text-sm">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm">{log.userEmail}</span>
                            <span className="text-xs text-gray-500">{log.userRole}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getActionBadge(log.actionType)}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{log.entityType}</span>
                            {log.entityName && (
                              <span className="text-xs text-gray-500">{log.entityName}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm max-w-md truncate">{log.description}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setSelectedLog(log);
                                setShowDetailModal(true);
                              }}
                              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
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
        {showDetailModal && selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border`}
            >
              <h3 className="text-2xl font-bold mb-4">Audit Log Details</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Timestamp
                    </label>
                    <p>{new Date(selectedLog.createdAt).toLocaleString()}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Action Type
                    </label>
                    {getActionBadge(selectedLog.actionType)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      User Email
                    </label>
                    <p>{selectedLog.userEmail}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      User Role
                    </label>
                    <p>{selectedLog.userRole}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Entity Type
                    </label>
                    <p>{selectedLog.entityType}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Entity Name
                    </label>
                    <p>{selectedLog.entityName || '-'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Description
                  </label>
                  <p className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {selectedLog.description}
                  </p>
                </div>

                {selectedLog.oldValue && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Old Value
                    </label>
                    <pre className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm overflow-auto">
                      {selectedLog.oldValue}
                    </pre>
                  </div>
                )}

                {selectedLog.newValue && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      New Value
                    </label>
                    <pre className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm overflow-auto">
                      {selectedLog.newValue}
                    </pre>
                  </div>
                )}

                {selectedLog.ipAddress && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      IP Address
                    </label>
                    <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
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
