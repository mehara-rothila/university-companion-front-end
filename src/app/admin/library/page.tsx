'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Check,
  X,
  User,
  Calendar,
  Tag,
  DollarSign,
  Trash2,
  Image as ImageIcon,
  FileText,
  Download,
  Pencil,
} from 'lucide-react';
import ImageEditModal from '@/components/ImageEditModal';

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
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  uploadDate: string;
  totalRequests: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function AdminLibraryPage() {
  const { isDarkMode } = useDarkMode();
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageEditModal, setShowImageEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [stats, setStats] = useState<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'ADMIN') {
      alert(t('admin.library.accessDenied'));
      router.push('/dashboard');
      return;
    }

    if (user?.id) {
      loadBooks();
      loadStats();
    }
  }, [user, router, filter]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/books/admin/stats`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadBooks = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/books/admin/all`;
      if (filter !== 'ALL') {
        url = `${API_URL}/api/books/admin/status/${filter}`;
      }
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Error loading books:', error);
      alert(t('admin.library.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedBook) return;

    try {
      setActionLoading(true);
      const response = await fetch(`${API_URL}/api/books/admin/${selectedBook.id}/approve`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setShowApproveModal(false);
        setSelectedBook(null);
        loadBooks();
        loadStats();
      } else {
        alert(t('admin.library.failedToApprove'));
      }
    } catch (error) {
      console.error('Error approving book:', error);
      alert(t('admin.library.failedToApprove'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBook) return;

    try {
      setActionLoading(true);
      const response = await fetch(`${API_URL}/api/books/admin/${selectedBook.id}/reject`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setShowRejectModal(false);
        setSelectedBook(null);
        loadBooks();
        loadStats();
      } else {
        alert(t('admin.library.failedToReject'));
      }
    } catch (error) {
      console.error('Error rejecting book:', error);
      alert(t('admin.library.failedToReject'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBook) return;

    try {
      setActionLoading(true);
      const response = await fetch(`${API_URL}/api/books/${selectedBook.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedBook(null);
        loadBooks();
        loadStats();
      } else {
        alert(t('admin.library.failedToDelete'));
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert(t('admin.library.failedToDelete'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleImageSave = async (imageUrl: string) => {
    if (!selectedBook) return;

    const response = await fetch(`${API_URL}/api/books/${selectedBook.id}/image`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ photoUrl: imageUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to update book image');
    }

    setShowImageEditModal(false);
    setSelectedBook(null);
    loadBooks();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case 'EXCELLENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'GOOD':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'FAIR':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'POOR':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PROGRAMMING':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'ENGINEERING':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'TEXTBOOK':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'REFERENCE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Navigation />
      <main
        className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}
      >
        <AnimatedBackground variant="dashboard" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          {/* Breadcrumbs */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/admin"
              className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 shadow-sm backdrop-blur-sm transition-all duration-200`}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Admin Panel
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div
              className={`flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl border bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50 shadow-md backdrop-blur-sm gap-4`}
            >
              <div>
                <h1
                  className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 flex items-center`}
                >
                  <BookOpen className="h-8 w-8 mr-3 text-indigo-500" />
                  Library Review
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Review and moderate book submissions
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div
                  className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} flex-wrap gap-1`}
                >
                  <button
                    onClick={() => setFilter('PENDING')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      filter === 'PENDING'
                        ? 'bg-yellow-600 text-white shadow-sm'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Pending {stats?.pending ? `(${stats.pending})` : ''}
                  </button>
                  <button
                    onClick={() => setFilter('APPROVED')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      filter === 'APPROVED'
                        ? 'bg-green-600 text-white shadow-sm'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Approved {stats?.approved ? `(${stats.approved})` : ''}
                  </button>
                  <button
                    onClick={() => setFilter('REJECTED')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      filter === 'REJECTED'
                        ? 'bg-red-600 text-white shadow-sm'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Rejected {stats?.rejected ? `(${stats.rejected})` : ''}
                  </button>
                  <button
                    onClick={() => setFilter('ALL')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      filter === 'ALL'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All Books
                  </button>
                </div>

                <div
                  className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-indigo-900/30 border border-indigo-700/30' : 'bg-indigo-100 border border-indigo-200'}`}
                >
                  <p
                    className={`text-sm font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}
                  >
                    {loading ? '...' : books.length} Books
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Books List */}
          <div
            className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-6`}
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading books...
                </p>
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen
                  className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500/50' : 'text-gray-400/50'}`}
                />
                <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {filter === 'PENDING'
                    ? 'No pending books'
                    : filter === 'APPROVED'
                      ? 'No approved books'
                      : filter === 'REJECTED'
                        ? 'No rejected books'
                        : 'No books found'}
                </p>
                <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  {filter === 'PENDING'
                    ? 'All submissions have been reviewed!'
                    : 'No books match this filter.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className={`p-5 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600 hover:border-gray-500' : 'bg-gray-50 border border-gray-200 hover:border-gray-300'} transition-all duration-200 flex flex-col hover:shadow-md`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            book.bookType === 'PHYSICAL'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          }`}
                        >
                          {book.bookType === 'PHYSICAL' ? '📚 Physical' : '📄 Digital'}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(book.status)}`}
                        >
                          {book.status}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(book.category)}`}
                        >
                          {book.category}
                        </span>
                      </div>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(book.uploadDate)}
                      </span>
                    </div>

                    <div className="flex gap-4 mb-4">
                      {/* Image or placeholder */}
                      <div
                        className={`w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden relative group ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
                      >
                        {book.photoUrl ? (
                          <img
                            src={`${API_URL}/api/upload/image/serve?url=${encodeURIComponent(book.photoUrl)}`}
                            alt={book.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove(
                                'hidden'
                              );
                            }}
                          />
                        ) : null}
                        {/* Show PDF icon overlay for digital books with cover images */}
                        {book.photoUrl && book.bookType === 'DIGITAL' && (
                          <div className="absolute bottom-1 right-1 bg-purple-600 rounded-md p-1">
                            <FileText className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div
                          className={`${book.photoUrl ? 'hidden' : ''} w-full h-full flex items-center justify-center`}
                        >
                          {book.bookType === 'DIGITAL' ? (
                            <FileText
                              className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}
                            />
                          ) : (
                            <ImageIcon
                              className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                            />
                          )}
                        </div>
                        {/* Edit Image Button - For both physical and digital books */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBook(book);
                            setShowImageEditModal(true);
                          }}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Edit Cover Image"
                        >
                          <Pencil className="w-5 h-5 text-white" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-1 truncate`}
                        >
                          {book.title}
                        </h3>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}
                        >
                          by {book.author}
                        </p>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2 mb-2`}
                        >
                          {book.description}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                          {book.bookType === 'PHYSICAL' && book.bookCondition && (
                            <span
                              className={`px-2 py-0.5 rounded-full ${getConditionColor(book.bookCondition)}`}
                            >
                              {book.bookCondition}
                            </span>
                          )}
                          {book.bookType === 'PHYSICAL' && book.lendingType && (
                            <span
                              className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              <Tag className="w-3 h-3 mr-1" /> {book.lendingType}
                            </span>
                          )}
                          {book.price && book.price > 0 && (
                            <span
                              className={`flex items-center ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}
                            >
                              <DollarSign className="w-3 h-3 mr-1" /> Rs {book.price}
                            </span>
                          )}
                          {book.bookType === 'DIGITAL' && book.fileSize && (
                            <span
                              className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              <FileText className="w-3 h-3 mr-1" /> {formatFileSize(book.fileSize)}
                            </span>
                          )}
                          {book.bookType === 'DIGITAL' && book.downloadCount !== undefined && (
                            <span
                              className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              <Download className="w-3 h-3 mr-1" /> {book.downloadCount} downloads
                            </span>
                          )}
                        </div>
                        {/* Posted by info */}
                        <div
                          className={`flex items-center mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          <User className="w-3 h-3 mr-1" />
                          <span>
                            Uploaded by: {book.ownerName} ({book.ownerEmail})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`mt-auto pt-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} flex gap-2`}
                    >
                      {/* Show Approve button only for PENDING items */}
                      {book.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setShowApproveModal(true);
                          }}
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                      )}
                      {/* Show Reject button only for PENDING items */}
                      {book.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setShowRejectModal(true);
                          }}
                          className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      )}
                      {/* Delete button always visible */}
                      <button
                        onClick={() => {
                          setSelectedBook(book);
                          setShowDeleteModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Approve Modal */}
        {showApproveModal && selectedBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4">
                  <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h2
                  className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  Approve Book
                </h2>
              </div>
              {/* Book preview */}
              <div
                className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
                >
                  {selectedBook.bookType === 'DIGITAL' ? (
                    <FileText
                      className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}
                    />
                  ) : (
                    <BookOpen
                      className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    {selectedBook.title}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    by {selectedBook.author} • {selectedBook.category}
                  </p>
                </div>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                This book will become visible to all users in the Library.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium"
                >
                  {actionLoading ? 'Approving...' : 'Confirm Approve'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-4">
                  <X className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h2
                  className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  Reject Book
                </h2>
              </div>
              {/* Book preview */}
              <div
                className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
                >
                  {selectedBook.bookType === 'DIGITAL' ? (
                    <FileText
                      className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}
                    />
                  ) : (
                    <BookOpen
                      className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    {selectedBook.title}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    by {selectedBook.author} • {selectedBook.category}
                  </p>
                </div>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                This book will be hidden and not visible to users.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-4">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h2
                  className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  Delete Book Permanently
                </h2>
              </div>
              {/* Book preview */}
              <div
                className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
                >
                  {selectedBook.bookType === 'DIGITAL' ? (
                    <FileText
                      className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}
                    />
                  ) : (
                    <BookOpen
                      className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    {selectedBook.title}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    by {selectedBook.author} • {selectedBook.category}
                  </p>
                </div>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                Are you sure you want to permanently delete this book?
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-6`}>
                ⚠️ This action cannot be undone. The book will be permanently removed from the
                database.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  {actionLoading ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Edit Modal */}
        <ImageEditModal
          isOpen={showImageEditModal}
          onClose={() => {
            setShowImageEditModal(false);
            setSelectedBook(null);
          }}
          title="Upload a new image for this book"
          currentImage={selectedBook?.photoUrl}
          onSave={handleImageSave}
          entityType="book"
        />
      </main>
    </>
  );
}
