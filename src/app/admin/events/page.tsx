'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import AuthGuard from '@/components/AuthGuard';
import { eventService } from '@/services/eventService';
import type { Event } from '@/types/event';
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function AdminEventsPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.id && user?.role === 'ADMIN') {
      fetchPendingEvents();
    }
  }, [user]);

  const fetchPendingEvents = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');
      const data = await eventService.getPendingEvents(user.id);
      setPendingEvents(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load pending events');
      console.error('Error fetching pending events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId: number) => {
    if (!user?.id || !confirm('Are you sure you want to approve this event?')) return;

    try {
      setActionLoading(true);
      await eventService.approveEvent(eventId, user.id);
      await fetchPendingEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve event');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (event: Event) => {
    setSelectedEvent(event);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!user?.id || !selectedEvent || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      await eventService.rejectEvent(selectedEvent.id, user.id, { reason: rejectionReason });
      setShowRejectModal(false);
      setSelectedEvent(null);
      setRejectionReason('');
      await fetchPendingEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject event');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <AuthGuard>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
          <AnimatedBackground variant="dashboard" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`${isDarkMode ? 'text-red-300' : 'text-red-800'} font-medium`}>
                  Access denied. Admin privileges required.
                </p>
              </div>
            </div>
          </div>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>

        <AnimatedBackground variant="dashboard" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">

          {/* Header */}
          <div className="mb-8">
            <div className={`text-center p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm shadow-lg`}>
              <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center justify-center`}>
                <Calendar className="h-10 w-10 mr-3 text-purple-500" />
                Event Management
              </h1>
              <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Review and approve pending events
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-500">{pendingEvents.length}</p>
                </div>
                <AlertCircle size={48} className="text-yellow-500 opacity-20" />
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Awaiting Action</p>
                  <p className="text-3xl font-bold text-purple-500">{pendingEvents.length}</p>
                </div>
                <Calendar size={48} className="text-purple-500 opacity-20" />
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Events</p>
                  <p className="text-3xl font-bold text-green-500">{pendingEvents.length}</p>
                </div>
                <CheckCircle size={48} className="text-green-500 opacity-20" />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={`${isDarkMode ? 'bg-gray-800/70' : 'bg-white/70'} backdrop-blur-sm rounded-2xl p-12 text-center`}>
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading pending events...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`${isDarkMode ? 'text-red-300' : 'text-red-800'} font-medium`}>
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Events List */}
          {!loading && !error && (
            <>
              {pendingEvents.length === 0 ? (
                <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-12 text-center`}>
                  <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                  <h3 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>All caught up!</h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    No pending events to review at this time.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Event Image */}
                        <div className="relative w-full md:w-64 h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                          {event.imageUrl ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(event.imageUrl)}`}
                              alt={event.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Calendar size={64} className="text-white opacity-50" />
                            </div>
                          )}

                          {/* Category Badge */}
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-medium rounded-full">
                              {event.category}
                            </span>
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 p-6">
                          <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                          <p className={`mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {event.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Date & Time */}
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar size={16} className="text-blue-500" />
                              <span>{formatDate(event.eventDate)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Clock size={16} className="text-blue-500" />
                              <span>
                                {formatTime(event.eventTime)} - {formatTime(event.endTime)}
                              </span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin size={16} className="text-blue-500" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>

                            {/* Capacity */}
                            {event.maxAttendees && (
                              <div className="flex items-center gap-2 text-sm">
                                <Users size={16} className="text-blue-500" />
                                <span>Max {event.maxAttendees} attendees</span>
                              </div>
                            )}
                          </div>

                          {/* Creator Info */}
                          <div className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <p>
                              <strong>Organizer:</strong> {event.organizerName}
                            </p>
                            <p>
                              <strong>Created by:</strong> {event.creatorName} ({event.creatorEmail})
                            </p>
                            <p>
                              <strong>Submitted:</strong> {formatDate(event.createdAt)}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3">
                            <a
                              href={`/events/${event.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-all duration-200"
                            >
                              <Eye size={16} />
                              View Details
                            </a>

                            <button
                              onClick={() => handleApprove(event.id)}
                              disabled={actionLoading}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
                            >
                              <CheckCircle size={16} />
                              Approve
                            </button>

                            <button
                              onClick={() => openRejectModal(event)}
                              disabled={actionLoading}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Rejection Modal */}
          {showRejectModal && selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Reject Event</h2>

                <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  You are about to reject: <strong>{selectedEvent.title}</strong>
                </p>

                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="Please provide a clear reason for rejection..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !rejectionReason.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                  </button>

                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedEvent(null);
                      setRejectionReason('');
                    }}
                    disabled={actionLoading}
                    className={`px-4 py-2 ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } rounded-lg font-medium transition-all duration-200`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
