// src/app/library/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description: string;
  category: 'textbook' | 'reference' | 'fiction' | 'research' | 'journal' | 'digital';
  availability: 'available' | 'checked-out' | 'reserved' | 'reference-only';
  location: string;
  callNumber: string;
  dueDate?: Date;
  reservations: number;
  format: 'physical' | 'digital' | 'both';
  aiRecommended?: boolean;
  relevanceScore?: number;
  relatedResources?: string[];
}

interface DigitalResource {
  id: string;
  title: string;
  type: 'database' | 'journal' | 'ebook' | 'video' | 'dataset' | 'software';
  description: string;
  provider: string;
  subjects: string[];
  accessType: 'campus' | 'remote' | 'subscription';
  url: string;
  lastUpdated: Date;
  usage: number;
  rating: number;
}

interface LibraryEvent {
  id: string;
  title: string;
  type: 'workshop' | 'lecture' | 'study-group' | 'tour' | 'tech-help';
  description: string;
  date: Date;
  duration: number;
  location: string;
  instructor: string;
  capacity: number;
  registered: number;
  isRegistered: boolean;
  level: 'beginner' | 'intermediate' | 'advanced';
  requirements?: string[];
}

interface StudySpace {
  id: string;
  name: string;
  type: 'individual' | 'group' | 'computer' | 'quiet' | 'collaborative';
  capacity: number;
  features: string[];
  availability: 'available' | 'occupied' | 'reserved';
  floor: number;
  section: string;
  equipment: string[];
  timeSlots: TimeSlot[];
}

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  userId?: string;
}

interface Citation {
  id: string;
  title: string;
  format: 'APA' | 'MLA' | 'Chicago' | 'IEEE';
  citation: string;
  source: 'book' | 'journal' | 'website' | 'database';
}

interface CitationHelper {
  show: boolean;
  text: string;
  format: 'APA' | 'MLA' | 'Chicago';
}

interface AIRecommendation {
  id: string;
  type: 'book' | 'resource' | 'space' | 'timing';
  title: string;
  description: string;
  confidence: number;
  reason: string;
  actionText: string;
  actionUrl?: string;
}

type ActiveTab = 'search' | 'digital' | 'spaces' | 'events' | 'mycollection';

// --- Constants ---
const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    isbn: '9780134610993',
    description: 'Comprehensive introduction to AI theory and practice, covering machine learning, neural networks, and intelligent agents.',
    category: 'textbook',
    availability: 'available',
    location: 'Science Library - Floor 3',
    callNumber: 'Q335.R87 2020',
    reservations: 2,
    format: 'both',
    aiRecommended: true,
    relevanceScore: 95,
    relatedResources: ['AI Programming Handbook', 'Machine Learning Fundamentals']
  },
  {
    id: '2',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    isbn: '9780465050659',
    description: 'Classic text on user-centered design principles and human-computer interaction.',
    category: 'reference',
    availability: 'checked-out',
    location: 'Design Library - Floor 2',
    callNumber: 'TA168.N67 2013',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    reservations: 5,
    format: 'physical',
    aiRecommended: true,
    relevanceScore: 88
  },
  {
    id: '3',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    description: 'Best practices for writing readable, maintainable, and efficient code.',
    category: 'textbook',
    availability: 'available',
    location: 'Engineering Library - Floor 1',
    callNumber: 'QA76.76.D47 M36 2008',
    reservations: 1,
    format: 'both',
    relevanceScore: 92
  },
  {
    id: '4',
    title: 'Nature Biotechnology Journal - Current Issue',
    author: 'Various Authors',
    isbn: '',
    description: 'Latest research in biotechnology and molecular biology applications.',
    category: 'journal',
    availability: 'reference-only',
    location: 'Science Library - Periodicals',
    callNumber: 'QH442.N38',
    reservations: 0,
    format: 'digital',
    relevanceScore: 76
  },
  {
    id: '5',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    isbn: '9780262046305',
    description: 'Comprehensive coverage of algorithms and data structures with mathematical rigor.',
    category: 'textbook',
    availability: 'available',
    location: 'Math Library - Floor 2',
    callNumber: 'QA76.6.C662 2009',
    reservations: 3,
    format: 'both',
    aiRecommended: true,
    relevanceScore: 94
  }
];

