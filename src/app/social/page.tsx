// src/app/social/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface Event {
  id: string;
  title: string;
  description: string;
  type: 'academic' | 'social' | 'sports' | 'cultural' | 'volunteer' | 'workshop' | 'competition';
  date: Date;
  endDate?: Date;
  location: string;
  organizer: string;
  capacity: number;
  attendees: number;
  isRegistered: boolean;
  isPaid: boolean;
  price?: number;
  tags: string[];
  image?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  aiRecommended?: boolean;
  similarInterests?: number;
}

interface Club {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'hobby' | 'sports' | 'cultural' | 'volunteer' | 'professional';
  members: number;
  isJoined: boolean;
  meetingSchedule: string;
  location: string;
  contactEmail: string;
  upcomingEvents: number;
  tags: string[];
  image?: string;
  president: string;
  founded: Date;
}

interface SocialPost {
  id: string;
  author: string;
  authorRole: 'student' | 'faculty' | 'staff' | 'club';
  content: string;
  timestamp: Date;
  type: 'announcement' | 'question' | 'achievement' | 'event' | 'discussion';
  likes: number;
  comments: number;
  isLiked: boolean;
  tags: string[];
  attachments?: {
    type: 'image' | 'file' | 'event';
    url: string;
    name: string;
  }[];
}

interface AIRecommendation {
  id: string;
  type: 'event' | 'club' | 'person' | 'activity';
  title: string;
  description: string;
  confidence: number;
  reason: string;
  actionText: string;
  actionUrl?: string;
}

type ActiveTab = 'events' | 'clubs' | 'feed' | 'discover';

// --- Helper Functions ---
const toRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// --- Constants ---
const MOCK_EVENTS: Event[] = [
    {
      id: '1',
      title: 'Mora TechFest 2024',
      description: 'Annual technology festival showcasing student innovations, tech talks, and startup pitches.',
      type: 'academic',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      location: 'IT Faculty Auditorium',
      organizer: 'Computer Society (CoSMo)',
      capacity: 500,
      attendees: 234,
      isRegistered: false,
      isPaid: false,
      tags: ['Technology', 'Innovation', 'Startups', 'Competition'],
      aiRecommended: true,
      similarInterests: 95
    },
    {
      id: '2',
      title: 'MoraHack 2024',
      description: '48-hour hackathon bringing together the brightest minds to solve real-world problems.',
      type: 'competition',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      location: 'Engineering Faculty Labs',
      organizer: 'IEEE Student Branch UoM',
      capacity: 150,
      attendees: 89,
      isRegistered: true,
      isPaid: true,
      price: 500, // LKR
      tags: ['Hackathon', 'Programming', 'Innovation'],
      difficulty: 'intermediate',
      aiRecommended: true,
      similarInterests: 92
    },
    {
      id: '3',
      title: 'Annual Sports Meet',
      description: 'Inter-faculty sports competition with track and field, team sports, and fun activities.',
      type: 'sports',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      location: 'University Sports Grounds',
      organizer: 'Sports Council UoM',
      capacity: 2000,
      attendees: 1245,
      isRegistered: false,
      isPaid: false,
      tags: ['Sports', 'Competition', 'Inter-faculty'],
      similarInterests: 67
    },
    {
      id: '4',
      title: 'Career Fair 2024',
      description: 'Meet top employers, explore career opportunities, and network with industry professionals.',
      type: 'academic',
      date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      location: 'Main Auditorium',
      organizer: 'Career Guidance Unit',
      capacity: 800,
      attendees: 432,
      isRegistered: false,
      isPaid: false,
      tags: ['Career', 'Jobs', 'Networking', 'Industry'],
      aiRecommended: true,
      similarInterests: 88
    },
    {
      id: '5',
      title: 'Rotaract Community Service',
      description: 'Join us for a community outreach program to support local schools in Moratuwa.',
      type: 'volunteer',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      location: 'Local Schools in Moratuwa',
      organizer: 'Rotaract Club UoM',
      capacity: 40,
      attendees: 28,
      isRegistered: false,
      isPaid: false,
      tags: ['Volunteer', 'Community', 'Education', 'Service'],
      similarInterests: 71
    },
    {
      id: '6',
      title: 'Mozilla Open Source Workshop',
      description: 'Learn about open source contribution and web technologies with Mozilla University Club.',
      type: 'workshop',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      location: 'IT Faculty Computer Lab',
      organizer: 'Mozilla University Club UoM',
      capacity: 30,
      attendees: 22,
      isRegistered: true,
      isPaid: false,
      tags: ['Open Source', 'Web Development', 'Mozilla', 'Programming'],
      difficulty: 'beginner',
      similarInterests: 84
    }
];

