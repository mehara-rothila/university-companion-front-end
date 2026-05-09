'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import { eventService } from '@/services/eventService';
import type { Event, EventComment } from '@/types/event';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Send,
  Trash2,
  Edit,
} from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();

  const eventId = params.id ? parseInt(params.id as string) : null;

  const [event, setEvent] = useState<Event | null>(null);
  const [comments, setComments] = useState<EventComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Registration states
  const [isRegistered, setIsRegistered] = useState(false);
  const [isWaitlisted, setIsWaitlisted] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState('');

  // Comment states
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');

  const isCreator = user && event && user.id === event.creatorId;
  const canEdit = isCreator && event && (event.status === 'PENDING' || event.status === 'REJECTED');

  useEffect(() => {
    let isMounted = true; // Track if component is mounted

    const loadData = async () => {
      if (!eventId) return;

      // Fetch event
      try {
        setLoading(true);
        setError('');
        const data = await eventService.getEventById(eventId);
        if (isMounted) setEvent(data);
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Failed to load event');
          console.error('Error fetching event:', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }

      // Fetch comments
      try {
        const data = await eventService.getEventComments(eventId);
        if (isMounted) setComments(data);
      } catch (err: any) {
        console.error('Error fetching comments:', err);
      }

      // Check registration status
      if (user?.id) {
        try {
          const data = await eventService.isUserRegistered(eventId, user.id);
          if (isMounted) {
            setIsRegistered(data.isRegistered);
            setIsWaitlisted(data.isWaitlisted);
            setWaitlistPosition(data.waitlistPosition || null);
          }
        } catch (err: any) {
          console.error('Error checking registration status:', err);
        }
      }
    };

    loadData();

    // Cleanup function - runs when component unmounts
    return () => {
      isMounted = false;
    };
  }, [eventId, user?.id]);

  const fetchEvent = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError('');
      const data = await eventService.getEventById(eventId);
      setEvent(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load event');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!eventId) return;

    try {
      const data = await eventService.getEventComments(eventId);
      setComments(data);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
    }
  };

  const checkRegistrationStatus = async () => {
    if (!eventId || !user?.id) return;

    try {
      const data = await eventService.isUserRegistered(eventId, user.id);
      setIsRegistered(data.isRegistered);
      setIsWaitlisted(data.isWaitlisted);
      setWaitlistPosition(data.waitlistPosition || null);
    } catch (err: any) {
      console.error('Error checking registration status:', err);
    }
  };

  const handleRegister = async () => {
    if (!eventId || !user?.id) return;

    // Prevent double submission
    if (registrationLoading) return;

    // Check if registration deadline has passed
    if (event?.registrationDeadline) {
      const deadline = new Date(event.registrationDeadline);
      if (deadline < new Date()) {
        setRegistrationError(t('events.errors.deadlinePassed') || 'Registration deadline has passed');
        return;
      }
    }

    // Check if event date has passed
    if (event?.eventDate && event?.eventTime) {
      const eventDateTime = new Date(`${event.eventDate}T${event.eventTime}`);
      if (eventDateTime < new Date()) {
        setRegistrationError(t('events.errors.eventPassed') || 'This event has already occurred');
        return;
      }
    }

    setRegistrationLoading(true);
    setRegistrationError('');
    setRegistrationSuccess('');

    try {
      const response = await eventService.registerForEvent(eventId, {});
      setRegistrationSuccess(response.message);

      // Refresh registration status and event details
      await checkRegistrationStatus();
      await fetchEvent();

      // Clear success message after 3 seconds
      setTimeout(() => setRegistrationSuccess(''), 3000);
    } catch (err: any) {
      setRegistrationError(err.response?.data?.error || 'Failed to register for event');
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!eventId || !user?.id) return;

    // Prevent double submission
    if (registrationLoading) return;

    if (!confirm(t('events.confirmations.cancelRegistration'))) return;

    setRegistrationLoading(true);
    setRegistrationError('');
    setRegistrationSuccess('');

    try {
      const response = await eventService.cancelRegistration(eventId);
      setRegistrationSuccess(response.message);

      // Refresh registration status and event details
      await checkRegistrationStatus();
      await fetchEvent();

      // Clear success message after 3 seconds
      setTimeout(() => setRegistrationSuccess(''), 3000);
    } catch (err: any) {
      setRegistrationError(err.response?.data?.error || 'Failed to cancel registration');
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !user?.id || !newComment.trim()) return;

    setCommentLoading(true);
    setCommentError('');

    try {
      await eventService.addEventComment(eventId, {
        comment: newComment.trim(),
      });

      setNewComment('');
      await fetchComments();
    } catch (err: any) {
      setCommentError(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!eventId || !user?.id) return;

    if (!confirm(t('events.confirmations.deleteComment'))) return;

    try {
      await eventService.deleteEventComment(eventId, commentId);
      await fetchComments();
    } catch (err: any) {
      console.error('Error deleting comment:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        <AnimatedBackground variant="dashboard" />
        <Navigation />
        <div className="flex items-center justify-center h-screen relative z-10">
          <div className={`${isDarkMode ? 'bg-gray-800/70' : 'bg-white/70'} backdrop-blur-sm rounded-2xl p-12`}>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        <AnimatedBackground variant="dashboard" />
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-24 relative z-10">
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-8 border backdrop-blur-sm`}>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error || 'Event not found'}
            </div>
            <Link href="/events" className={`inline-block ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
              ← Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        <AnimatedBackground variant="dashboard" />
        <Navigation />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/events"
              className={`inline-flex items-center gap-2 mb-4 ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              <ArrowLeft size={20} />
              Back to Events
            </Link>
          </div>

          {/* Event Image */}
          <div className="relative h-96 rounded-lg overflow-hidden mb-8 bg-gradient-to-br from-blue-500 to-purple-600">
            {event.imageUrl ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(event.imageUrl)}`}
                alt={event.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar size={128} className="text-white opacity-50" />
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 font-medium rounded-full">
                {event.category}
              </span>
            </div>

            {/* Status Badge (for creator) */}
            {isCreator && (
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span
                  className={`px-4 py-2 backdrop-blur-sm font-medium rounded-full ${
                    event.status === 'PENDING'
                      ? 'bg-yellow-500/90 text-yellow-900'
                      : event.status === 'APPROVED'
                      ? 'bg-green-500/90 text-green-900'
                      : 'bg-red-500/90 text-red-900'
                  }`}
                >
                  {event.status}
                </span>

                {/* Faculty Auto-Approval Badge */}
                {event.status === 'APPROVED' &&
                 event.approvedBy &&
                 event.creatorId === event.approvedBy &&
                 event.creatorRole === 'FACULTY' && (
                  <span className="px-4 py-2 bg-emerald-600/90 backdrop-blur-sm text-white font-medium rounded-full text-sm flex items-center gap-1">
                    <CheckCircle size={16} />
                    Faculty Verified
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Title and Description */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-8 mb-8 border backdrop-blur-sm`}>
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-4xl font-bold">{event.title}</h1>
                  {canEdit && (
                    <Link
                      href={`/events/${event.id}/edit`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                    >
                      <Edit size={16} />
                      Edit
                    </Link>
                  )}
                </div>

                <p className={`text-lg whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {event.description}
                </p>

                {event.rejectionReason && isCreator && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <strong>Rejection Reason:</strong> {event.rejectionReason}
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-8 border backdrop-blur-sm`}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MessageCircle size={24} />
                  Comments ({comments.length})
                </h2>

                {/* Add Comment Form */}
                {user ? (
                  <form onSubmit={handleAddComment} className="mb-6">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={commentLoading || !newComment.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2"
                      >
                        <Send size={16} />
                        Post
                      </button>
                    </div>
                    {commentError && <p className="text-red-500 text-sm mt-2">{commentError}</p>}
                  </form>
                ) : (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 rounded-lg text-center">
                    <Link href="/login" className="font-medium hover:underline">
                      Login to add comments
                    </Link>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      No comments yet. Be the first to comment!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-semibold">{comment.userName || 'Anonymous'}</span>
                            <span className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatCommentDate(comment.createdAt)}
                            </span>
                          </div>
                          {user?.id === comment.userId && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{comment.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Registration Card */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 mb-6 border backdrop-blur-sm`}>
                <h2 className="text-xl font-bold mb-4">Registration</h2>

                {registrationSuccess && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                    {registrationSuccess}
                  </div>
                )}

                {registrationError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {registrationError}
                  </div>
                )}

                {isRegistered && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
                    <CheckCircle size={20} />
                    <span>You're registered for this event</span>
                  </div>
                )}

                {isWaitlisted && (
                  <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>
                      {waitlistPosition
                        ? `You're #${waitlistPosition} on the waitlist`
                        : "You're on the waitlist"}
                    </span>
                  </div>
                )}

                {!user ? (
                  <Link
                    href="/login"
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium mb-4 text-center block"
                  >
                    Login to Register
                  </Link>
                ) : !isRegistered && !isWaitlisted ? (
                  <button
                    onClick={handleRegister}
                    disabled={registrationLoading}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium mb-4"
                  >
                    {registrationLoading ? 'Processing...' : 'Register for Event'}
                  </button>
                ) : null}

                {user && (isRegistered || isWaitlisted) && (
                  <button
                    onClick={handleCancelRegistration}
                    disabled={registrationLoading}
                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium mb-4"
                  >
                    {registrationLoading ? 'Processing...' : 'Cancel Registration'}
                  </button>
                )}

                {/* Capacity Info */}
                {event.maxAttendees && (
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="flex justify-between mb-2">
                      <span>Registered:</span>
                      <span className="font-semibold">
                        {event.registeredCount || 0} / {event.maxAttendees}
                      </span>
                    </div>
                    {event.waitlistCount !== undefined && event.waitlistCount > 0 && (
                      <div className="flex justify-between">
                        <span>Waitlist:</span>
                        <span className="font-semibold">{event.waitlistCount}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Event Details Card */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}>
                <h2 className="text-xl font-bold mb-4">Event Details</h2>

                <div className="space-y-4">
                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <Calendar size={20} className="text-blue-500 mt-1" />
                    <div>
                      <p className="font-semibold">Date</p>
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {formatDate(event.eventDate)}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-blue-500 mt-1" />
                    <div>
                      <p className="font-semibold">Time</p>
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {formatTime(event.eventTime)} - {formatTime(event.endTime)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-blue-500 mt-1" />
                    <div>
                      <p className="font-semibold">Location</p>
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{event.location}</p>
                    </div>
                  </div>

                  {/* Organizer */}
                  <div className="flex items-start gap-3">
                    <Users size={20} className="text-blue-500 mt-1" />
                    <div>
                      <p className="font-semibold">Organizer</p>
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{event.organizerName}</p>
                    </div>
                  </div>

                  {/* Registration Deadline */}
                  {event.registrationDeadline && (
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-blue-500 mt-1" />
                      <div>
                        <p className="font-semibold">Registration Deadline</p>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {formatDate(event.registrationDeadline)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recurring */}
                  {event.isRecurring && (
                    <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-sm">
                      This is a recurring event ({event.recurrencePattern})
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
