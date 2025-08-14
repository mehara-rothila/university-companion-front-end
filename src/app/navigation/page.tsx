// src/app/navigation/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface MapLocation {
  id: string;
  name: string;
  type: 'building' | 'dining' | 'parking' | 'recreation' | 'service' | 'landmark';
  coordinates: { lat: number; lng: number };
  address: string;
  description?: string;
  amenities: string[];
  hours?: string;
  crowdLevel: 'low' | 'medium' | 'high';
  accessibility: AccessibilityFeature[];
  imageUrl?: string;
}

interface AccessibilityFeature {
  type: 'wheelchair' | 'elevator' | 'ramp' | 'audio' | 'visual' | 'parking';
  available: boolean;
  description: string;
}

interface Route {
  id: string;
  from: string;
  to: string;
  distance: number;
  estimatedTime: number;
  difficulty: 'easy' | 'moderate' | 'difficult';
  steps: RouteStep[];
  avoidsCrowds: boolean;
  isAccessible: boolean;
  warnings?: string[];
}

interface RouteStep {
  instruction: string;
  direction: 'straight' | 'left' | 'right' | 'slight-left' | 'slight-right';
  distance: number;
  landmark?: string;
}

interface TrafficAlert {
  id: string;
  type: 'construction' | 'event' | 'closure' | 'maintenance' | 'weather';
  title: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  startTime: Date;
  endTime?: Date;
  affectedRoutes: string[];
}

interface AIRecommendation {
  id: string;
  type: 'route' | 'timing' | 'alternative' | 'accessibility';
  title: string;
  description: string;
  confidence: number;
  estimatedSavings?: string;
}