const MOCK_CLUBS: Club[] = [
    {
      id: '1',
      name: 'Computer Society of University of Moratuwa (CoSMo)',
      description: 'Leading tech community promoting innovation, coding competitions, and industry connections.',
      category: 'academic',
      members: 450,
      isJoined: true,
      meetingSchedule: 'Weekly Fridays 4 PM',
      location: 'IT Faculty Auditorium',
      contactEmail: 'cosmo@uom.lk',
      upcomingEvents: 5,
      tags: ['Programming', 'Tech Talks', 'Hackathons', 'Industry'],
      president: 'Kasun Perera',
      founded: new Date('2010-03-15')
    },
    {
      id: '2',
      name: 'Engineering Students Society (ESS)',
      description: 'Representing engineering students and organizing academic and social events.',
      category: 'academic',
      members: 1200,
      isJoined: false,
      meetingSchedule: 'Monthly General Meetings',
      location: 'Engineering Faculty Main Hall',
      contactEmail: 'ess@uom.lk',
      upcomingEvents: 3,
      tags: ['Engineering', 'Student Representation', 'Events'],
      president: 'Dilani Silva',
      founded: new Date('1978-01-01')
    },
    {
      id: '3',
      name: 'Mozilla University Club UoM',
      description: 'Open source community focusing on web technologies and Mozilla projects.',
      category: 'academic',
      members: 120,
      isJoined: true,
      meetingSchedule: 'Bi-weekly Saturdays 2 PM',
      location: 'IT Faculty Computer Lab',
      contactEmail: 'mozilla@uom.lk',
      upcomingEvents: 2,
      tags: ['Open Source', 'Web Development', 'Mozilla', 'Community'],
      president: 'Nimal Fernando',
      founded: new Date('2015-09-10')
    },
    {
      id: '4',
      name: 'Rotaract Club of University of Moratuwa',
      description: 'Service-oriented club focusing on community development and leadership.',
      category: 'volunteer',
      members: 85,
      isJoined: false,
      meetingSchedule: 'Weekly Wednesdays 5 PM',
      location: 'Student Center Meeting Room',
      contactEmail: 'rotaract@uom.lk',
      upcomingEvents: 4,
      tags: ['Community Service', 'Leadership', 'Rotary'],
      president: 'Ayesha Rathnayake',
      founded: new Date('1995-08-20')
    },
    {
      id: '5',
      name: 'IEEE Student Branch UoM',
      description: 'Professional development for electrical and computer engineering students.',
      category: 'professional',
      members: 180,
      isJoined: false,
      meetingSchedule: 'Monthly First Friday',
      location: 'Engineering Faculty Conference Room',
      contactEmail: 'ieee@uom.lk',
      upcomingEvents: 3,
      tags: ['IEEE', 'Engineering', 'Professional', 'Networking'],
      president: 'Chamara Wickramasinghe',
      founded: new Date('1985-05-22')
    },
    {
      id: '6',
      name: 'Leo Club of University of Moratuwa',
      description: 'Youth wing of Lions Club focusing on leadership and community service.',
      category: 'volunteer',
      members: 95,
      isJoined: false,
      meetingSchedule: 'Bi-weekly Thursdays 6 PM',
      location: 'Student Center Hall B',
      contactEmail: 'leo@uom.lk',
      upcomingEvents: 2,
      tags: ['Leadership', 'Community Service', 'Youth Development'],
      president: 'Sandun Jayasinghe',
      founded: new Date('1992-11-08')
    }
];

