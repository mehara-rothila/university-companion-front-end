// src/app/library/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import ImageUpload from '@/components/ImageUpload';
import PdfUpload from '@/components/PdfUpload';

// --- Interfaces ---
interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  description: string;
  bookType: 'PHYSICAL' | 'DIGITAL';
  bookCondition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  category: 'TEXTBOOK' | 'REFERENCE' | 'PROGRAMMING' | 'ENGINEERING' | 'OTHER';
  lendingType?: 'FREE' | 'SELL' | 'TRADE';
  price?: number;
  photoUrl?: string;
  pdfUrl?: string;
  fileSize?: number;
  downloadCount?: number;
  preferredPickupLocation?: string;
  availableForLending: boolean;
  currentlyLentTo?: string;
  expectedReturnDate?: string;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  ownerRating?: number;
  uploadDate: string;
  totalRequests: number;
}

interface BookRequest {
  id: number;
  bookId: number;
  requesterId: number;
  requesterName: string;
  requesterEmail: string;
  requesterContact?: string;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'COMPLETED' | 'RETURNED';
  pickupLocation?: string;
  agreedPrice?: number;
  requestDate: string;
  returnDate?: string;
  requestType: 'BORROW' | 'DOWNLOAD' | 'PURCHASE';
}

type ActiveTab = 'browse' | 'mybooks' | 'requests' | 'upload' | 'history';
type BookTypeFilter = 'ALL' | 'PHYSICAL' | 'DIGITAL';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Placeholder texts
const DIGITAL_BOOK_PLACEHOLDER = 'Describe the content, what topics it covers, why it is useful...';
const PHYSICAL_BOOK_PLACEHOLDER = 'Describe the book condition, course usage, any notes, etc.';

