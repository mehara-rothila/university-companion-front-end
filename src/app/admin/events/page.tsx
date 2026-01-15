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
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle, Eye, AlertCircle, Trash2, Filter, User, ImageIcon } from 'lucide-react';
import ImageEditModal from '@/components/ImageEditModal';
import Image from 'next/image';

export default function AdminEventsPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageEditModal, setShowImageEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.id && user?.role === 'ADMIN') {
      loadEvents();
    }
  }, [user, filter]);

  const loadEvents = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');
      
      let data: Event[];
      if (filter === 'PENDING') {
        data = await eventService.getPendingEvents(user.id);
      } else {
        // Try to get all events, fallback to approved + pending
        try {
          data = await eventService.getAllEvents(user.id);
          if (filter !== 'ALL') {
            data = data.filter(event => event.status === filter);
          }
        } catch {
          const approved = await eventService.getApprovedEvents();
          const pending = await eventService.getPendingEvents(user.id);
          data = [...approved, ...pending];
          if (filter !== 'ALL') {
            data = data.filter(event => event.status === filter);
          }
        }
      }
      setEvents(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId: number) => {
    if (!user?.id || !confirm('Are you sure you want to approve this event?')) return;

    try {
      setActionLoading(true);
      await eventService.approveEvent(eventId, user.id);
      await loadEvents();
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
      await loadEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject event');
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!user?.id || !selectedEvent) return;

    try {
      setActionLoading(true);
      await eventService.deleteEvent(selectedEvent.id, user.id);
      setShowDeleteModal(false);
      setSelectedEvent(null);
      await loadEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete event');
    } finally {
      setActionLoading(false);
    }
  };

  const openImageEditModal = (event: Event) => {
    setSelectedEvent(event);
    setShowImageEditModal(true);
  };

  const handleImageSave = async (imageUrl: string) => {
    if (!selectedEvent) throw new Error('No event selected');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await fetch(`${API_URL}/api/events/${selectedEvent.id}/image`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update image');
    }

    setShowImageEditModal(false);
    setSelectedEvent(null);
    await loadEvents();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Approved</span>;
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">Pending</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300">{status}</span>;
    }
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
                <Calendar className="h-10 w-10 mr-3 text-pink-500" />
                Event Management
              </h1>
              <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Review, approve, and manage all events
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-4 mb-8`}>
            <div className="flex items-center gap-2 mb-4">
              <Filter className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter by Status:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('PENDING')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'PENDING'
                    ? 'bg-yellow-600 text-white shadow-md'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-yellow-900/30 hover:text-yellow-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('APPROVED')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'APPROVED'
                    ? 'bg-green-600 text-white shadow-md'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-green-900/30 hover:text-green-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilter('REJECTED')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'REJECTED'
                    ? 'bg-red-600 text-white shadow-md'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-red-900/30 hover:text-red-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'ALL'
                    ? 'bg-purple-600 text-white shadow-md'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-purple-900/30 hover:text-purple-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700'
                }`}
              >
                All Events
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current View</p>
                  <p className="text-3xl font-bold text-yellow-500">{events.length}</p>
                </div>
                <AlertCircle size={48} className="text-yellow-500 opacity-20" />
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Filter Active</p>
                  <p className="text-3xl font-bold text-purple-500">{filter}</p>
                </div>
                <Filter size={48} className="text-purple-500 opacity-20" />
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Showing</p>
                  <p className="text-3xl font-bold text-green-500">{events.length}</p>
                </div>
                <CheckCircle size={48} className="text-green-500 opacity-20" />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={`${isDarkMode ? 'bg-gray-800/70' : 'bg-white/70'} backdrop-blur-sm rounded-2xl p-12 text-center`}>
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
              <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading events...</p>
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
              {events.length === 0 ? (
                <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-12 text-center`}>
                  <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                  <h3 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>No events found</h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    No events match the current filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className={`${isDarkMode ? 'bg-gray-700/50 border border-gray-600 hover:border-gray-500' : 'bg-gray-50 border border-gray-200 hover:border-gray-300'} rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Event Image */}
                        <div className="relative w-full md:w-64 h-48 bg-gradient-to-br from-pink-500 to-purple-600 flex-shrink-0">
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
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-medium rounded-full">
                              {event.category}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div className="absolute top-4 right-4">
                            {getStatusBadge(event.status)}
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 p-6">
                          <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{event.title}</h3>
                          <p className={`mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {event.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Date & Time */}
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar size={16} className="text-pink-500" />
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{formatDate(event.eventDate)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Clock size={16} className="text-pink-500" />
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                {formatTime(event.eventTime)} - {formatTime(event.endTime)}
                              </span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin size={16} className="text-pink-500" />
                              <span className={`line-clamp-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{event.location}</span>
                            </div>

                            {/* Capacity */}
                            {event.maxAttendees && (
                              <div className="flex items-center gap-2 text-sm">
                                <Users size={16} className="text-pink-500" />
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Max {event.maxAttendees} attendees</span>
                              </div>
                            )}
                          </div>

                          {/* Creator Info */}
                          <div className={`text-sm mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <User size={14} className="text-pink-500" />
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                <strong>Organizer:</strong> {event.organizerName}
                              </span>
                            </div>
                            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                              Created by: {event.creatorName} ({event.creatorEmail})
                            </p>
                            <p className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                              Submitted: {formatDate(event.createdAt)}
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
                              View
                            </a>

                            <button
                              type="button"
                              onClick={() => openImageEditModal(event)}
                              disabled={actionLoading}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
                            >
                              <ImageIcon size={16} />
                              Edit Image
                            </button>

                            {(event.status === 'PENDING' || event.status === 'REJECTED') && (
                              <button
                                onClick={() => handleApprove(event.id)}
                                disabled={actionLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
                              >
                                <CheckCircle size={16} />
                                Approve
                              </button>
                            )}

                            {(event.status === 'PENDING' || event.status === 'APPROVED') && (
                              <button
                                onClick={() => openRejectModal(event)}
                                disabled={actionLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
                              >
                                <XCircle size={16} />
                                Reject
                              </button>
                            )}

                            <button
                              onClick={() => openDeleteModal(event)}
                              disabled={actionLoading}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
                            >
                              <Trash2 size={16} />
                              Delete
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
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-4">
                    <XCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Reject Event
                  </h2>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  {selectedEvent.imageUrl && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(selectedEvent.imageUrl)}`}
                      alt={selectedEvent.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEvent.title}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedEvent.category} • {selectedEvent.location}</p>
                  </div>
                </div>

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
                    } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="Please provide a clear reason for rejection..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !rejectionReason.trim()}
                    className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200"
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

          {/* Delete Modal */}
          {showDeleteModal && selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-4">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Delete Event Permanently
                  </h2>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  {selectedEvent.imageUrl && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(selectedEvent.imageUrl)}`}
                      alt={selectedEvent.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEvent.title}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedEvent.category} • {selectedEvent.location}</p>
                  </div>
                </div>

                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  Are you sure you want to permanently delete this event?
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-6 font-medium`}>
                  ⚠️ This action cannot be undone. All registrations will be removed.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    {actionLoading ? 'Deleting...' : 'Delete Permanently'}
                  </button>

                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedEvent(null);
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

          {/* Image Edit Modal */}
          <ImageEditModal
            isOpen={showImageEditModal}
            onClose={() => {
              setShowImageEditModal(false);
              setSelectedEvent(null);
            }}
            title={selectedEvent?.title || ''}
            currentImage={selectedEvent?.imageUrl}
            onSave={handleImageSave}
            entityType="event"
          />
        </div>
      </main>
    </AuthGuard>
  );
}
