'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import AuthGuard from '@/components/AuthGuard';
import { eventService } from '@/services/eventService';
import type { Event, EventCategory } from '@/types/event';
import { Calendar, MapPin, Users, Clock, Plus, Filter, Search } from 'lucide-react';

export default function EventsPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const categories = [
    'All',
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
    fetchEvents();
  }, [selectedTimeFilter]);

  useEffect(() => {
    applyFilters();
  }, [events, selectedCategory, searchQuery, locationFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      let data: Event[];
      if (selectedTimeFilter === 'upcoming') {
        data = await eventService.getUpcomingEvents();
      } else if (selectedTimeFilter === 'past') {
        data = await eventService.getPastEvents();
      } else {
        data = await eventService.getApprovedEvents();
      }

      setEvents(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((event) => event.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter((event) =>
        event.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
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

  return (
    <AuthGuard>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <AnimatedBackground />
        <Navigation />

        <main className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Events & Socials</h1>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Discover and join upcoming events
              </p>
            </div>
            <Link
              href="/events/create"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              Create Event
            </Link>
          </div>

          {/* Filters */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-8`}>
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-blue-500" />
              <h2 className="text-xl font-semibold">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Time Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <select
                  value={selectedTimeFilter}
                  onChange={(e) => setSelectedTimeFilter(e.target.value as any)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Events</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past Events</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {categories.map((category) => (
                    <option key={category} value={category === 'All' ? 'all' : category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-500">Loading events...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Events Grid */}
          {!loading && !error && (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                </p>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar size={64} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">No events found</h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Try adjusting your filters or create a new event
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className={`block ${
                        isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                      } rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl`}
                    >
                      {/* Event Image */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                        {event.imageUrl ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(event.imageUrl)}`}
                            alt={event.title}
                            fill
                            className="object-cover"
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

                      {/* Event Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 line-clamp-2">{event.title}</h3>
                        <p
                          className={`text-sm mb-4 line-clamp-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {event.description}
                        </p>

                        <div className="space-y-2 text-sm">
                          {/* Date & Time */}
                          <div className="flex items-center gap-2 text-blue-500">
                            <Calendar size={16} />
                            <span>{formatDate(event.eventDate)}</span>
                          </div>

                          <div className="flex items-center gap-2 text-blue-500">
                            <Clock size={16} />
                            <span>
                              {formatTime(event.eventTime)} - {formatTime(event.endTime)}
                            </span>
                          </div>

                          {/* Location */}
                          <div
                            className={`flex items-center gap-2 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            <MapPin size={16} />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>

                          {/* Attendees */}
                          {event.maxAttendees && (
                            <div
                              className={`flex items-center gap-2 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              <Users size={16} />
                              <span>
                                {event.registeredCount || 0} / {event.maxAttendees} registered
                              </span>
                              {event.spotsAvailable !== null &&
                                event.spotsAvailable !== undefined &&
                                event.spotsAvailable === 0 && (
                                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                                    Full
                                  </span>
                                )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