const MOCK_DIGITAL_RESOURCES: DigitalResource[] = [
  {
    id: '1',
    title: 'IEEE Xplore Digital Library',
    type: 'database',
    description: 'Access to IEEE journals, conferences, and standards in engineering and technology.',
    provider: 'IEEE',
    subjects: ['Engineering', 'Computer Science', 'Technology'],
    accessType: 'campus',
    url: 'https://ieeexplore.ieee.org',
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    usage: 1247,
    rating: 4.8
  },
  {
    id: '2',
    title: 'PubMed Central',
    type: 'database',
    description: 'Free full-text archive of biomedical and life sciences journal literature.',
    provider: 'NIH',
    subjects: ['Medicine', 'Biology', 'Health Sciences'],
    accessType: 'remote',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/',
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    usage: 892,
    rating: 4.9
  },
  {
    id: '3',
    title: 'O\'Reilly Online Learning',
    type: 'ebook',
    description: 'Digital library of technology and programming books, videos, and interactive tutorials.',
    provider: 'O\'Reilly Media',
    subjects: ['Programming', 'Technology', 'Business'],
    accessType: 'subscription',
    url: 'https://learning.oreilly.com',
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    usage: 654,
    rating: 4.7
  },
  {
    id: '4',
    title: 'Coursera for Universities',
    type: 'video',
    description: 'Online courses and specializations from top universities and companies.',
    provider: 'Coursera',
    subjects: ['Various', 'Professional Development', 'Skills'],
    accessType: 'campus',
    url: 'https://coursera.org',
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    usage: 423,
    rating: 4.6
  }
];

const MOCK_LIBRARY_EVENTS: LibraryEvent[] = [
  {
    id: '1',
    title: 'Research Citation Workshop',
    type: 'workshop',
    description: 'Learn proper citation techniques for APA, MLA, and Chicago styles with hands-on practice.',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    duration: 90,
    location: 'Library Instruction Room 201',
    instructor: 'Dr. Sarah Chen',
    capacity: 25,
    registered: 18,
    isRegistered: false,
    level: 'beginner'
  },
  {
    id: '2',
    title: 'Advanced Database Search Techniques',
    type: 'workshop',
    description: 'Master Boolean operators, field searching, and database-specific features for efficient research.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    duration: 120,
    location: 'Computer Lab 115',
    instructor: 'Mark Thompson',
    capacity: 20,
    registered: 12,
    isRegistered: true,
    level: 'intermediate',
    requirements: ['Basic database familiarity']
  },
  {
    id: '3',
    title: 'Digital Humanities Tools',
    type: 'lecture',
    description: 'Introduction to computational methods for humanities research and text analysis.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    duration: 60,
    location: 'Main Auditorium',
    instructor: 'Prof. Lisa Rodriguez',
    capacity: 100,
    registered: 34,
    isRegistered: false,
    level: 'advanced'
  },
  {
    id: '4',
    title: 'Study Skills for Finals',
    type: 'study-group',
    description: 'Collaborative study techniques and time management strategies for exam preparation.',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    duration: 180,
    location: 'Group Study Room A',
    instructor: 'Peer Mentors',
    capacity: 15,
    registered: 8,
    isRegistered: false,
    level: 'beginner'
  }
];

