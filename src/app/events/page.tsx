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
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        <AnimatedBackground variant="dashboard" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          {/* Header */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 mb-8 border backdrop-blur-sm animate-fade-in`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                  Events & Socials
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Discover and join upcoming events
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link
                  href="/events/create"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} />
                  Create Event
                </Link>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 mb-8 border backdrop-blur-sm animate-fade-in`}>
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Time Filter */}
              <div>
                <label htmlFor="time-filter" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Time</label>
                <select
                  id="time-filter"
                  value={selectedTimeFilter}
                  onChange={(e) => setSelectedTimeFilter(e.target.value as any)}
                  aria-label="Filter events by time"
                  className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                <label htmlFor="category-filter" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter events by category"
                  className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                <label htmlFor="search-events" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Search</label>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="search-events"
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <label htmlFor="location-filter" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="location-filter"
                    type="text"
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                  {filteredEvents.map((event, index) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className={`block ${
                        isDarkMode ? 'bg-gray-800/90 border-gray-700 hover:bg-gray-800' : 'bg-white/90 border-gray-100 hover:bg-gray-50'
                      } rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-xl animate-fade-in`}
                      style={{ animationDelay: `${index * 0.1}s` }}
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
        </div>
      </main>
    </AuthGuard>
  );
}
