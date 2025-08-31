// src/app/library/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  preferredPickupLocation: string;
  rating: number;
  totalLends: number;
  totalBorrows: number;
}

interface StudentBook {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  photos: string[];
  owner: StudentProfile;
  availableForLending: boolean;
  currentlyLentTo?: string;
  expectedReturnDate?: Date;
  category: 'textbook' | 'reference' | 'programming' | 'engineering' | 'other';
  price?: number;
  lendingType: 'free' | 'sell' | 'trade';
  uploadDate: Date;
}

interface BookRequest {
  id: string;
  bookId: string;
  book: StudentBook;
  requesterName: string;
  requesterContact: string;
  requesterEmail: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'returned';
  message: string;
  pickupLocation?: string;
  returnDate?: Date;
  agreedPrice?: number;
}

interface MyUploadedBook extends StudentBook {
  totalRequests: number;
  activeRequests: BookRequest[];
}

type ActiveTab = 'browse' | 'mybooks' | 'requests' | 'upload' | 'history';

// --- Constants ---
const MOCK_STUDENT_PROFILE: StudentProfile = {
  id: 'student_001',
  name: 'Mehara Rothila',
  email: 'ranawakaramr.22@uom.lk',
  phone: '+94 78 710 2992',
  preferredPickupLocation: 'Engineering Building Lobby',
  rating: 4.8,
  totalLends: 15,
  totalBorrows: 12
};

const MOCK_STUDENTS: StudentProfile[] = [
  {
    id: 'student_002',
    name: 'Kavindi Perera',
    email: 'kavindi.p@uom.lk',
    phone: '+94 77 123 4567',
    preferredPickupLocation: 'Library Main Entrance',
    rating: 4.9,
    totalLends: 23,
    totalBorrows: 8
  },
  {
    id: 'student_003',
    name: 'Dilan Rajapaksa',
    email: 'dilan.r@uom.lk',
    preferredPickupLocation: 'Computer Science Building',
    rating: 4.6,
    totalLends: 8,
    totalBorrows: 18
  },
  {
    id: 'student_004',
    name: 'Nishani Fernando',
    email: 'nishani.fernando@uom.lk',
    phone: '+94 71 987 6543',
    preferredPickupLocation: 'Student Union',
    rating: 4.7,
    totalLends: 12,
    totalBorrows: 15
  },
  {
    id: 'student_005',
    name: 'Rusiru Silva',
    email: 'rusiru.silva@uom.lk',
    preferredPickupLocation: 'Engineering Building Lobby',
    rating: 4.5,
    totalLends: 6,
    totalBorrows: 22
  }
];