const MOCK_STUDY_SPACES: StudySpace[] = [
  {
    id: '1',
    name: 'Quiet Study Zone A',
    type: 'quiet',
    capacity: 1,
    features: ['Silent zone', 'Individual desk', 'Good lighting', 'Power outlet'],
    availability: 'available',
    floor: 3,
    section: 'North Wing',
    equipment: ['Desk lamp', 'Ergonomic chair'],
    timeSlots: [
      { start: new Date(Date.now() + 60 * 60 * 1000), end: new Date(Date.now() + 3 * 60 * 60 * 1000), available: true },
      { start: new Date(Date.now() + 4 * 60 * 60 * 1000), end: new Date(Date.now() + 6 * 60 * 60 * 1000), available: false }
    ]
  },
  {
    id: '2',
    name: 'Collaborative Space 1',
    type: 'group',
    capacity: 6,
    features: ['Whiteboard', 'Round table', 'Moveable chairs', 'Natural light'],
    availability: 'occupied',
    floor: 2,
    section: 'Central Area',
    equipment: ['Whiteboard markers', 'Presentation screen', 'HDMI cable'],
    timeSlots: [
      { start: new Date(Date.now() + 2 * 60 * 60 * 1000), end: new Date(Date.now() + 4 * 60 * 60 * 1000), available: true },
      { start: new Date(Date.now() + 5 * 60 * 60 * 1000), end: new Date(Date.now() + 7 * 60 * 60 * 1000), available: true }
    ]
  },
  {
    id: '3',
    name: 'Computer Workstation 15',
    type: 'computer',
    capacity: 1,
    features: ['High-spec computer', 'Dual monitors', 'Software suite', 'Printing access'],
    availability: 'available',
    floor: 1,
    section: 'Tech Center',
    equipment: ['Windows PC', 'Adobe Creative Suite', 'MATLAB', 'Printer'],
    timeSlots: [
      { start: new Date(Date.now() + 30 * 60 * 1000), end: new Date(Date.now() + 2 * 60 * 60 * 1000), available: true },
      { start: new Date(Date.now() + 3 * 60 * 60 * 1000), end: new Date(Date.now() + 5 * 60 * 60 * 1000), available: true }
    ]
  }
];

