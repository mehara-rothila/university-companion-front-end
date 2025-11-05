'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import AuthGuard from '@/components/AuthGuard';
import { eventService } from '@/services/eventService';
import { fileUploadService } from '@/services/fileUploadService';
import type { CreateEventRequest } from '@/types/event';
import { Calendar, MapPin, Users, Clock, Image as ImageIcon, ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';

export default function CreateEventPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setError(t('events.errors.mustBeLoggedIn'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload image if file is selected
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadResult = await fileUploadService.uploadImage(imageFile, 'event-images');
        imageUrl = uploadResult.fileUrl;
      }

      // Combine date and time into ISO format
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
      const endDateTime = new Date(`${formData.eventDate}T${formData.endTime}`);
      const registrationDeadlineDateTime = formData.registrationDeadline
        ? new Date(formData.registrationDeadline)
        : undefined;

      // Validation: Check if end time is after start time (backend safety check)
      if (endDateTime <= eventDateTime) {
        setError(t('events.errors.invalidEndTime'));
        setLoading(false);
        return;
      }

      // Validation: Check if registration deadline is before event date (backend safety check)
      if (registrationDeadlineDateTime && registrationDeadlineDateTime >= eventDateTime) {
        setError(t('events.errors.invalidDeadline'));
        setLoading(false);
        return;
      }

      // Convert to ISO strings
      const eventDateTimeISO = eventDateTime.toISOString();
      const endDateTimeISO = endDateTime.toISOString();
      const registrationDeadlineDateTimeISO = registrationDeadlineDateTime?.toISOString();

      const eventData: CreateEventRequest = {
        title: formData.title,
        description: formData.description,
        imageUrl: imageUrl || undefined,
        eventDate: eventDateTimeISO,
        eventTime: eventDateTimeISO,
        endTime: endDateTimeISO,
        registrationDeadline: registrationDeadlineDateTimeISO,
        category: formData.category,
        location: formData.location,
        organizerName: formData.organizerName || `${user.firstName} ${user.lastName}`,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        creatorId: user.id,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.isRecurring ? formData.recurrencePattern : undefined,
      };

      await eventService.createEvent(eventData);

      setSuccess(true);
      setTimeout(() => {
        router.push('/events');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || t('events.errors.createFailed'));
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        <AnimatedBackground variant="dashboard" />
        <Navigation />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          {/* Header */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 mb-8 border backdrop-blur-sm animate-fade-in`}>
            <Link
              href="/events"
              className={`inline-flex items-center gap-2 mb-4 ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              <ArrowLeft size={20} />
              {t('events.backToEvents')}
            </Link>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>{t('events.form.createTitle')}</h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('events.form.createDescription')}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              {t('events.messages.createSuccessRedirect')}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-8 border backdrop-blur-sm animate-fade-in`}>
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{t('events.form.basicInfo')}</h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    {t('events.form.eventTitle')} *
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
                    placeholder={t('events.form.placeholders.title')}
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    {t('events.form.description')} *
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
                    placeholder={t('events.form.placeholders.description')}
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-2">
                    {t('events.form.category')} *
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

                {/* Event Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <ImageIcon className="inline mr-2" size={16} />
                    {t('events.form.imageUpload')}
                  </label>

                  <div className={`border-2 border-dashed rounded-lg p-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                          aria-label={t('events.form.removeImage')}
                          title={t('events.form.removeImage')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block text-center">
                        <Upload className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{t('events.form.clickToUpload')}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{t('events.form.imageFormats')}</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="mt-3">
                    <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('events.form.orProvideUrl')}</p>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      disabled={!!imageFile}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white disabled:opacity-50'
                          : 'bg-white border-gray-300 text-gray-900 disabled:opacity-50'
                      }`}
                      placeholder={t('events.form.placeholders.imageUrl')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{t('events.form.dateTime')}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Event Date */}
                <div>
                  <label htmlFor="eventDate" className="block text-sm font-medium mb-2">
                    <Calendar className="inline mr-2" size={16} />
                    {t('events.form.eventDate')} *
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
                    {t('events.form.startTime')} *
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
                    {t('events.form.endTime')} *
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    required
                    value={formData.endTime}
                    onChange={handleChange}
                    min={formData.eventTime || undefined}
                    disabled={!formData.eventDate || !formData.eventTime}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'bg-white border-gray-300 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {!formData.eventDate || !formData.eventTime
                      ? t('events.form.validationEndTime')
                      : t('events.form.validationEndTimeMust')}
                  </p>
                </div>

                {/* Registration Deadline */}
                <div>
                  <label htmlFor="registrationDeadline" className="block text-sm font-medium mb-2">
                    {t('events.form.registrationDeadline')}
                  </label>
                  <input
                    type="datetime-local"
                    id="registrationDeadline"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    disabled={!formData.eventDate || !formData.eventTime}
                    min={new Date().toISOString().slice(0, 16)}
                    max={
                      formData.eventDate && formData.eventTime
                        ? `${formData.eventDate}T${formData.eventTime}`
                        : undefined
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'bg-white border-gray-300 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {!formData.eventDate || !formData.eventTime
                      ? t('events.form.validationDeadline')
                      : t('events.form.validationDeadlineRange', {
                          eventDateTime: new Date(formData.eventDate + 'T' + formData.eventTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        })}
                  </p>
                </div>
              </div>
            </div>

            {/* Location & Organizer */}
            <div className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{t('events.form.locationOrganizer')}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-2">
                    <MapPin className="inline mr-2" size={16} />
                    {t('events.form.location')} *
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
                    placeholder={t('events.form.placeholders.location')}
                  />
                </div>

                {/* Organizer Name */}
                <div>
                  <label htmlFor="organizerName" className="block text-sm font-medium mb-2">
                    {t('events.form.organizerName')}
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
                    placeholder={`${user?.firstName} ${user?.lastName}`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('events.form.placeholders.organizerName')}
                  </p>
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{t('events.form.capacity')}</h2>

              <div>
                <label htmlFor="maxAttendees" className="block text-sm font-medium mb-2">
                  <Users className="inline mr-2" size={16} />
                  {t('events.form.maxAttendees')}
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
                  placeholder="e.g., 100"
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('events.form.hints.maxAttendees')}
                </p>
              </div>
            </div>

            {/* Recurring Event */}
            <div className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{t('events.form.recurrence')}</h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium">
                    {t('events.form.isRecurring')}
                  </label>
                </div>

                {formData.isRecurring && (
                  <div>
                    <label htmlFor="recurrencePattern" className="block text-sm font-medium mb-2">
                      {t('events.form.recurrencePattern')}
                    </label>
                    <select
                      id="recurrencePattern"
                      name="recurrencePattern"
                      value={formData.recurrencePattern}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">{t('events.form.recurrenceOptions.select')}</option>
                      <option value="WEEKLY">{t('events.form.recurrenceOptions.weekly')}</option>
                      <option value="BIWEEKLY">{t('events.form.recurrenceOptions.biweekly')}</option>
                      <option value="MONTHLY">{t('events.form.recurrenceOptions.monthly')}</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || success}
                className={`flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? t('events.form.buttons.creating') : t('events.form.buttons.create')}
              </button>

              <Link
                href="/events"
                className={`px-6 py-3 ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } rounded-lg font-medium transition-colors text-center`}
              >
                {t('events.form.buttons.cancel')}
              </Link>
            </div>

            <p className={`text-xs mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              * {t('events.form.hints.approvalNote')}
            </p>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
