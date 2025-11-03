'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import AuthGuard from '@/components/AuthGuard';
import { eventService } from '@/services/eventService';
import type { Event } from '@/types/event';
import { Calendar, MapPin, Users, Clock, Image as ImageIcon, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();

  const eventId = params.id ? parseInt(params.id as string) : null;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    eventDate: '',
    eventTime: '',
    endTime: '',
    registrationDeadline: '',
    category: 'Social',
    location: '',
    organizerName: '',
    maxAttendees: '',
    isRecurring: false,
    recurrencePattern: '',
  });

  const categories = [
    'Social',
    'Academic',
    'Sports',
    'Cultural',
    'Club Activity',
    'Workshop',
    'Seminar',
    'Networking',
    'Other',
  ];

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError('');
      const data = await eventService.getEventById(eventId);

      // Check if user is the creator
      if (!user || user.id !== data.creatorId) {
        setError('You do not have permission to edit this event');
        return;
      }

      // Check if event can be edited (only PENDING events)
      if (data.status !== 'PENDING') {
        setError('Only pending events can be edited');
        return;
      }

      setEvent(data);

      // Pre-populate form
      const eventDateTime = new Date(data.eventDate);
      const eventTime = new Date(data.eventTime);
      const endTime = new Date(data.endTime);

      setFormData({
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl || '',
        eventDate: eventDateTime.toISOString().split('T')[0],
        eventTime: eventTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
        registrationDeadline: data.registrationDeadline
          ? new Date(data.registrationDeadline).toISOString().slice(0, 16)
          : '',
        category: data.category,
        location: data.location,
        organizerName: data.organizerName,
        maxAttendees: data.maxAttendees ? data.maxAttendees.toString() : '',
        isRecurring: data.isRecurring,
        recurrencePattern: data.recurrencePattern || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load event');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !eventId) {
      setError('You must be logged in to edit an event');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Combine date and time into ISO format
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`).toISOString();
      const endDateTime = new Date(`${formData.eventDate}T${formData.endTime}`).toISOString();
      const registrationDeadlineDateTime = formData.registrationDeadline
        ? new Date(formData.registrationDeadline).toISOString()
        : undefined;

      const updateData = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl || undefined,
        eventDate: eventDateTime,
        eventTime: eventDateTime,
        endTime: endDateTime,
        registrationDeadline: registrationDeadlineDateTime,
        category: formData.category,
        location: formData.location,
        organizerName: formData.organizerName,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        userId: user.id,
      };

      await eventService.updateEvent(eventId, updateData);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/events/${eventId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update event');
      console.error('Error updating event:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.id || !eventId) return;

    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      await eventService.deleteEvent(eventId, user.id);
      router.push('/events');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
          <AnimatedBackground />
          <Navigation />
          <div className="flex items-center justify-center h-screen">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error && !event) {
    return (
      <AuthGuard>
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
          <AnimatedBackground />
          <Navigation />
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
            <Link href="/events" className="text-blue-500 hover:text-blue-600">
              ← Back to Events
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <AnimatedBackground />
        <Navigation />

        <main className="container mx-auto px-4 py-8 relative z-10 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/events/${eventId}`}
              className={`inline-flex items-center gap-2 mb-4 ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              <ArrowLeft size={20} />
              Back to Event
            </Link>
            <h1 className="text-4xl font-bold mb-2">Edit Event</h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Update your event details
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              Event updated successfully! Redirecting...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Rejection Reason Notice */}
          {event?.rejectionReason && (
            <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
              <strong>Previous Rejection Reason:</strong> {event.rejectionReason}
              <p className="text-sm mt-2">Please address the issues mentioned above before resubmitting.</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image URL */}
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
                    <ImageIcon className="inline mr-2" size={16} />
                    Event Image URL
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Date & Time</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Event Date */}
                <div>
                  <label htmlFor="eventDate" className="block text-sm font-medium mb-2">
                    <Calendar className="inline mr-2" size={16} />
                    Event Date *
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    required
                    value={formData.eventDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label htmlFor="eventTime" className="block text-sm font-medium mb-2">
                    <Clock className="inline mr-2" size={16} />
                    Start Time *
                  </label>
                  <input
                    type="time"
                    id="eventTime"
                    name="eventTime"
                    required
                    value={formData.eventTime}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* End Time */}
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium mb-2">
                    <Clock className="inline mr-2" size={16} />
                    End Time *
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    required
                    value={formData.endTime}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Registration Deadline */}
                <div>
                  <label htmlFor="registrationDeadline" className="block text-sm font-medium mb-2">
                    Registration Deadline
                  </label>
                  <input
                    type="datetime-local"
                    id="registrationDeadline"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Location & Organizer */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Location & Organizer</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-2">
                    <MapPin className="inline mr-2" size={16} />
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Organizer Name */}
                <div>
                  <label htmlFor="organizerName" className="block text-sm font-medium mb-2">
                    Organizer Name
                  </label>
                  <input
                    type="text"
                    id="organizerName"
                    name="organizerName"
                    value={formData.organizerName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Capacity</h2>

              <div>
                <label htmlFor="maxAttendees" className="block text-sm font-medium mb-2">
                  <Users className="inline mr-2" size={16} />
                  Maximum Attendees
                </label>
                <input
                  type="number"
                  id="maxAttendees"
                  name="maxAttendees"
                  min="1"
                  value={formData.maxAttendees}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving || success}
                className={`flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors ${
                  saving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {saving ? 'Saving...' : 'Update Event'}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>

              <Link
                href={`/events/${eventId}`}
                className={`px-6 py-3 ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } rounded-lg font-medium transition-colors text-center`}
              >
                Cancel
              </Link>
            </div>

            <p className={`text-xs mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              * Changes will be resubmitted for admin approval.
            </p>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