const MOCK_SOCIAL_POSTS: SocialPost[] = [
    {
      id: '1',
      author: 'Tech Innovation Club',
      authorRole: 'club',
      content: 'Excited to announce our upcoming hackathon! 48 hours of coding, collaboration, and innovation. Registration opens Monday. Who\'s ready to build something amazing? 🚀',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'announcement',
      likes: 24,
      comments: 8,
      isLiked: false,
      tags: ['Hackathon', 'Programming', 'Innovation']
    },
    {
      id: '2',
      author: 'Dr. Sarah Chen',
      authorRole: 'faculty',
      content: 'Looking forward to tomorrow\'s AI in Healthcare talk! We\'ll explore how machine learning is revolutionizing diagnostics and patient care. See you at Student Union Auditorium at 2 PM.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      type: 'event',
      likes: 18,
      comments: 3,
      isLiked: true,
      tags: ['AI', 'Healthcare', 'Tech Talk']
    },
    {
      id: '3',
      author: 'Maya Patel',
      authorRole: 'student',
      content: 'Just captured this amazing sunset from the library roof! 📸 Photography Society meeting this Friday - newcomers welcome! Let\'s explore university through our lenses.',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      type: 'achievement',
      likes: 31,
      comments: 12,
      isLiked: false,
      tags: ['Photography', 'University Life', 'Art'],
      attachments: [
        { type: 'image', url: '/sunset.jpg', name: 'University Sunset' }
      ]
    },
    {
      id: '4',
      author: 'Environmental Club',
      authorRole: 'club',
      content: 'Thanks to everyone who joined our community garden volunteer day! We planted over 200 new vegetables and herbs. Next session: this Saturday at 9 AM. 🌱',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      type: 'announcement',
      likes: 15,
      comments: 6,
      isLiked: true,
      tags: ['Environment', 'Volunteer', 'Community Garden']
    },
    {
      id: '5',
      author: 'Alex Johnson',
      authorRole: 'student',
      content: 'Has anyone tried the new study spaces in the engineering building? Looking for a quiet spot for my CS project. Any recommendations? 🤔',
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
      type: 'question',
      likes: 7,
      comments: 14,
      isLiked: false,
      tags: ['Study Spaces', 'Engineering', 'Question']
    }
];

