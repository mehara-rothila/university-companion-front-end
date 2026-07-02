// src/app/study-spaces/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface StudySpace {
  id: string;
  name: string;
  type: 'quiet' | 'collaborative' | 'computer-lab' | 'meeting-room' | 'outdoor' | 'cafe';
  building: string;
  floor: number;
  room: string;
  capacity: number;
  currentOccupancy: number;
  availability: 'available' | 'busy' | 'full' | 'reserved';
  features: string[];
  equipment: string[];
  rating: number;
  reviewCount: number;
  noiseLevel: 'silent' | 'quiet' | 'moderate' | 'lively';
  lighting: 'natural' | 'artificial' | 'mixed';
  reservable: boolean;
  timeSlots?: TimeSlot[];
  images?: string[];
  aiScore?: number;
  predictedBusyTimes?: { time: string; occupancy: number }[];
  accessibilityFeatures: string[];
  nearbyAmenities: string[];
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
  reservedBy?: string;
}

interface AIRecommendation {
  id: string;
  spaceId: string;
  reason: string;
  confidence: number;
  optimalTime: string;
  expectedOccupancy: number;
}

interface SpaceFilter {
  type: string[];
  capacity: { min: number; max: number };
  features: string[];
  availability: string[];
  noiseLevel: string[];
  building: string[];
  hasEquipment: string[];
}

type SortBy = 'ai-score' | 'distance' | 'availability' | 'rating' | 'capacity';
type ViewMode = 'grid' | 'list' | 'map';