const MOCK_BOOKS: StudentBook[] = [
  {
    id: '1',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    description: 'Essential book for learning how to write clean, maintainable code. Great for CS students and software engineers. Includes practical examples and best practices.',
    condition: 'good',
    photos: ['/book1.jpg'],
    owner: MOCK_STUDENTS[0],
    availableForLending: true,
    category: 'programming',
    lendingType: 'free',
    uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Introduction to Algorithms (4th Edition)',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    isbn: '9780262046305',
    description: 'The definitive algorithms textbook. Used in CS 330. Some highlighting but all content is clear. Essential for understanding data structures and algorithms.',
    condition: 'fair',
    photos: ['/book2.jpg'],
    owner: MOCK_STUDENTS[1],
    availableForLending: true,
    category: 'textbook',
    lendingType: 'sell',
    price: 4500,
    uploadDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    title: 'JavaScript: The Definitive Guide (7th Edition)',
    author: 'David Flanagan',
    isbn: '9781491952023',
    description: 'Comprehensive guide to JavaScript. Perfect condition, barely used. Great for web development courses and personal projects.',
    condition: 'excellent',
    photos: ['/book3.jpg'],
    owner: MOCK_STUDENTS[2],
    availableForLending: true,
    category: 'programming',
    lendingType: 'free',
    uploadDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    title: 'Fundamentals of Electric Circuits (7th Edition)',
    author: 'Charles Alexander, Matthew Sadiku',
    isbn: '9781259989452',
    description: 'Required textbook for ECE 201. Good condition with some notes in margins. Includes solution manual access code (unused).',
    condition: 'good',
    photos: ['/book4.jpg'],
    owner: MOCK_STUDENTS[3],
    availableForLending: true,
    category: 'engineering',
    lendingType: 'sell',
    price: 8500,
    uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    title: 'Python Crash Course (3rd Edition)',
    author: 'Eric Matthes',
    isbn: '9781718502703',
    description: 'Perfect for beginners learning Python. Used in CS 101. Excellent condition, no writing. Great hands-on approach with projects.',
    condition: 'excellent',
    photos: ['/book5.jpg'],
    owner: MOCK_STUDENTS[4],
    availableForLending: true,
    category: 'programming',
    lendingType: 'free',
    uploadDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: '6',
    title: 'Digital Design and Computer Architecture (2nd Edition)',
    author: 'David Harris, Sarah Harris',
    isbn: '9780123944245',
    description: 'Essential for computer engineering students. Used in ECE 350. Good condition with minimal highlighting. Covers digital logic and computer architecture.',
    condition: 'good',
    photos: ['/book6.jpg'],
    owner: MOCK_STUDENTS[0],
    availableForLending: false,
    currentlyLentTo: 'student_007',
    expectedReturnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    category: 'engineering',
    lendingType: 'free',
    uploadDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
  },
  {
    id: '7',
    title: 'System Design Interview – An Insider\'s Guide',
    author: 'Alex Xu',
    isbn: '9781736049112',
    description: 'Great for software engineering interviews and understanding large-scale systems. Like new condition. Helped me land my internship!',
    condition: 'excellent',
    photos: ['/book7.jpg'],
    owner: MOCK_STUDENTS[1],
    availableForLending: true,
    category: 'programming',
    lendingType: 'trade',
    uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: '8',
    title: 'Engineering Mechanics: Dynamics (14th Edition)',
    author: 'Russell Hibbeler',
    isbn: '9780133915389',
    description: 'Required for MECH 204. Fair condition with some wear but all pages intact. Includes access code for online homework system.',
    condition: 'fair',
    photos: ['/book8.jpg'],
    owner: MOCK_STUDENTS[2],
    availableForLending: true,
    category: 'engineering',
    lendingType: 'sell',
    price: 6000,
    uploadDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
  },
  {
    id: '9',
    title: 'React: Up & Running (2nd Edition)',
    author: 'Stoyan Stefanov',
    isbn: '9781492051466',
    description: 'Perfect for learning React development. Used in Web Dev course. Good condition with some helpful bookmarks included.',
    condition: 'good',
    photos: ['/book9.jpg'],
    owner: MOCK_STUDENTS[3],
    availableForLending: true,
    category: 'programming',
    lendingType: 'free',
    uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    id: '10',
    title: 'Materials Science and Engineering: An Introduction (10th Edition)',
    author: 'William D. Callister Jr., David G. Rethwisch',
    isbn: '9781118324578',
    description: 'Core textbook for materials engineering. Good condition, some highlighting in early chapters. Very comprehensive coverage.',
    condition: 'good',
    photos: ['/book10.jpg'],
    owner: MOCK_STUDENTS[4],
    availableForLending: true,
    category: 'engineering',
    lendingType: 'sell',
    price: 7500,
    uploadDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
  }
];