export default function NavigationPage() {
  const { isDarkMode } = useDarkMode();
  const [currentLocation, setCurrentLocation] = useState<string>('Main Campus Entrance');
  const [destination, setDestination] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapMode, setMapMode] = useState<'interactive' | 'satellite' | 'accessibility'>('interactive');
  const [trafficAlerts, setTrafficAlerts] = useState<TrafficAlert[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  
  const [filters, setFilters] = useState({
    avoidCrowds: false,
    accessibleOnly: false,
    shortestRoute: true,
    coverFromRain: false
  });

  // Mock campus locations
  const campusLocations: MapLocation[] = [
    {
      id: '1',
      name: 'Main Library',
      type: 'building',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      address: '123 Campus Drive',
      description: 'Central academic library with 5 floors of study spaces',
      amenities: ['WiFi', '24/7 Access', 'Study Rooms', 'Computers', 'Printing'],
      hours: '24/7',
      crowdLevel: 'high',
      accessibility: [
        { type: 'wheelchair', available: true, description: 'Full wheelchair accessibility' },
        { type: 'elevator', available: true, description: 'Elevators to all floors' },
        { type: 'audio', available: true, description: 'Audio assistance available' }
      ]
    },
    {
      id: '2',
      name: 'Student Center',
      type: 'building',
      coordinates: { lat: 40.7130, lng: -74.0055 },
      address: '456 University Blvd',
      description: 'Hub for student activities, dining, and services',
      amenities: ['Food Court', 'ATM', 'Study Lounges', 'Meeting Rooms', 'WiFi'],
      hours: '6 AM - 11 PM',
      crowdLevel: 'medium',
      accessibility: [
        { type: 'wheelchair', available: true, description: 'Fully accessible' },
        { type: 'elevator', available: true, description: 'Multiple elevators' }
      ]
    },
    {
      id: '3',
      name: 'Engineering Building',
      type: 'building',
      coordinates: { lat: 40.7125, lng: -74.0065 },
      address: '789 Tech Way',
      description: 'Computer labs, engineering classrooms, and research facilities',
      amenities: ['Computer Labs', 'WiFi', 'Printing', '3D Printers', 'Workshops'],
      hours: '6 AM - 10 PM',
      crowdLevel: 'medium',
      accessibility: [
        { type: 'wheelchair', available: true, description: 'ADA compliant' },
        { type: 'elevator', available: true, description: 'Modern elevator system' }
      ]
    },
    {
      id: '4',
      name: 'North Dining Hall',
      type: 'dining',
      coordinates: { lat: 40.7135, lng: -74.0050 },
      address: '321 Food Court Ave',
      description: 'Main dining facility with various food options',
      amenities: ['All-you-can-eat', 'Vegetarian Options', 'Halal', 'Kosher', 'Outdoor Seating'],
      hours: '7 AM - 9 PM',
      crowdLevel: 'high',
      accessibility: [
        { type: 'wheelchair', available: true, description: 'Accessible entrance and seating' }
      ]
    },
    {
      id: '5',
      name: 'Recreation Center',
      type: 'recreation',
      coordinates: { lat: 40.7120, lng: -74.0070 },
      address: '654 Fitness Dr',
      description: 'Gym, pool, courts, and fitness classes',
      amenities: ['Gym', 'Pool', 'Basketball Courts', 'Fitness Classes', 'Locker Rooms'],
      hours: '5 AM - 11 PM',
      crowdLevel: 'medium',
      accessibility: [
        { type: 'wheelchair', available: true, description: 'Accessible gym equipment' },
        { type: 'elevator', available: true, description: 'Elevator to all levels' }
      ]
    },
    {
      id: '6',
      name: 'Parking Garage A',
      type: 'parking',
      coordinates: { lat: 40.7122, lng: -74.0075 },
      address: '987 Parking Way',
      description: '500-space parking garage with EV charging',
      amenities: ['EV Charging', 'Covered Parking', 'Security Cameras', '24/7 Access'],
      hours: '24/7',
      crowdLevel: 'low',
      accessibility: [
        { type: 'wheelchair', available: true, description: 'Accessible parking spots' },
        { type: 'elevator', available: true, description: 'Elevator access' }
      ]
    }
  ];

  // Mock traffic alerts
  const mockTrafficAlerts: TrafficAlert[] = [
    {
      id: '1',
      type: 'construction',
      title: 'Library Entrance Construction',
      description: 'Main entrance under renovation. Use north entrance.',
      location: 'Main Library',
      severity: 'medium',
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      affectedRoutes: ['main-library']
    },
    {
      id: '2',
      type: 'event',
      title: 'Graduation Ceremony',
      description: 'Large crowd expected. Allow extra travel time.',
      location: 'Central Quad',
      severity: 'high',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
      affectedRoutes: ['central-campus']
    }
  ];

  // Filter locations based on search
  const filteredLocations = campusLocations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.amenities.some(amenity => amenity.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Initialize component
  useEffect(() => {
    // Get destination from URL params if available
    const urlParams = new URLSearchParams(window.location.search);
    const urlDestination = urlParams.get('destination');
    if (urlDestination) {
      setDestination(urlDestination);
    }

    setTimeout(() => {
      setTrafficAlerts(mockTrafficAlerts);
      
      // Generate AI recommendations
      const recommendations: AIRecommendation[] = [
        {
          id: '1',
          type: 'route',
          title: 'Avoid Construction Zone',
          description: 'Library main entrance is under construction. North entrance route is 2 minutes faster.',
          confidence: 94,
          estimatedSavings: '2 minutes'
        },
        {
          id: '2',
          type: 'timing',
          title: 'Optimal Travel Time',
          description: 'Based on crowd patterns, traveling in 15 minutes will avoid dining hall rush.',
          confidence: 87,
          estimatedSavings: '5 minutes'
        },
        {
          id: '3',
          type: 'alternative',
          title: 'Indoor Route Available',
          description: 'Weather forecast shows rain. Covered walkway route available with only 1 minute extra.',
          confidence: 92,
          estimatedSavings: 'Stay dry'
        }
      ];
      
      setAiRecommendations(recommendations);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Generate route
  const generateRoute = (from: string, to: string): Route => {
    // Mock route generation
    const mockSteps: RouteStep[] = [
      {
        instruction: 'Head east on Campus Drive',
        direction: 'straight',
        distance: 200,
        landmark: 'Pass the campus fountain'
      },
      {
        instruction: 'Turn left at University Boulevard',
        direction: 'left',
        distance: 150,
        landmark: 'Engineering Building on your right'
      },
      {
        instruction: 'Continue straight to destination',
        direction: 'straight',
        distance: 100,
        landmark: 'Main entrance ahead'
      }
    ];

    return {
      id: `route-${Date.now()}`,
      from,
      to,
      distance: 450,
      estimatedTime: 6,
      difficulty: 'easy',
      steps: mockSteps,
      avoidsCrowds: filters.avoidCrowds,
      isAccessible: filters.accessibleOnly,
      warnings: mockTrafficAlerts.length > 0 ? ['Construction near destination'] : undefined
    };
  };

  // Handle navigation start
  const handleStartNavigation = () => {
    if (!destination) return;
    
    const route = generateRoute(currentLocation, destination);
    setSelectedRoute(route);
    setIsNavigating(true);
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'medium':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low':
        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Get crowd level color
  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading campus map...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        
        <AnimatedBackground variant="dashboard" />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Campus Navigation
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI-powered smart navigation with real-time crowd analysis
                </p>
              </div>

              {/* Map Mode Toggle */}
              <div className="mt-4 md:mt-0 flex space-x-2">
                {(['interactive', 'satellite', 'accessibility'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setMapMode(mode)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 capitalize ${
                      mapMode === mode
                        ? 'bg-purple-600 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          {aiRecommendations.length > 0 && (
            <div className={`mb-8 ${isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} rounded-2xl p-6 border animate-fade-in`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'} mb-4 flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Smart Navigation Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiRecommendations.map((rec) => (
                  <div key={rec.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{rec.title}</h4>
                      <span className={`text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                        {rec.confidence}%
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{rec.description}</p>
                    {rec.estimatedSavings && (
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        💡 Saves: {rec.estimatedSavings}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Traffic Alerts */}
          {trafficAlerts.length > 0 && (
            <div className={`mb-8 ${isDarkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} rounded-2xl p-6 border animate-fade-in`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'} mb-4 flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.18 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Campus Alerts
              </h3>
              <div className="space-y-3">
                {trafficAlerts.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{alert.title}</h4>
                          <span className={`ml-2 text-xs px-2 py-1 rounded-full capitalize ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{alert.description}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                          📍 {alert.location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Map and Route Display */}
            <div className={`lg:col-span-2 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in`}>
              {/* Search and Controls */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  {/* Current Location */}
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      From (Current Location)
                    </label>
                    <div className={`flex items-center px-3 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{currentLocation}</span>
                    </div>
                  </div>

                  {/* Destination Search */}
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Where do you want to go?
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className={`w-full px-4 py-3 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                        placeholder="Search for buildings, dining, parking..."
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleStartNavigation}
                      disabled={!destination}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                        destination
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Navigation
                    </button>
                    
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    </button>
                  </div>

                  {/* Filters */}
                  {showFilters && (
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} space-y-3`}>
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Route Preferences</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'avoidCrowds', label: 'Avoid crowds' },
                          { key: 'accessibleOnly', label: 'Accessible routes only' },
                          { key: 'shortestRoute', label: 'Shortest route' },
                          { key: 'coverFromRain', label: 'Indoor/covered when possible' }
                        ].map((filter) => (
                          <label key={filter.key} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters[filter.key as keyof typeof filters]}
                              onChange={(e) => setFilters(prev => ({ ...prev, [filter.key]: e.target.checked }))}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {filter.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mock Map Display */}
              <div className="p-6">
                <div className={`h-96 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center relative overflow-hidden`}>
                  {/* Map Placeholder */}
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Interactive campus map
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      Mode: {mapMode}
                    </p>
                  </div>

                  {/* Route Display */}
                  {selectedRoute && (
                    <div className="absolute top-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                        Route to {selectedRoute.to}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          📏 {selectedRoute.distance}m
                        </span>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          🕒 {selectedRoute.estimatedTime} min
                        </span>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          🚶 {selectedRoute.difficulty}
                        </span>
                        {selectedRoute.isAccessible && (
                          <span className="text-green-500">♿ Accessible</span>
                        )}
                      </div>
                      {selectedRoute.warnings && (
                        <div className="mt-2">
                          {selectedRoute.warnings.map((warning, index) => (
                            <p key={index} className="text-sm text-yellow-600 dark:text-yellow-400">
                              ⚠️ {warning}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Step-by-step directions */}
                {selectedRoute && isNavigating && (
                  <div className="mt-6">
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                      Step-by-step Directions
                    </h4>
                    <div className="space-y-3">
                      {selectedRoute.steps.map((step, index) => (
                        <div key={index} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} flex items-start`}>
                          <div className={`w-6 h-6 rounded-full ${isDarkMode ? 'bg-purple-600' : 'bg-purple-500'} text-white text-xs flex items-center justify-center mr-3 mt-0.5 flex-shrink-0`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {step.instruction}
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                              {step.distance}m {step.landmark && `• ${step.landmark}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Search and Information */}
            <div className="space-y-6">
              
              {/* Quick Search */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  Find Locations
                </h3>
                
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Search campus locations..."
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredLocations.map((location) => (
                    <div 
                      key={location.id} 
                      className={`p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setDestination(location.name)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {location.name}
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                            {location.address}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                              {location.type}
                            </span>
                            <span className={`ml-2 text-xs ${getCrowdColor(location.crowdLevel)}`}>
                              ● {location.crowdLevel} traffic
                            </span>
                          </div>
                        </div>
                        
                        <div className="ml-3 text-right">
                          {location.accessibility.some(a => a.type === 'wheelchair' && a.available) && (
                            <span className="text-xs text-green-500">♿</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Destinations */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  Popular Destinations
                </h3>
                
                <div className="space-y-3">
                  {campusLocations.slice(0, 4).map((location) => (
                    <button
                      key={location.id}
                      onClick={() => setDestination(location.name)}
                      className={`w-full p-3 text-left rounded-lg transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700/50 hover:bg-gray-600 text-gray-100' 
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{location.name}</h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {location.type} • {location.crowdLevel} traffic
                          </p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campus Services */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  Campus Services
                </h3>
                
                <div className="space-y-3">
                  {[
                    { name: 'Campus Shuttle', status: 'Running', nextArrival: '3 min' },
                    { name: 'Parking Availability', status: 'Available', spaces: '23 spaces' },
                    { name: 'Emergency Services', status: 'Active', phone: '911' },
                    { name: 'Accessibility Support', status: 'Available', phone: 'x2345' }
                  ].map((service, index) => (
                    <div key={index} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {service.name}
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {service.nextArrival || service.spaces || service.phone}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          service.status === 'Running' || service.status === 'Available' || service.status === 'Active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}