export default function LibraryPage() {
  const { isDarkMode } = useDarkMode();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('browse');
  const [bookTypeFilter, setBookTypeFilter] = useState<BookTypeFilter>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [showRequestModal, setShowRequestModal] = useState<{show: boolean, book?: Book}>({ show: false });

  // New book upload form state
  const [newBook, setNewBook] = useState<{
    bookType: 'PHYSICAL' | 'DIGITAL';
    title: string;
    author: string;
    isbn: string;
    description: string;
    bookCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    category: 'TEXTBOOK' | 'REFERENCE' | 'PROGRAMMING' | 'ENGINEERING' | 'OTHER';
    lendingType: 'FREE' | 'SELL' | 'TRADE';
    price: number;
    phoneNumber: string;
    photoUrl: string;
    pdfUrl: string;
    fileSize: number;
  }>({
    bookType: 'PHYSICAL',
    title: '',
    author: '',
    isbn: '',
    description: '',
    bookCondition: 'GOOD',
    category: 'PROGRAMMING',
    lendingType: 'FREE',
    price: 0,
    phoneNumber: '',
    photoUrl: '',
    pdfUrl: '',
    fileSize: 0
  });

  // Book request form state
  const [bookRequest, setBookRequest] = useState({
    message: '',
    pickupLocation: 'Library Main Entrance',
    contact: '',
    offerPrice: 0
  });

  // Fetch books
  const fetchBooks = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/api/books`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched books:', data);
        data.forEach((book: Book) => {
          if (book.photoUrl) {
            console.log(`Book "${book.title}" has photoUrl:`, book.photoUrl);
          }
        });
        setBooks(data);
        // Filter my books
        const myBooksData = data.filter((book: Book) => book.ownerId === user.id);
        setMyBooks(myBooksData);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  // Fetch user requests
  const fetchRequests = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/api/books/requests/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  // Initialize component
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchBooks(), fetchRequests()]);
      setIsLoading(false);
    };
    loadData();
  }, [user]);

  // Filter books
  const filteredBooks = books.filter(book => {
    // Exclude user's own books
    if (user && book.ownerId === user.id) return false;

    // Book type filter
    if (bookTypeFilter !== 'ALL' && book.bookType !== bookTypeFilter) return false;

    // Search filter
    const matchesSearch = searchQuery === '' ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Category/condition filters
    const matchesFilters = selectedFilters.length === 0 ||
      selectedFilters.includes(book.category) ||
      (book.bookCondition && selectedFilters.includes(book.bookCondition)) ||
      (book.lendingType && selectedFilters.includes(book.lendingType)) ||
      (selectedFilters.includes('available') && book.availableForLending) ||
      (selectedFilters.includes('unavailable') && !book.availableForLending);

    return matchesSearch && matchesFilters;
  });

  // Helper functions
  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case 'EXCELLENT': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'GOOD': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'FAIR': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'POOR': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getLendingTypeColor = (type?: string) => {
    switch (type) {
      case 'FREE': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'SELL': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'TRADE': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PROGRAMMING': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'ENGINEERING': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'TEXTBOOK': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'REFERENCE': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Handle book request
  const handleBookRequest = useCallback((book: Book) => {
    setShowRequestModal({ show: true, book });
    const requestType = book.bookType === 'DIGITAL' ? 'download' :
                       book.lendingType === 'SELL' ? 'purchase' : 'borrow';
    setBookRequest({
      message: `Hi! I'm interested in ${requestType === 'download' ? 'downloading' : 'your book'} "${book.title}". `,
      pickupLocation: book.preferredPickupLocation || 'Library Main Entrance',
      contact: user?.email || '',
      offerPrice: book.price || 0
    });
  }, [user]);

  // Submit book request
  const submitBookRequest = async () => {
    if (!showRequestModal.book || !user) return;

    const book = showRequestModal.book;
    const requestType = book.bookType === 'DIGITAL' ? 'DOWNLOAD' :
                       book.lendingType === 'SELL' ? 'PURCHASE' : 'BORROW';

    const requestData = {
      bookId: book.id,
      requesterId: user.id,
      requesterName: `${user.firstName} ${user.lastName}`,
      requesterEmail: user.email,
      requesterContact: bookRequest.contact,
      message: bookRequest.message,
      pickupLocation: bookRequest.pickupLocation,
      agreedPrice: bookRequest.offerPrice > 0 ? bookRequest.offerPrice : null,
      requestType: requestType
    };

    try {
      const response = await fetch(`${API_URL}/api/books/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        alert('Request sent successfully! The book owner will be notified.');
        setShowRequestModal({ show: false });
        fetchRequests();
      } else {
        alert('Failed to send request. Please try again.');
      }
    } catch (error) {
      alert('Failed to send request. Please try again.');
    }
  };

  // Handle download for digital books
  const handleDownload = async (book: Book) => {
    if (!book.pdfUrl) return;

    try {
      // Increment download count
      await fetch(`${API_URL}/api/books/${book.id}/download`, {
        method: 'POST'
      });

      // Open PDF in new tab
      window.open(book.pdfUrl, '_blank');
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  // Upload new book
  const handleBookUpload = async () => {
    if (!user) {
      alert('You must be logged in to upload books');
      return;
    }

    if (!newBook.title || !newBook.author || !newBook.description) {
      alert('Please fill in all required fields');
      return;
    }

    if (newBook.bookType === 'PHYSICAL' && !newBook.photoUrl) {
      alert('Please upload a photo for physical books');
      return;
    }

    if (newBook.bookType === 'DIGITAL' && !newBook.pdfUrl) {
      alert('Please upload a PDF for digital books');
      return;
    }

    const bookData = {
      ...newBook,
      ownerId: user.id,
      ownerName: `${user.firstName} ${user.lastName}`,
      ownerEmail: user.email,
      ownerPhone: newBook.phoneNumber || null,
      ownerRating: 4.5, // Default rating or fetch from backend
      preferredPickupLocation: newBook.bookType === 'PHYSICAL' ? 'Engineering Building Lobby' : null,
      availableForLending: true,
      totalRequests: 0,
      downloadCount: 0
    };

    try {
      const response = await fetch(`${API_URL}/api/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      });

      if (response.ok) {
        alert('Book uploaded successfully!');
        setNewBook({
          bookType: 'PHYSICAL',
          title: '',
          author: '',
          isbn: '',
          description: '',
          bookCondition: 'GOOD',
          category: 'PROGRAMMING',
          lendingType: 'FREE',
          price: 0,
          phoneNumber: '',
          photoUrl: '',
          pdfUrl: '',
          fileSize: 0
        });
        fetchBooks();
        setActiveTab('mybooks');
      } else {
        alert('Failed to upload book. Please try again.');
      }
    } catch (error) {
      alert('Failed to upload book. Please try again.');
    }
  };

  // Delete book
  const handleDeleteBook = async (bookId: number, bookTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/books/${bookId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Book deleted successfully!');
        fetchBooks(); // Refresh the books list
      } else {
        alert('Failed to delete book. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading library...</p>
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
            <div className={`flex flex-col md:flex-row md:items-center md:justify-between p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm shadow-lg`}>
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Student Library & Book Sharing
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Share physical books or upload PDFs - helping students access resources
                </p>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button
                  onClick={() => setActiveTab('upload')}
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
          {user && (
            <div className={`mb-8 ${isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} rounded-2xl p-6 border animate-fade-in`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {`${user.firstName[0]}${user.lastName[0]}`}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                      Welcome back, {user.firstName} {user.lastName}!
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {myBooks.length} books shared
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className={`mb-8 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in`}>
            <div className="flex overflow-x-auto">
              {[
                { id: 'browse', label: 'Browse Books', icon: '📚', count: filteredBooks.length },
                { id: 'mybooks', label: 'My Books', icon: '📖', count: myBooks.length },
                { id: 'requests', label: 'My Requests', icon: '📩', count: requests.filter(r => r.status === 'PENDING').length },
                { id: 'upload', label: 'Upload Book', icon: '📤', count: null }
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

          {/* Search, Filters, and Book Type Toggle for Browse Tab */}
          {activeTab === 'browse' && (
            <>
              {/* Book Type Toggle */}
              <div className="mb-6 flex justify-center">
                <div className={`inline-flex rounded-lg ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'} border p-1 shadow-lg`}>
                  {(['ALL', 'PHYSICAL', 'DIGITAL'] as BookTypeFilter[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setBookTypeFilter(type)}
                      className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                        bookTypeFilter === type
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
                          : isDarkMode
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {type === 'ALL' && '📚 All Books'}
                      {type === 'PHYSICAL' && '📖 Physical Books'}
                      {type === 'DIGITAL' && '💾 Digital (PDFs)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search and Filters */}
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
                        placeholder="Search by title, author, or description..."
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Filter Tags */}
                  <div className="flex flex-wrap gap-2">
                    {['PROGRAMMING', 'ENGINEERING', 'TEXTBOOK', 'EXCELLENT', 'GOOD', 'available'].map((filter) => (
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
                        {filter.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Browse Tab Content */}
          {activeTab === 'browse' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book, index) => (
                <div
                  key={book.id}
                  className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Book Image for Physical Books */}
                  {book.bookType === 'PHYSICAL' && book.photoUrl && (
                    <div className="h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <img
                        src={`${API_URL}/api/upload/image/serve?url=${encodeURIComponent(book.photoUrl)}`}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load image:', book.photoUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => console.log('Image loaded successfully:', book.photoUrl)}
                      />
                    </div>
                  )}

                  <div className="p-6">
                    {/* Book Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            book.bookType === 'DIGITAL'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {book.bookType === 'DIGITAL' ? '💾 Digital' : '📖 Physical'}
                          </span>
                        </div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 line-clamp-2`}>
                          {book.title}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          by {book.author}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getCategoryColor(book.category)}`}>
                          {book.category.toLowerCase()}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
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
                            {book.ownerName} ({book.ownerRating}⭐)
                          </span>
                        </div>
                      </div>

                      {/* Physical book specific info */}
                      {book.bookType === 'PHYSICAL' && (
                        <>
                          <div className="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {book.preferredPickupLocation}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getConditionColor(book.bookCondition)}`}>
                              {book.bookCondition?.toLowerCase()} condition
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getLendingTypeColor(book.lendingType)}`}>
                              {book.lendingType === 'FREE' ? 'Free to borrow' : book.lendingType === 'SELL' ? `Rs. ${book.price}` : 'Trade'}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Digital book specific info */}
                      {book.bookType === 'DIGITAL' && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatFileSize(book.fileSize)}
                            </span>
                          </div>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {book.downloadCount} downloads
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {book.bookType === 'DIGITAL' ? (
                        <button
                          onClick={() => handleDownload(book)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download PDF
                        </button>
                      ) : (
                        <>
                          {book.availableForLending ? (
                            <button
                              onClick={() => handleBookRequest(book)}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                            >
                              {book.lendingType === 'FREE' ? 'Request to Borrow' : book.lendingType === 'SELL' ? 'Make Offer' : 'Propose Trade'}
                            </button>
                          ) : (
                            <div className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed text-center">
                              Currently Lent Out
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredBooks.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No books found matching your criteria
                  </p>
                </div>
              )}
            </div>
          )}

          {/* My Books Tab */}
          {activeTab === 'mybooks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBooks.map((book, index) => (
                <div
                  key={book.id}
                  className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Book Image for Physical Books */}
                  {book.bookType === 'PHYSICAL' && book.photoUrl && (
                    <div className="h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <img
                        src={`${API_URL}/api/upload/image/serve?url=${encodeURIComponent(book.photoUrl)}`}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load image:', book.photoUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => console.log('Image loaded successfully:', book.photoUrl)}
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            book.bookType === 'DIGITAL'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {book.bookType === 'DIGITAL' ? '💾 Digital' : '📖 Physical'}
                          </span>
                        </div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                          {book.title}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          by {book.author}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {book.totalRequests} total requests
                        </span>
                      </div>

                      {book.bookType === 'DIGITAL' && (
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {book.downloadCount} downloads • {formatFileSize(book.fileSize)}
                          </span>
                        </div>
                      )}

                      {book.bookType === 'PHYSICAL' && !book.availableForLending && book.expectedReturnDate && (
                        <div className="flex items-center text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6m6-6H4" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Lent to {book.currentlyLentTo}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteBook(book.id, book.title)}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Book
                    </button>
                  </div>
                </div>
              ))}

              {myBooks.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    You haven't uploaded any books yet
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                  >
                    Upload Your First Book
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.map((request, index) => (
                <div
                  key={request.id}
                  className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-1`}>
                          Request #{request.id}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {request.requestType === 'DOWNLOAD' ? 'Download Request' : request.requestType === 'PURCHASE' ? 'Purchase Request' : 'Borrow Request'}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                        request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        request.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        request.status === 'DECLINED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {request.status.toLowerCase()}
                      </span>
                    </div>

                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} mb-4`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {request.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {requests.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No requests yet
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className={`max-w-2xl mx-auto ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-8 border backdrop-blur-sm animate-fade-in`}>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                Upload a Book
              </h2>

              <div className="space-y-6">
                {/* Book Type Selection */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Book Type *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {(['PHYSICAL', 'DIGITAL'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewBook({ ...newBook, bookType: type })}
                        className={`px-6 py-4 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
                          newBook.bookType === type
                            ? 'bg-purple-600 text-white'
                            : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{type === 'PHYSICAL' ? '📖' : '💾'}</span>
                        <span>{type === 'PHYSICAL' ? 'Physical Book' : 'Digital PDF'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
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

                {/* Author */}
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

                {/* Category and Condition */}
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
                      <option value="PROGRAMMING">Programming</option>
                      <option value="ENGINEERING">Engineering</option>
                      <option value="TEXTBOOK">Textbook</option>
                      <option value="REFERENCE">Reference</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {newBook.bookType === 'PHYSICAL' && (
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Condition *
                      </label>
                      <select
                        value={newBook.bookCondition}
                        onChange={(e) => setNewBook({ ...newBook, bookCondition: e.target.value as typeof newBook.bookCondition })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        <option value="EXCELLENT">Excellent</option>
                        <option value="GOOD">Good</option>
                        <option value="FAIR">Fair</option>
                        <option value="POOR">Poor</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Description *
                  </label>
                  <textarea
                    value={newBook.description}
                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder={newBook.bookType === 'DIGITAL' ? DIGITAL_BOOK_PLACEHOLDER : PHYSICAL_BOOK_PLACEHOLDER}
                  />
                </div>

                {/* Phone Number (Optional) */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={newBook.phoneNumber}
                    onChange={(e) => setNewBook({ ...newBook, phoneNumber: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="e.g., +94 77 123 4567"
                  />
                </div>

                {/* Physical Book Options */}
                {newBook.bookType === 'PHYSICAL' && (
                  <>
                    {/* Lending Type */}
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Lending Type *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['FREE', 'SELL', 'TRADE'] as const).map((type) => (
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
                            {type === 'FREE' ? 'Free Lending' : type === 'SELL' ? 'For Sale' : 'Trade Only'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price if selling */}
                    {newBook.lendingType === 'SELL' && (
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

                    {/* Photo Upload */}
                    <ImageUpload
                      onImageUpload={(url) => setNewBook({ ...newBook, photoUrl: url })}
                      currentImage={newBook.photoUrl}
                      onImageRemove={() => setNewBook({ ...newBook, photoUrl: '' })}
                    />
                  </>
                )}

                {/* Digital Book Options */}
                {newBook.bookType === 'DIGITAL' && (
                  <PdfUpload
                    onPdfUpload={(url, size) => setNewBook({ ...newBook, pdfUrl: url, fileSize: size })}
                    currentPdf={newBook.pdfUrl}
                    onPdfRemove={() => setNewBook({ ...newBook, pdfUrl: '', fileSize: 0 })}
                  />
                )}

                {/* Submit Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleBookUpload}
                    disabled={!newBook.title || !newBook.author || !newBook.description ||
                             (newBook.bookType === 'PHYSICAL' && !newBook.photoUrl) ||
                             (newBook.bookType === 'DIGITAL' && !newBook.pdfUrl)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload Book
                  </button>

                  <button
                    onClick={() => {
                      setNewBook({
                        bookType: 'PHYSICAL',
                        title: '',
                        author: '',
                        isbn: '',
                        description: '',
                        bookCondition: 'GOOD',
                        category: 'PROGRAMMING',
                        lendingType: 'FREE',
                        price: 0,
                        phoneNumber: '',
                        photoUrl: '',
                        pdfUrl: '',
                        fileSize: 0
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
                    by {showRequestModal.book.author} • Owner: {showRequestModal.book.ownerName}
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

                {showRequestModal.book.bookType === 'PHYSICAL' && (
                  <>
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

                    {showRequestModal.book.lendingType === 'SELL' && (
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
                  </>
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