const MOCK_REQUESTS: BookRequest[] = [
  {
    id: 'req_001',
    bookId: '2',
    book: MOCK_BOOKS[1],
    requesterName: 'Kasun Wickramasinghe',
    requesterContact: '+94 70 245 8901',
    requesterEmail: 'kasun.w@uom.lk',
    requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'pending',
    message: 'Hi! I need this book for my algorithms class next week. Would you accept Rs. 4000 for it?',
    pickupLocation: 'Library Main Entrance',
    agreedPrice: 4000
  },
  {
    id: 'req_002',
    bookId: '4',
    book: MOCK_BOOKS[3],
    requesterName: 'Dilini Jayawardena',
    requesterContact: 'dilini.j@uom.lk',
    requesterEmail: 'dilini.j@uom.lk',
    requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'approved',
    message: 'I\'m taking ECE 201 this semester and really need this textbook. Can we meet tomorrow?',
    pickupLocation: 'Engineering Building Lobby',
    returnDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    agreedPrice: 8500
  },
  {
    id: 'req_003',
    bookId: '1',
    book: MOCK_BOOKS[0],
    requesterName: 'Chathura Mendis',
    requesterContact: '+94 76 543 2109',
    requesterEmail: 'chathura.m@uom.lk',
    requestDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    status: 'completed',
    message: 'Would love to borrow this for my software engineering project. Thanks for sharing!',
    pickupLocation: 'Computer Science Building',
    returnDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
  }
];

const MY_UPLOADED_BOOKS: MyUploadedBook[] = [
  {
    ...MOCK_BOOKS[0],
    totalRequests: 3,
    activeRequests: [MOCK_REQUESTS[2]]
  },
  {
    ...MOCK_BOOKS[5],
    totalRequests: 1,
    activeRequests: []
  }
];