export default function SocialPage() {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<ActiveTab>('events');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);

  // Mock data
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);

  // Initialize component
  useEffect(() => {
    setTimeout(() => {
      setEvents(MOCK_EVENTS);
      setClubs(MOCK_CLUBS);
      setSocialPosts(MOCK_SOCIAL_POSTS);
      
      // Generate AI recommendations
      const recommendations: AIRecommendation[] = [
        {
          id: '1',
          type: 'event',
          title: 'AI Healthcare Talk Matches Your Interests',
          description: 'Based on your CS coursework and wellness app usage, this event aligns 94% with your interests.',
          confidence: 94,
          reason: 'High match with technology and healthcare interests',
          actionText: 'Register for Event',
          actionUrl: '/social?event=1'
        },
        {
          id: '2',
          type: 'club',
          title: 'Photography Society Recommendation',
          description: 'Students with your interests often enjoy creative outlets. Photography Society has weekly university walks.',
          confidence: 78,
          reason: 'Creative students with tech backgrounds often enjoy photography',
          actionText: 'Learn More About Club',
          actionUrl: '/social?club=2'
        },
        {
          id: '3',
          type: 'person',
          title: 'Connect with Similar Students',
          description: 'Found 12 students with similar academic interests and study patterns in your area.',
          confidence: 85,
          reason: 'Shared courses and study times indicate potential compatibility',
          actionText: 'View Connections'
        }
      ];
      
      setAiRecommendations(recommendations);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter events and clubs based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilters = selectedFilters.length === 0 || 
      selectedFilters.includes(event.type) ||
      selectedFilters.some(filter => event.tags.includes(filter));
    
    return matchesSearch && matchesFilters;
  });

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = searchQuery === '' || 
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilters = selectedFilters.length === 0 || 
      selectedFilters.includes(club.category) ||
      selectedFilters.some(filter => club.tags.includes(filter));
    
    return matchesSearch && matchesFilters;
  });

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'academic':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
      case 'social':
        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'sports':
        return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      case 'cultural':
        return 'text-purple-500 bg-purple-100 dark:bg-purple-900/30';
      case 'volunteer':
        return 'text-pink-500 bg-pink-100 dark:bg-pink-900/30';
      case 'workshop':
        return 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30';
      case 'competition':
        return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'hobby':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'professional':
        return 'text-teal-500 bg-teal-100 dark:bg-teal-900/30';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Toggle filter
  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Handle event registration
  const handleEventRegistration = useCallback((eventId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              isRegistered: !event.isRegistered,
              attendees: event.isRegistered ? event.attendees - 1 : event.attendees + 1
            } 
          : event
      )
    );
  }, []);

  // Handle club join
  const handleClubJoin = useCallback((clubId: string) => {
    setClubs(prev => 
      prev.map(club => 
        club.id === clubId 
          ? { 
              ...club, 
              isJoined: !club.isJoined,
              members: club.isJoined ? club.members - 1 : club.members + 1
            } 
          : club
      )
    );
  }, []);

  // Handle post like
  const handlePostLike = useCallback((postId: string) => {
    setSocialPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
  }, []);

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading social activities...</p>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Social & Activities
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Discover events, join communities, and connect with peers through AI-powered recommendations
                </p>
              </div>

              {/* Create Event Button */}
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Event
                </button>
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
                AI Recommendations for You
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
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>{rec.description}</p>
                    <button className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                      {rec.actionText} →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className={`mb-8 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in`}>
            <div className="flex overflow-x-auto">
              {[
                { id: 'events', label: 'Events', icon: '📅', count: events.length },
                { id: 'clubs', label: 'Clubs & Organizations', icon: '🏛️', count: clubs.length },
                { id: 'feed', label: 'University Feed', icon: '📰', count: socialPosts.length },
                { id: 'discover', label: 'Discover', icon: '🔍', count: null }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex-1 px-6 py-4 font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? `${isDarkMode ? 'text-purple-400 border-purple-400' : 'text-purple-600 border-purple-600'} border-b-2`
                      : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {tab.count && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          {(activeTab === 'events' || activeTab === 'clubs') && (
            <div className={`mb-8 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      placeholder={`Search ${activeTab}...`}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Filter Tags */}
                <div className="flex flex-wrap gap-2">
                  {(activeTab === 'events' 
                    ? ['academic', 'social', 'sports', 'cultural', 'volunteer', 'workshop', 'competition']
                    : ['academic', 'hobby', 'sports', 'cultural', 'volunteer', 'professional']
                  ).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => toggleFilter(filter)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 capitalize ${
                        selectedFilters.includes(filter)
                          ? 'bg-purple-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'events' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <div 
                  key={event.id}
                  className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {event.aiRecommended && (
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 text-sm font-medium">
                      ⭐ AI Recommended - {event.similarInterests}% match
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Event Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                          {event.title}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          by {event.organizer}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </div>

                    {/* Event Details */}
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 line-clamp-3`}>
                      {event.description}
                    </p>

                    {/* Event Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6m6-6H4" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {event.location}
                        </span>
                      </div>

                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {event.attendees}/{event.capacity} attending
                        </span>
                      </div>

                      {event.price && (
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            ${event.price}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEventRegistration(event.id)}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          event.isRegistered
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
                        }`}
                      >
                        {event.isRegistered ? 'Registered ✓' : 'Register'}
                      </button>
                      
                      <Link
                        href={`/navigation?destination=${encodeURIComponent(event.location)}`}
                        className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'clubs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club, index) => (
                <div 
                  key={club.id}
                  className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Club Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                        {club.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {club.members} members • Founded {club.founded.getFullYear()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor(club.category)}`}>
                      {club.category}
                    </span>
                  </div>

                  {/* Club Description */}
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 line-clamp-3`}>
                    {club.description}
                  </p>

                  {/* Club Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6m6-6H4" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {club.meetingSchedule}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {club.location}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        President: {club.president}
                      </span>
                    </div>

                    {club.upcomingEvents > 0 && (
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6m6-6H4" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {club.upcomingEvents} upcoming events
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {club.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleClubJoin(club.id)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        club.isJoined
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
                      }`}
                    >
                      {club.isJoined ? 'Joined ✓' : 'Join Club'}
                    </button>
                    
                    <Link
                      href={`mailto:${club.contactEmail}`}
                      className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'feed' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {socialPosts.map((post, index) => (
                <div 
                  key={post.id}
                  className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} flex items-center justify-center mr-3`}>
                        <span className="text-lg font-bold">
                          {post.author.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {post.author}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {post.authorRole} • {toRelativeTimeString(post.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor(post.type)}`}>
                      {post.type}
                    </span>
                  </div>

                  {/* Post Content */}
                  <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 leading-relaxed`}>
                    {post.content}
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, idx) => (
                        <span key={idx} className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handlePostLike(post.id)}
                      className={`flex items-center space-x-2 transition-colors duration-200 ${
                        post.isLiked 
                          ? 'text-red-500 hover:text-red-600' 
                          : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-sm">{post.likes}</span>
                    </button>

                    <button className={`flex items-center space-x-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm">{post.comments}</span>
                    </button>

                    <button className={`flex items-center space-x-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'discover' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Interest-based Discovery */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  Discover Based on Your Interests
                </h3>
                
                <div className="space-y-4">
                  {[
                    { interest: 'Technology & AI', matches: 12, type: 'events & clubs' },
                    { interest: 'Environmental Sustainability', matches: 8, type: 'volunteer opportunities' },
                    { interest: 'Creative Arts', matches: 15, type: 'clubs & workshops' },
                    { interest: 'Health & Wellness', matches: 6, type: 'activities & groups' }
                  ].map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} hover:bg-opacity-80 transition-colors duration-200 cursor-pointer`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {item.interest}
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.matches} {item.type} found
                          </p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Activities */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  Trending This Week
                </h3>
                
                <div className="space-y-4">
                  {[
                    { name: 'AI Healthcare Talk', trend: '+45%', participants: 87 },
                    { name: 'Startup Competition', trend: '+32%', participants: 45 },
                    { name: 'Photography Society', trend: '+28%', participants: 89 },
                    { name: 'Environmental Club', trend: '+21%', participants: 156 }
                  ].map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {item.name}
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.participants} participants
                          </p>
                        </div>
                        <span className="text-sm font-medium text-green-500">
                          {item.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Create New Event
                </h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Event Title
                  </label>
                  <input 
                    type="text" 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder="Enter event title"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Event Type
                  </label>
                  <select className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}>
                    <option value="academic">Academic</option>
                    <option value="social">Social</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Description
                  </label>
                  <textarea 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    rows={3}
                    placeholder="Describe your event"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Date
                    </label>
                    <input 
                      type="date" 
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Time
                    </label>
                    <input 
                      type="time" 
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Location
                  </label>
                  <input 
                    type="text" 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder="Event location"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Capacity
                    </label>
                    <input 
                      type="number" 
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="Max attendees"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Price (Optional)
                    </label>
                    <input 
                      type="number" 
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="$0"
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    // A custom modal or toast notification would be better than alert() in a real app
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