export default function StudySpacesPage() {
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('ai-score');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<StudySpace | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [reservationPurpose, setReservationPurpose] = useState('');

  // Mock data
  const [studySpaces, setStudySpaces] = useState<StudySpace[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [filters, setFilters] = useState<SpaceFilter>({
    type: [],
    capacity: { min: 1, max: 50 },
    features: [],
    availability: [],
    noiseLevel: [],
    building: [],
    hasEquipment: [],
  });

  // Initialize component
  useEffect(() => {
    setTimeout(() => {
      // Mock study spaces data
      const mockSpaces: StudySpace[] = [
        {
          id: '1',
          name: 'Silent Study Zone',
          type: 'quiet',
          building: 'Main Library',
          floor: 3,
          room: 'L3-001',
          capacity: 40,
          currentOccupancy: 12,
          availability: 'available',
          features: ['Individual desks', 'Power outlets', 'Natural light', 'Climate controlled'],
          equipment: ['Desk lamps', 'Charging stations'],
          rating: 4.8,
          reviewCount: 156,
          noiseLevel: 'silent',
          lighting: 'natural',
          reservable: false,
          aiScore: 94,
          predictedBusyTimes: [
            { time: '14:00', occupancy: 85 },
            { time: '15:00', occupancy: 92 },
            { time: '16:00', occupancy: 78 },
          ],
          accessibilityFeatures: ['Wheelchair accessible', 'Adjustable desks'],
          nearbyAmenities: ['Restrooms', 'Water fountain', 'Cafe'],
        },
        {
          id: '2',
          name: 'Collaborative Hub',
          type: 'collaborative',
          building: 'Student Union',
          floor: 2,
          room: 'SU-205',
          capacity: 24,
          currentOccupancy: 18,
          availability: 'busy',
          features: ['Whiteboards', 'Moveable furniture', 'Group tables', 'Presentation screen'],
          equipment: ['Projector', 'Speakers', 'Whiteboard markers'],
          rating: 4.5,
          reviewCount: 89,
          noiseLevel: 'moderate',
          lighting: 'mixed',
          reservable: true,
          timeSlots: [
            { id: '1', startTime: '14:00', endTime: '16:00', available: true },
            {
              id: '2',
              startTime: '16:00',
              endTime: '18:00',
              available: false,
              reservedBy: 'CS Study Group',
            },
            { id: '3', startTime: '18:00', endTime: '20:00', available: true },
          ],
          aiScore: 87,
          accessibilityFeatures: ['Wheelchair accessible'],
          nearbyAmenities: ['Cafe', 'Bookstore', 'Tech support'],
        },
        {
          id: '3',
          name: 'Computer Lab Alpha',
          type: 'computer-lab',
          building: 'Engineering Building',
          floor: 1,
          room: 'ENG-101',
          capacity: 30,
          currentOccupancy: 8,
          availability: 'available',
          features: [
            'High-spec computers',
            'Programming software',
            'Dual monitors',
            'Ergonomic chairs',
          ],
          equipment: ['Computers', 'Software suites', 'Printers', 'Scanners'],
          rating: 4.7,
          reviewCount: 234,
          noiseLevel: 'quiet',
          lighting: 'artificial',
          reservable: true,
          timeSlots: [
            { id: '1', startTime: '13:00', endTime: '15:00', available: true },
            { id: '2', startTime: '15:00', endTime: '17:00', available: true },
            {
              id: '3',
              startTime: '17:00',
              endTime: '19:00',
              available: false,
              reservedBy: 'AI Workshop',
            },
          ],
          aiScore: 91,
          accessibilityFeatures: ['Wheelchair accessible', 'Screen readers', 'Adjustable desks'],
          nearbyAmenities: ['Tech support', 'Vending machines', 'Study rooms'],
        },
        {
          id: '4',
          name: 'Garden Study Pavilion',
          type: 'outdoor',
          building: 'University Green',
          floor: 0,
          room: 'Outdoor',
          capacity: 16,
          currentOccupancy: 4,
          availability: 'available',
          features: ['Fresh air', 'Nature views', 'Weather protection', 'Wi-Fi'],
          equipment: ['Tables', 'Benches', 'Power outlets'],
          rating: 4.3,
          reviewCount: 67,
          noiseLevel: 'moderate',
          lighting: 'natural',
          reservable: false,
          aiScore: 76,
          accessibilityFeatures: ['Wheelchair accessible paths'],
          nearbyAmenities: ['University cafe', 'Restrooms', 'Bike racks'],
        },
        {
          id: '5',
          name: 'Group Meeting Room B',
          type: 'meeting-room',
          building: 'Business School',
          floor: 2,
          room: 'BS-201B',
          capacity: 8,
          currentOccupancy: 0,
          availability: 'available',
          features: [
            'Conference table',
            'Video conferencing',
            'Sound isolation',
            'Climate control',
          ],
          equipment: ['Smart TV', 'Video camera', 'Microphones', 'Conference phone'],
          rating: 4.9,
          reviewCount: 45,
          noiseLevel: 'quiet',
          lighting: 'artificial',
          reservable: true,
          timeSlots: [
            { id: '1', startTime: '12:00', endTime: '14:00', available: true },
            { id: '2', startTime: '14:00', endTime: '16:00', available: true },
            { id: '3', startTime: '16:00', endTime: '18:00', available: true },
          ],
          aiScore: 89,
          accessibilityFeatures: ['Wheelchair accessible', 'Hearing loop system'],
          nearbyAmenities: ['Business library', 'Cafe', 'Printing services'],
        },
        {
          id: '6',
          name: 'Library Cafe Corner',
          type: 'cafe',
          building: 'Main Library',
          floor: 1,
          room: 'L1-Cafe',
          capacity: 20,
          currentOccupancy: 15,
          availability: 'busy',
          features: [
            'Casual atmosphere',
            'Food & drinks',
            'Comfortable seating',
            'Background music',
          ],
          equipment: ['Soft seating', 'Coffee tables', 'Bar height tables'],
          rating: 4.2,
          reviewCount: 128,
          noiseLevel: 'lively',
          lighting: 'mixed',
          reservable: false,
          aiScore: 68,
          accessibilityFeatures: ['Wheelchair accessible'],
          nearbyAmenities: ['Cafe counter', 'Restrooms', 'Library services'],
        },
      ];

      // Generate AI recommendations
      const recommendations: AIRecommendation[] = [
        {
          id: '1',
          spaceId: '1',
          reason: 'Perfect for your CS project - quiet environment with optimal focus conditions',
          confidence: 94,
          optimalTime: '14:30',
          expectedOccupancy: 30,
        },
        {
          id: '2',
          spaceId: '3',
          reason: 'Programming environment with required software already installed',
          confidence: 91,
          optimalTime: '13:00',
          expectedOccupancy: 27,
        },
        {
          id: '3',
          spaceId: '2',
          reason: 'Great for group study sessions based on your collaboration patterns',
          confidence: 87,
          optimalTime: '14:00',
          expectedOccupancy: 75,
        },
      ];

      setStudySpaces(mockSpaces);
      setAiRecommendations(recommendations);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and sort spaces
  const filteredAndSortedSpaces = studySpaces
    .filter((space) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          space.name.toLowerCase().includes(query) ||
          space.building.toLowerCase().includes(query) ||
          space.features.some((feature) => feature.toLowerCase().includes(query)) ||
          space.type.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(space.type)) return false;

      // Capacity filter
      if (space.capacity < filters.capacity.min || space.capacity > filters.capacity.max)
        return false;

      // Availability filter
      if (filters.availability.length > 0 && !filters.availability.includes(space.availability))
        return false;

      // Noise level filter
      if (filters.noiseLevel.length > 0 && !filters.noiseLevel.includes(space.noiseLevel))
        return false;

      // Building filter
      if (filters.building.length > 0 && !filters.building.includes(space.building)) return false;

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'ai-score':
          return (b.aiScore || 0) - (a.aiScore || 0);
        case 'rating':
          return b.rating - a.rating;
        case 'availability':
          const availabilityOrder = { available: 3, busy: 2, reserved: 1, full: 0 };
          return availabilityOrder[b.availability] - availabilityOrder[a.availability];
        case 'capacity':
          return b.capacity - a.capacity;
        default:
          return 0;
      }
    });

  // Get availability color
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'busy':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'full':
        return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'reserved':
        return 'text-purple-500 bg-purple-100 dark:bg-purple-900/30';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Get space type color
  const getSpaceTypeColor = (type: string) => {
    switch (type) {
      case 'quiet':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
      case 'collaborative':
        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'computer-lab':
        return 'text-purple-500 bg-purple-100 dark:bg-purple-900/30';
      case 'meeting-room':
        return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      case 'outdoor':
        return 'text-teal-500 bg-teal-100 dark:bg-teal-900/30';
      case 'cafe':
        return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Get noise level icon
  const getNoiseIcon = (level: string) => {
    switch (level) {
      case 'silent':
        return '🔇';
      case 'quiet':
        return '🔉';
      case 'moderate':
        return '🔊';
      case 'lively':
        return '🎵';
      default:
        return '🔊';
    }
  };

  // Handle reservation
  const handleReservation = useCallback((space: StudySpace) => {
    setSelectedSpace(space);
    setShowReserveModal(true);
  }, []);

  // Submit reservation
  const submitReservation = () => {
    if (!selectedSpace || !selectedTimeSlot || !reservationPurpose) return;

    // Here you would typically send the reservation to your API
    console.log('Reservation submitted:', {
      spaceId: selectedSpace.id,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      purpose: reservationPurpose,
    });

    setShowReserveModal(false);
    setSelectedSpace(null);
    setSelectedTimeSlot('');
    setReservationPurpose('');

    // Show success message (in a real app, you'd use a proper notification system)
    alert('Reservation confirmed!');
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      type: [],
      capacity: { min: 1, max: 50 },
      features: [],
      availability: [],
      noiseLevel: [],
      building: [],
      hasEquipment: [],
    });
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main
          className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}
        >
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Finding available study spaces...
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main
        className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}
      >
        <AnimatedBackground variant="dashboard" />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1
                  className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 flex items-center`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 mr-3 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Study Space Finder
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI-powered study space recommendations with real-time availability
                </p>
              </div>

              {/* Quick Stats */}
              <div className="mt-4 md:mt-0 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}
                >
                  <p
                    className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
                  >
                    {studySpaces.filter((s) => s.availability === 'available').length}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Available
                  </p>
                </div>
                <div
                  className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}
                >
                  <p
                    className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}
                  >
                    {studySpaces.filter((s) => s.availability === 'busy').length}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Busy
                  </p>
                </div>
                <div
                  className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}
                >
                  <p
                    className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}
                  >
                    {studySpaces.filter((s) => s.reservable).length}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Reservable
                  </p>
                </div>
                <div
                  className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}
                >
                  <p
                    className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                  >
                    {Math.round(
                      (studySpaces.reduce((acc, s) => acc + s.rating, 0) / studySpaces.length) * 10
                    ) / 10}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Avg Rating
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          {aiRecommendations.length > 0 && (
            <div
              className={`mb-8 ${isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} rounded-2xl p-6 border animate-fade-in`}
            >
              <h3
                className={`text-lg font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'} mb-4 flex items-center`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                AI Study Space Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiRecommendations.map((rec) => {
                  const space = studySpaces.find((s) => s.id === rec.spaceId);
                  if (!space) return null;

                  return (
                    <div
                      key={rec.id}
                      className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4
                          className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                        >
                          {space.name}
                        </h4>
                        <span
                          className={`text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}
                        >
                          {rec.confidence}%
                        </span>
                      </div>
                      <p
                        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}
                      >
                        {rec.reason}
                      </p>
                      <p
                        className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mb-3`}
                      >
                        Best time: {rec.optimalTime} • Expected {rec.expectedOccupancy}% full
                      </p>
                      <button
                        onClick={() => {
                          const element = document.getElementById(`space-${space.id}`);
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        View Space →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search and Controls */}
          <div
            className={`mb-8 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Search study spaces..."
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Sort By */}
              <div className="lg:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="ai-score">AI Recommended</option>
                  <option value="availability">Availability</option>
                  <option value="rating">Rating</option>
                  <option value="capacity">Capacity</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex border rounded-lg overflow-hidden">
                {(['grid', 'list'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-3 transition-colors duration-200 ${
                      viewMode === mode
                        ? 'bg-purple-600 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mode === 'grid' ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  showFilters
                    ? 'bg-purple-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 inline mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filters
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div
                className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Space Type */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                    >
                      Space Type
                    </label>
                    <div className="space-y-2">
                      {[
                        'quiet',
                        'collaborative',
                        'computer-lab',
                        'meeting-room',
                        'outdoor',
                        'cafe',
                      ].map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.type.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters((prev) => ({ ...prev, type: [...prev.type, type] }));
                              } else {
                                setFilters((prev) => ({
                                  ...prev,
                                  type: prev.type.filter((t) => t !== type),
                                }));
                              }
                            }}
                            className="mr-2 text-purple-600 focus:ring-purple-500"
                          />
                          <span
                            className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            {type.replace('-', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                    >
                      Availability
                    </label>
                    <div className="space-y-2">
                      {['available', 'busy'].map((avail) => (
                        <label key={avail} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.availability.includes(avail)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters((prev) => ({
                                  ...prev,
                                  availability: [...prev.availability, avail],
                                }));
                              } else {
                                setFilters((prev) => ({
                                  ...prev,
                                  availability: prev.availability.filter((a) => a !== avail),
                                }));
                              }
                            }}
                            className="mr-2 text-purple-600 focus:ring-purple-500"
                          />
                          <span
                            className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            {avail}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Noise Level */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                    >
                      Noise Level
                    </label>
                    <div className="space-y-2">
                      {['silent', 'quiet', 'moderate', 'lively'].map((noise) => (
                        <label key={noise} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.noiseLevel.includes(noise)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters((prev) => ({
                                  ...prev,
                                  noiseLevel: [...prev.noiseLevel, noise],
                                }));
                              } else {
                                setFilters((prev) => ({
                                  ...prev,
                                  noiseLevel: prev.noiseLevel.filter((n) => n !== noise),
                                }));
                              }
                            }}
                            className="mr-2 text-purple-600 focus:ring-purple-500"
                          />
                          <span
                            className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            {getNoiseIcon(noise)} {noise}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Capacity Range */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                    >
                      Capacity: {filters.capacity.min}-{filters.capacity.max}
                    </label>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={filters.capacity.min}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            capacity: { ...prev.capacity, min: parseInt(e.target.value) },
                          }))
                        }
                        className="w-full"
                      />
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={filters.capacity.max}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            capacity: { ...prev.capacity, max: parseInt(e.target.value) },
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Study Spaces Grid/List */}
          <div
            className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}`}
          >
            {filteredAndSortedSpaces.map((space, index) => (
              <div
                key={space.id}
                id={`space-${space.id}`}
                className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in ${viewMode === 'list' ? 'flex' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* AI Badge */}
                {aiRecommendations.some((rec) => rec.spaceId === space.id) && (
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 text-sm font-medium">
                    ⭐ AI Recommended - {space.aiScore}% match
                  </div>
                )}

                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  {/* Space Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3
                        className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-1`}
                      >
                        {space.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {space.building} • Floor {space.floor} • {space.room}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full capitalize ${getSpaceTypeColor(space.type)}`}
                      >
                        {space.type.replace('-', ' ')}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full capitalize ${getAvailabilityColor(space.availability)}`}
                      >
                        {space.availability}
                      </span>
                    </div>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Occupancy
                      </span>
                      <span
                        className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                      >
                        {space.currentOccupancy}/{space.capacity}
                      </span>
                    </div>
                    <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          space.currentOccupancy / space.capacity < 0.5
                            ? 'bg-green-500'
                            : space.currentOccupancy / space.capacity < 0.8
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${(space.currentOccupancy / space.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Space Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="text-lg mr-2">{getNoiseIcon(space.noiseLevel)}</span>
                      <span
                        className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} capitalize`}
                      >
                        {space.noiseLevel} environment
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-purple-500 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Capacity: {space.capacity} people
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-purple-500 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {space.rating}/5 ({space.reviewCount} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <h4
                      className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}
                    >
                      Features
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {space.features.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                        >
                          {feature}
                        </span>
                      ))}
                      {space.features.length > 3 && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}
                        >
                          +{space.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {space.reservable ? (
                      <button
                        onClick={() => handleReservation(space)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                      >
                        Reserve
                      </button>
                    ) : (
                      <span
                        className={`flex-1 px-4 py-2 text-center rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}
                      >
                        Walk-in Only
                      </span>
                    )}

                    <Link
                      href={`/navigation?destination=${encodeURIComponent(`${space.building} ${space.room}`)}`}
                      className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                    </Link>

                    <button
                      className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Predicted Busy Times */}
                  {space.predictedBusyTimes && space.predictedBusyTimes.length > 0 && (
                    <div
                      className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                    >
                      <h5
                        className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}
                      >
                        📊 AI Prediction
                      </h5>
                      <div className="flex space-x-2 text-xs">
                        {space.predictedBusyTimes.slice(0, 3).map((prediction, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded ${
                              prediction.occupancy > 80
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : prediction.occupancy > 60
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}
                          >
                            {prediction.time}: {prediction.occupancy}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredAndSortedSpaces.length === 0 && (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-lg font-medium mb-2">No study spaces found</h3>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          )}
        </div>

        {/* Reservation Modal */}
        {showReserveModal && selectedSpace && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  Reserve {selectedSpace.name}
                </h2>
                <button
                  onClick={() => setShowReserveModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Space Info */}
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedSpace.building} • Floor {selectedSpace.floor} • {selectedSpace.room}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Capacity: {selectedSpace.capacity} • {selectedSpace.noiseLevel} environment
                  </p>
                </div>

                {/* Date */}
                <div>
                  <label
                    className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                {/* Time Slot */}
                <div>
                  <label
                    className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                  >
                    Time Slot
                  </label>
                  <div className="space-y-2">
                    {selectedSpace.timeSlots?.map((slot) => (
                      <label key={slot.id} className="flex items-center">
                        <input
                          type="radio"
                          name="timeSlot"
                          value={`${slot.startTime}-${slot.endTime}`}
                          checked={selectedTimeSlot === `${slot.startTime}-${slot.endTime}`}
                          onChange={(e) => setSelectedTimeSlot(e.target.value)}
                          disabled={!slot.available}
                          className="mr-2 text-purple-600 focus:ring-purple-500"
                        />
                        <span
                          className={`text-sm ${
                            slot.available
                              ? isDarkMode
                                ? 'text-gray-300'
                                : 'text-gray-700'
                              : isDarkMode
                                ? 'text-gray-500'
                                : 'text-gray-500'
                          }`}
                        >
                          {slot.startTime} - {slot.endTime}
                          {!slot.available && ` (Reserved by ${slot.reservedBy})`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label
                    className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                  >
                    Purpose
                  </label>
                  <select
                    value={reservationPurpose}
                    onChange={(e) => setReservationPurpose(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="">Select purpose</option>
                    <option value="individual-study">Individual Study</option>
                    <option value="group-study">Group Study</option>
                    <option value="project-work">Project Work</option>
                    <option value="meeting">Meeting</option>
                    <option value="exam-prep">Exam Preparation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Submit */}
                <button
                  onClick={submitReservation}
                  disabled={!selectedTimeSlot || !reservationPurpose}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedTimeSlot && reservationPurpose
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                  }`}
                >
                  Confirm Reservation
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