export default function StudentBookSharingPage() {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<ActiveTab>('browse');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [books, setBooks] = useState<StudentBook[]>([]);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [myBooks, setMyBooks] = useState<MyUploadedBook[]>([]);
  // State for upload modal visibility
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState<{show: boolean, book?: StudentBook}>({ show: false });

  // New book upload form state
  const [newBook, setNewBook] = useState<{
    title: string;
    author: string;
    isbn: string;
    description: string;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    category: 'textbook' | 'reference' | 'programming' | 'engineering' | 'other';
    lendingType: 'free' | 'sell' | 'trade';
    price: number;
  }>({
    title: '',
    author: '',
    isbn: '',
    description: '',
    condition: 'good',
    category: 'programming',
    lendingType: 'free',
    price: 0
  });

  // Book request form state
  const [bookRequest, setBookRequest] = useState({
    message: '',
    pickupLocation: 'Library Main Entrance',
    contact: '',
    offerPrice: 0
  });

  // Initialize component
  useEffect(() => {
    setTimeout(() => {
      setBooks(MOCK_BOOKS);
      setRequests(MOCK_REQUESTS);
      setMyBooks(MY_UPLOADED_BOOKS);
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
      selectedFilters.includes(book.condition) ||
      selectedFilters.includes(book.lendingType) ||
      (selectedFilters.includes('available') && book.availableForLending) ||
      (selectedFilters.includes('unavailable') && !book.availableForLending);
    
    return matchesSearch && matchesFilters;
  });

  // Get condition color
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'good':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'fair':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'poor':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Get lending type color
  const getLendingTypeColor = (type: string) => {
    switch (type) {
      case 'free':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'sell':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'trade':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'programming':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'engineering':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'textbook':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'reference':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Get availability color
  const getAvailabilityColor = (available: boolean) => {
    return available
      ? 'text-green-600 bg-green-100 dark:bg-green-900/30'
      : 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  // Toggle filter
  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Handle book request
  const handleBookRequest = useCallback((book: StudentBook) => {
    setShowRequestModal({ show: true, book });
    setBookRequest({
      message: `Hi! I'm interested in your book "${book.title}". `,
      pickupLocation: book.owner.preferredPickupLocation,
      contact: MOCK_STUDENT_PROFILE.email,
      offerPrice: book.price || 0
    });
  }, []);

  // Submit book request
  const submitBookRequest = () => {
    if (!showRequestModal.book) return;
    
    const newRequest: BookRequest = {
      id: `req_${Date.now()}`,
      bookId: showRequestModal.book.id,
      book: showRequestModal.book,
      requesterName: MOCK_STUDENT_PROFILE.name,
      requesterContact: bookRequest.contact,
      requesterEmail: MOCK_STUDENT_PROFILE.email,
      requestDate: new Date(),
      status: 'pending',
      message: bookRequest.message,
      pickupLocation: bookRequest.pickupLocation,
      agreedPrice: bookRequest.offerPrice > 0 ? bookRequest.offerPrice : undefined
    };

    setRequests(prev => [newRequest, ...prev]);
    setShowRequestModal({ show: false });
    alert('Request sent successfully! The book owner will be notified.');
  };

  // Handle request response
  const handleRequestResponse = (requestId: string, action: 'approve' | 'decline') => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: action === 'approve' ? 'approved' : 'declined' }
          : req
      )
    );
  };

  // Upload new book
  const handleBookUpload = () => {
    const uploadedBook: MyUploadedBook = {
      id: `book_${Date.now()}`,
      ...newBook,
      photos: ['/placeholder-book.jpg'],
      owner: MOCK_STUDENT_PROFILE,
      availableForLending: true,
      uploadDate: new Date(),
      totalRequests: 0,
      activeRequests: []
    };

    setMyBooks(prev => [uploadedBook, ...prev]);
    setBooks(prev => [uploadedBook, ...prev]);
    setShowUploadModal(false);
    setNewBook({
      title: '',
      author: '',
      isbn: '',
      description: '',
      condition: 'good',
      category: 'programming',
      lendingType: 'free',
      price: 0
    });
    alert('Book uploaded successfully!');
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading book sharing platform...</p>
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
                  Student Book Sharing
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Share, borrow, and trade coding & engineering books with fellow students
                </p>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Book
                </button>
                
                <Link
                  href="/profile"
                  className={`px-4 py-2 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
              </div>
            </div>
          </div>

          {/* User Profile Summary */}
          <div className={`mb-8 ${isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} rounded-2xl p-6 border animate-fade-in`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {MOCK_STUDENT_PROFILE.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                    Welcome back, {MOCK_STUDENT_PROFILE.name}!
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    Rating: {MOCK_STUDENT_PROFILE.rating}⭐ • {MOCK_STUDENT_PROFILE.totalLends} books shared • {MOCK_STUDENT_PROFILE.totalBorrows} books borrowed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  Preferred pickup: {MOCK_STUDENT_PROFILE.preferredPickupLocation}
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={`mb-8 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in`}>
            <div className="flex overflow-x-auto">
              {[
                { id: 'browse', label: 'Browse Books', icon: '📚', count: books.filter(b => b.availableForLending).length },
                { id: 'mybooks', label: 'My Books', icon: '📖', count: myBooks.length },
                { id: 'requests', label: 'My Requests', icon: '📩', count: requests.filter(r => r.status === 'pending').length },
                { id: 'upload', label: 'Upload Book', icon: '📤', count: null },
                { id: 'history', label: 'Activity', icon: '📋', count: null }
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
                  {tab.count !== null && (
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
          {activeTab === 'browse' && (
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
                      placeholder="Search books by title, author, or description..."
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Filter Tags */}
                <div className="flex flex-wrap gap-2">
                  {['programming', 'engineering', 'textbook', 'excellent', 'good', 'fair', 'free', 'sell', 'trade', 'available'].map((filter) => (
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
          {activeTab === 'browse' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.filter(book => book.owner && book.owner.id !== MOCK_STUDENT_PROFILE.id).map((book, index) => (
                <div 
                  key={book.id}
                  className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Book Header */}
                  <div className="p-6">
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
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getAvailabilityColor(book.availableForLending)}`}>
                          {book.availableForLending ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>

                    {/* Book Description */}
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 line-clamp-3`}>
                      {book.description}
                    </p>

                    {/* Book Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {book.owner.name} ({book.owner.rating}⭐)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {book.owner.preferredPickupLocation}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${getConditionColor(book.condition)}`}>
                            {book.condition} condition
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${getLendingTypeColor(book.lendingType)}`}>
                            {book.lendingType === 'free' ? 'Free to borrow' : book.lendingType === 'sell' ? `Rs. ${book.price}` : 'Trade'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6m6-6H4" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Posted {book.uploadDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {book.availableForLending ? (
                        <button
                          onClick={() => handleBookRequest(book)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                        >
                          {book.lendingType === 'free' ? 'Request to Borrow' : book.lendingType === 'sell' ? 'Make Offer' : 'Propose Trade'}
                        </button>
                      ) : (
                        <div className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed">
                          Currently Lent Out
                        </div>
                      )}
                      
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
                </div>
              ))}
            </div>
          )}

          {activeTab === 'mybooks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBooks.map((book, index) => (
                <div 
                  key={book.id}
                  className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6">
                    {/* Book Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                          {book.title}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          by {book.author}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getCategoryColor(book.category)}`}>
                          {book.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getAvailabilityColor(book.availableForLending)}`}>
                          {book.availableForLending ? 'Available' : 'Lent Out'}
                        </span>
                      </div>
                    </div>

                    {/* Book Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {book.totalRequests} total requests
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {book.activeRequests.length} pending requests
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${getConditionColor(book.condition)}`}>
                            {book.condition}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${getLendingTypeColor(book.lendingType)}`}>
                            {book.lendingType === 'free' ? 'Free' : book.lendingType === 'sell' ? `Rs. ${book.price}` : 'Trade'}
                          </span>
                        </div>
                      </div>

                      {!book.availableForLending && book.expectedReturnDate && (
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6m6-6H4" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Expected back: {book.expectedReturnDate.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
                        View Requests
                      </button>
                      
                      <button
                        className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.map((request, index) => (
                <div 
                  key={request.id}
                  className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6">
                    {/* Request Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-1`}>
                          {request.book.title}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                          Requested from: {request.book.owner.name}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {request.requestDate.toLocaleDateString()} at {request.requestDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        request.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        request.status === 'declined' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {request.status}
                      </span>
                    </div>

                    {/* Request Message */}
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} mb-4`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {request.message}
                      </p>
                    </div>

                    {/* Request Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Pickup: {request.pickupLocation}
                        </span>
                      </div>
                      
                      {request.agreedPrice && (
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Offered: Rs. {request.agreedPrice}
                          </span>
                        </div>
                      )}

                      {request.returnDate && (
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6m6-6H4" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Return by: {request.returnDate.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRequestResponse(request.id, 'approve')}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRequestResponse(request.id, 'decline')}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      
                      {request.status === 'approved' && (
                        <div className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-center">
                          Approved - Contact: {request.requesterContact}
                        </div>
                      )}

                      {request.status === 'declined' && (
                        <div className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg font-medium text-center">
                          Request Declined
                        </div>
                      )}

                      {request.status === 'completed' && (
                        <div className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-center">
                          Transaction Complete
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className={`max-w-2xl mx-auto ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-8 border backdrop-blur-sm animate-fade-in`}>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                Upload a Book to Share
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Book Title *
                  </label>
                  <input
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Enter book title"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Author *
                  </label>
                  <input
                    type="text"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Enter author name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Category *
                    </label>
                    <select 
                      value={newBook.category}
                      onChange={(e) => setNewBook({ ...newBook, category: e.target.value as typeof newBook.category })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="programming">Programming</option>
                      <option value="engineering">Engineering</option>
                      <option value="textbook">Textbook</option>
                      <option value="reference">Reference</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Condition *
                    </label>
                    <select 
                      value={newBook.condition}
                      onChange={(e) => setNewBook({ ...newBook, condition: e.target.value as typeof newBook.condition })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    ISBN (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Enter ISBN"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Description *
                  </label>
                  <textarea
                    value={newBook.description}
                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Describe the book condition, course usage, any notes, etc."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Lending Type *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['free', 'sell', 'trade'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewBook({ ...newBook, lendingType: type })}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 capitalize ${
                          newBook.lendingType === type
                            ? 'bg-purple-600 text-white'
                            : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type === 'free' ? 'Free Lending' : type === 'sell' ? 'For Sale' : 'Trade Only'}
                      </button>
                    ))}
                  </div>
                </div>

                {newBook.lendingType === 'sell' && (
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Price (Rs.)
                    </label>
                    <input
                      type="number"
                      value={newBook.price}
                      onChange={(e) => setNewBook({ ...newBook, price: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={handleBookUpload}
                    disabled={!newBook.title || !newBook.author || !newBook.description}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload Book
                  </button>
                  
                  <button
                    onClick={() => {
                      setNewBook({
                        title: '',
                        author: '',
                        isbn: '',
                        description: '',
                        condition: 'good',
                        category: 'programming',
                        lendingType: 'free',
                        price: 0
                      });
                    }}
                    className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Books Lent Out (2)
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-sm mb-1`}>
                      Clean Code
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                      To: Chathura Mendis • Due: {new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                    <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-sm mb-1`}>
                      Digital Design
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                      To: Student • Due: {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                    <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full">
                      Due Soon
                    </span>
                  </div>
                </div>
              </div>

              {/* Borrowed Books */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Books Borrowed (1)
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-sm mb-1`}>
                      Introduction to Algorithms
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                      From: Kavindi Perera • Due: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                    <span className="text-xs px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2m0-13h8a2 2 0 012 2v9a2 2 0 01-2 2H9m0-13v13" />
                  </svg>
                  Completed (5)
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-sm mb-1`}>
                      Python Crash Course
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                      Sold to: Dilan Rajapaksa • Rs. 2500
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Completed 2 weeks ago
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-sm mb-1`}>
                      React Guide
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                      Lent to: Emily Zhang • Returned
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Completed 1 month ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Book Request Modal */}
        {showRequestModal.show && showRequestModal.book && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Request Book
                </h2>
                <button 
                  onClick={() => setShowRequestModal({ show: false })}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                    {showRequestModal.book.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    by {showRequestModal.book.author} • Owner: {showRequestModal.book.owner.name}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Message to Owner
                  </label>
                  <textarea
                    value={bookRequest.message}
                    onChange={(e) => setBookRequest({ ...bookRequest, message: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Tell them why you need this book, how long you'll need it, etc."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Your Contact
                  </label>
                  <input
                    type="text"
                    value={bookRequest.contact}
                    onChange={(e) => setBookRequest({ ...bookRequest, contact: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Email or phone number"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Preferred Pickup Location
                  </label>
                  <select 
                    value={bookRequest.pickupLocation}
                    onChange={(e) => setBookRequest({ ...bookRequest, pickupLocation: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="Library Main Entrance">Library Main Entrance</option>
                    <option value="Student Union">Student Union</option>
                    <option value="Engineering Building Lobby">Engineering Building Lobby</option>
                    <option value="Computer Science Building">Computer Science Building</option>
                    <option value="Other">Other (specify in message)</option>
                  </select>
                </div>

                {showRequestModal.book.lendingType === 'sell' && (
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Your Offer (Rs.)
                    </label>
                    <input
                      type="number"
                      value={bookRequest.offerPrice}
                      onChange={(e) => setBookRequest({ ...bookRequest, offerPrice: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      placeholder={`Asking price: Rs. ${showRequestModal.book.price}`}
                      min="0"
                    />
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={submitBookRequest}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                  >
                    Send Request
                  </button>
                  
                  <button
                    onClick={() => setShowRequestModal({ show: false })}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
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