export default function LibraryPage() {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<ActiveTab>('search');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [digitalResources, setDigitalResources] = useState<DigitalResource[]>([]);
  const [libraryEvents, setLibraryEvents] = useState<LibraryEvent[]>([]);
  const [studySpaces, setStudySpaces] = useState<StudySpace[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [citationHelper, setCitationHelper] = useState<CitationHelper>({ show: false, text: '', format: 'APA' });

  // Initialize component
  useEffect(() => {
    setTimeout(() => {
      setBooks(MOCK_BOOKS);
      setDigitalResources(MOCK_DIGITAL_RESOURCES);
      setLibraryEvents(MOCK_LIBRARY_EVENTS);
      setStudySpaces(MOCK_STUDY_SPACES);
      
      // Generate AI recommendations
      const recommendations: AIRecommendation[] = [
        {
          id: '1',
          type: 'book',
          title: 'Perfect Timing for Library Visit',
          description: 'Based on your study patterns, visiting the library between 2-4 PM today will give you the quietest environment.',
          confidence: 87,
          reason: 'Historical occupancy data and your preference analysis',
          actionText: 'View Best Times'
        },
        {
          id: '2',
          type: 'resource',
          title: 'AI Resources Match Your Research',
          description: 'Found 12 new AI and machine learning resources that align with your recent searches and course materials.',
          confidence: 92,
          reason: 'Recent search history and academic interests',
          actionText: 'Explore Resources'
        },
        {
          id: '3',
          type: 'space',
          title: 'Recommended Study Space',
          description: 'Quiet Study Zone A on Floor 3 matches your preferences for individual, silent study with natural lighting.',
          confidence: 89,
          reason: 'Previous booking history and study preferences',
          actionText: 'Book Space Now'
        }
      ];
      
      setAiRecommendations(recommendations);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter books based on search and filters
  const filteredBooks = books.filter(book => {
    const matchesSearch = searchQuery === '' || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilters = selectedFilters.length === 0 || 
      selectedFilters.includes(book.category) ||
      selectedFilters.includes(book.availability) ||
      selectedFilters.includes(book.format);
    
    return matchesSearch && matchesFilters;
  });

  // Filter digital resources
  const filteredDigitalResources = digitalResources.filter(resource => {
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilters = selectedFilters.length === 0 || 
      selectedFilters.includes(resource.type) ||
      selectedFilters.includes(resource.accessType);
    
    return matchesSearch && matchesFilters;
  });

  // Get availability color
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'checked-out':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'reserved':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'reference-only':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'occupied':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'textbook':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'reference':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'research':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'journal':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'digital':
        return 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30';
      case 'database':
        return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30';
      case 'ebook':
        return 'text-pink-600 bg-pink-100 dark:bg-pink-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
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

  // Handle book action
  const handleBookAction = useCallback((bookId: string, action: 'reserve' | 'hold' | 'renew') => {
    setBooks(prev =>
      prev.map(book =>
        book.id === bookId
          ? {
              ...book,
              reservations: action === 'reserve' ? book.reservations + 1 : book.reservations
            }
          : book
      )
    );
  }, []);

  // Handle event registration
  const handleEventRegistration = useCallback((eventId: string) => {
    setLibraryEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? {
              ...event,
              isRegistered: !event.isRegistered,
              registered: event.isRegistered ? event.registered - 1 : event.registered + 1
            }
          : event
      )
    );
  }, []);

  // Generate citation
  const generateCitation = (book: Book, format: 'APA' | 'MLA' | 'Chicago') => {
    let citation = '';
    switch (format) {
      case 'APA':
        citation = `${book.author.split(',')[0]}, ${book.author.split(',')[1]?.trim().split(' ')[0] || ''} (2020). ${book.title}. Publisher.`;
        break;
      case 'MLA':
        citation = `${book.author}. "${book.title}." Publisher, 2020.`;
        break;
      case 'Chicago':
        citation = `${book.author}. ${book.title}. Publisher, 2020.`;
        break;
    }
    setCitationHelper({ show: true, text: citation, format });
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading library resources...</p>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Library Resource Finder
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Intelligent library navigation and resource discovery with AI-powered search
                </p>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 md:mt-0 flex space-x-3">
                <Link
                  href="/study-spaces"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Study Spaces
                </Link>
                
                <button
                  onClick={() => setCitationHelper({ ...citationHelper, show: true })}
                  className={`px-4 py-2 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Citation Helper
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
                AI Library Recommendations
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
                { id: 'search', label: 'Book Search', icon: '📚', count: books.length },
                { id: 'digital', label: 'Digital Resources', icon: '💻', count: digitalResources.length },
                { id: 'spaces', label: 'Study Spaces', icon: '🪑', count: studySpaces.length },
                { id: 'events', label: 'Events & Workshops', icon: '🎓', count: libraryEvents.length },
                { id: 'mycollection', label: 'My Collection', icon: '📖', count: null }
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
          {(activeTab === 'search' || activeTab === 'digital') && (
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
                      placeholder={`Search ${activeTab === 'search' ? 'books and resources' : 'digital databases'}...`}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Filter Tags */}
                <div className="flex flex-wrap gap-2">
                  {(activeTab === 'search' 
                    ? ['textbook', 'reference', 'research', 'journal', 'available', 'checked-out', 'physical', 'digital']
                    : ['database', 'ebook', 'journal', 'video', 'campus', 'remote', 'subscription']
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
                      {filter.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'search' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book, index) => (
                <div 
                  key={book.id}
                  className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {book.aiRecommended && (
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 text-sm font-medium">
                      ⭐ AI Recommended - {book.relevanceScore}% match
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Book Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 line-clamp-2`}>
                          {book.title}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          by {book.author}
                        </p>
                        {book.isbn && (
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            ISBN: {book.isbn}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getCategoryColor(book.category)}`}>
                          {book.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getAvailabilityColor(book.availability)}`}>
                          {book.availability.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Book Description */}
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 line-clamp-3`}>
                      {book.description}
                    </p>

                    {/* Book Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {book.location}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {book.callNumber}
                        </span>
                      </div>

                      {book.dueDate && (
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6m6-6H4" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Due: {book.dueDate.toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {book.reservations > 0 && (
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {book.reservations} reservations
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {book.availability === 'available' ? (
                        <button
                          onClick={() => handleBookAction(book.id, 'reserve')}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                        >
                          Reserve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBookAction(book.id, 'hold')}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-medium hover:from-orange-700 hover:to-orange-800 transition-all duration-200"
                        >
                          Place Hold
                        </button>
                      )}
                      
                      <button
                        onClick={() => generateCitation(book, 'APA')}
                        className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>

                      <Link
                        href={`/navigation?destination=${encodeURIComponent(book.location)}`}
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

          {activeTab === 'digital' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDigitalResources.map((resource, index) => (
                <div 
                  key={resource.id}
                  className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Resource Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                        {resource.title}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        by {resource.provider}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getCategoryColor(resource.type)}`}>
                      {resource.type}
                    </span>
                  </div>

                  {/* Resource Description */}
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                    {resource.description}
                  </p>

                  {/* Resource Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {resource.subjects.join(', ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} capitalize`}>
                        {resource.accessType} access
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {resource.usage} monthly uses
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {resource.rating}/5.0 rating
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-center"
                    >
                      Access Resource
                    </a>
                    
                    <button
                      className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'spaces' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studySpaces.map((space, index) => (
                <div 
                  key={space.id}
                  className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Space Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                        {space.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Floor {space.floor} • {space.section}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getAvailabilityColor(space.availability)}`}>
                      {space.availability}
                    </span>
                  </div>

                  {/* Space Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} capitalize`}>
                        {space.type} • Capacity: {space.capacity}
                      </span>
                    </div>
                    
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p className="mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {space.features.slice(0, 3).map((feature, idx) => (
                          <span key={idx} className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {space.equipment.length > 0 && (
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <p className="mb-2">Equipment:</p>
                        <div className="flex flex-wrap gap-1">
                          {space.equipment.slice(0, 2).map((item, idx) => (
                            <span key={idx} className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Time Slots */}
                  <div className="mb-4">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Available Times Today:
                    </p>
                    <div className="space-y-1">
                      {space.timeSlots.filter(slot => slot.available).slice(0, 2).map((slot, idx) => (
                        <div key={idx} className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>
                          {slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {slot.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      href="/study-spaces"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-center"
                    >
                      Book Space
                    </Link>
                    
                    <Link
                      href={`/navigation?destination=Library Floor ${space.floor}`}
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
              ))}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {libraryEvents.map((event, index) => (
                <div 
                  key={event.id}
                  className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Event Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                        {event.title}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        by {event.instructor}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getCategoryColor(event.type)}`}>
                      {event.type}
                    </span>
                  </div>

                  {/* Event Description */}
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {event.duration} minutes
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
                        {event.registered}/{event.capacity} registered
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} capitalize`}>
                        {event.level} level
                      </span>
                    </div>
                  </div>

                  {/* Requirements */}
                  {event.requirements && event.requirements.length > 0 && (
                    <div className="mb-4">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Requirements:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {event.requirements.map((req, idx) => (
                          <span key={idx} className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

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
              ))}
            </div>
          )}

          {activeTab === 'mycollection' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Checked Out Books */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Checked Out (2)
                </h3>
                <div className="space-y-3">
                  {books.filter(book => book.availability === 'checked-out').slice(0, 2).map((book) => (
                    <div key={book.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-sm mb-1`}>
                        {book.title}
                      </h4>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        Due: {book.dueDate?.toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleBookAction(book.id, 'renew')}
                        className="text-xs px-3 py-1 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-200"
                      >
                        Renew
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reservations */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reservations (1)
                </h3>
                <div className="space-y-3">
                  {books.filter(book => book.availability === 'reserved').slice(0, 1).map((book) => (
                    <div key={book.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-sm mb-1`}>
                        {book.title}
                      </h4>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        Position: 1 in queue
                      </p>
                      <span className="text-xs px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-full">
                        Ready Soon
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved Citations */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Saved Citations (3)
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-sm mb-1`}>
                      AI: A Modern Approach
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      APA Format - Ready to copy
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-sm mb-1`}>
                      Design of Everyday Things
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      MLA Format - Ready to copy
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-sm mb-1`}>
                      Clean Code Handbook
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Chicago Format - Ready to copy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Citation Helper Modal */}
        {citationHelper.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Citation Helper
                </h2>
                <button 
                  onClick={() => setCitationHelper({ ...citationHelper, show: false })}
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
                    Citation Format
                  </label>
                  <select 
                    value={citationHelper.format}
                    onChange={(e) => setCitationHelper({ ...citationHelper, format: e.target.value as 'APA' | 'MLA' | 'Chicago' })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="APA">APA Style</option>
                    <option value="MLA">MLA Style</option>
                    <option value="Chicago">Chicago Style</option>
                  </select>
                </div>
                
                {citationHelper.text && (
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Generated Citation
                    </label>
                    <div className={`p-3 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                      <p className="text-sm">{citationHelper.text}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(citationHelper.text);
                      setCitationHelper({ ...citationHelper, show: false });
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                  >
                    Copy Citation
                  </button>
                  
                  <button
                    onClick={() => setCitationHelper({ ...citationHelper, show: false })}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}