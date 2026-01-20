'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import lostFoundService, { LostFoundItem } from '@/services/lostFoundService';
import { Search, Check, X, MapPin, Tag, DollarSign, Trash2, User, ImageIcon, Upload, Pencil } from 'lucide-react';
import { fileUploadService } from '@/services/fileUploadService';

export default function AdminLostFoundPage() {
    const { isDarkMode } = useDarkMode();
    const { user } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();
    const [items, setItems] = useState<LostFoundItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [filter, setFilter] = useState<'PENDING' | 'ACTIVE' | 'RESOLVED' | 'ALL'>('PENDING');

    useEffect(() => {
        // Check if user is admin
        if (user && user.role !== 'ADMIN') {
            alert(t('admin.lostFound.accessDenied'));
            router.push('/dashboard');
            return;
        }

        if (user?.id) {
            loadItems();
        }
    }, [user, router, filter]);

    const loadItems = async () => {
        try {
            setLoading(true);
            if (filter === 'PENDING') {
                // Use dedicated admin endpoint for pending items
                const data = await lostFoundService.getPendingItems();
                setItems(data);
            } else if (filter === 'ALL') {
                // Fetch all items (no status filter)
                const data = await lostFoundService.getItems({});
                setItems(data);
            } else {
                // For specific status filters (ACTIVE, RESOLVED)
                const data = await lostFoundService.getItems({ status: filter });
                setItems(data);
            }
        } catch (error) {
            console.error('Error loading items:', error);
            alert(t('admin.lostFound.failedToLoad'));
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedItem || !user) return;

        try {
            setActionLoading(true);
            await lostFoundService.approveItem(selectedItem.id);
            setShowApproveModal(false);
            setSelectedItem(null);
            loadItems();
        } catch (error) {
            console.error('Error approving item:', error);
            alert(t('admin.lostFound.failedToApprove'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedItem || !user) return;

        try {
            setActionLoading(true);
            await lostFoundService.rejectItem(selectedItem.id);
            setShowRejectModal(false);
            setSelectedItem(null);
            loadItems();
        } catch (error) {
            console.error('Error rejecting item:', error);
            alert(t('admin.lostFound.failedToReject'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedItem || !user) return;

        try {
            setActionLoading(true);
            await lostFoundService.deleteItem(selectedItem.id);
            setShowDeleteModal(false);
            setSelectedItem(null);
            loadItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert(t('admin.lostFound.failedToDelete'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedItem || !e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        try {
            setImageUploading(true);
            const result = await fileUploadService.uploadImage(file, 'lost-found');
            await lostFoundService.updateItemImage(selectedItem.id, result.fileUrl);
            setShowImageModal(false);
            setSelectedItem(null);
            loadItems();
        } catch (error) {
            console.error('Error uploading image:', error);
            alert(t('admin.lostFound.failedToUpload'));
        } finally {
            setImageUploading(false);
        }
    };

    const handleRemoveImage = async () => {
        if (!selectedItem) return;

        try {
            setImageUploading(true);
            await lostFoundService.updateItemImage(selectedItem.id, null);
            setShowImageModal(false);
            setSelectedItem(null);
            loadItems();
        } catch (error) {
            console.error('Error removing image:', error);
            alert(t('admin.lostFound.failedToRemove'));
        } finally {
            setImageUploading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!user) {
        return null;
    }

    return (
        <>
            <Navigation />
            <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>

                <AnimatedBackground variant="dashboard" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">

                    {/* Header */}
                    <div className="mb-8">
                        <div className={`flex flex-col md:flex-row md:items-center justify-between p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm shadow-lg gap-4`}>
                            <div>
                                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 flex items-center`}>
                                    <Search className="h-8 w-8 mr-3 text-purple-500" />
                                    Lost & Found Review
                                </h1>
                                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Review and moderate lost and found submissions
                                </p>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} flex-wrap gap-1`}>
                                    <button
                                        onClick={() => setFilter('PENDING')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${filter === 'PENDING'
                                                ? 'bg-yellow-600 text-white shadow-sm'
                                                : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Pending
                                    </button>
                                    <button
                                        onClick={() => setFilter('ACTIVE')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${filter === 'ACTIVE'
                                                ? 'bg-green-600 text-white shadow-sm'
                                                : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Active
                                    </button>
                                    <button
                                        onClick={() => setFilter('RESOLVED')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${filter === 'RESOLVED'
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Resolved
                                    </button>
                                    <button
                                        onClick={() => setFilter('ALL')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${filter === 'ALL'
                                                ? 'bg-purple-600 text-white shadow-sm'
                                                : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        All Items
                                    </button>
                                </div>

                                <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30 border border-purple-700/30' : 'bg-purple-100 border border-purple-200'}`}>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                                        {loading ? '...' : items.length} Items
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-6`}>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading items...</p>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-12">
                                <Search className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500/50' : 'text-gray-400/50'}`} />
                                <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {filter === 'PENDING' ? 'No pending items' : 
                                     filter === 'ACTIVE' ? 'No active items' :
                                     filter === 'RESOLVED' ? 'No resolved items' :
                                     'No items found'}
                                </p>
                                <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                                    {filter === 'PENDING' ? 'All submissions have been reviewed!' : 
                                     'No items match this filter.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`p-5 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600 hover:border-gray-500' : 'bg-gray-50 border border-gray-200 hover:border-gray-300'} transition-all duration-200 flex flex-col hover:shadow-md`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center space-x-2 flex-wrap gap-1">
                                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${item.type === 'LOST'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    }`}>
                                                    {item.type}
                                                </span>
                                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                                                    item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                    item.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                    item.status === 'RESOLVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                    item.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                    {item.status}
                                                </span>
                                                {item.priority === 'HIGH' && (
                                                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                                        HIGH
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {formatDate(item.createdAt)}
                                            </span>
                                        </div>

                                        <div className="flex gap-4 mb-4">
                                            {/* Image or placeholder */}
                                            <div className={`w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                                {item.imageUrl ? (
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(item.imageUrl)}`}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`${item.imageUrl ? 'hidden' : ''} w-full h-full flex items-center justify-center`}>
                                                    <ImageIcon className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-1 truncate`}>
                                                    {item.title}
                                                </h3>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2 mb-2`}>
                                                    {item.description}
                                                </p>
                                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                                    <span className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        <Tag className="w-3 h-3 mr-1" /> {item.category}
                                                    </span>
                                                    <span className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        <MapPin className="w-3 h-3 mr-1" /> {item.location}
                                                    </span>
                                                    {item.reward && item.reward > 0 && (
                                                        <span className={`flex items-center ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                                                            <DollarSign className="w-3 h-3 mr-1" /> Rs {item.reward}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Posted by info */}
                                                <div className={`flex items-center mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    <User className="w-3 h-3 mr-1" />
                                                    <span>Posted by: {item.postedBy || `User #${item.postedByUserId}`}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`mt-auto pt-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} flex gap-2 flex-wrap`}>
                                            {/* Edit Image button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setShowImageModal(true);
                                                }}
                                                className={`flex-1 px-3 py-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                                            >
                                                <Pencil className="w-4 h-4 mr-1" />
                                                Edit Image
                                            </button>
                                            {/* Show Approve button only for PENDING or REJECTED items */}
                                            {(item.status === 'PENDING' || item.status === 'REJECTED') && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedItem(item);
                                                        setShowApproveModal(true);
                                                    }}
                                                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Approve
                                                </button>
                                            )}
                                            {/* Show Reject button only for PENDING or ACTIVE items */}
                                            {(item.status === 'PENDING' || item.status === 'ACTIVE') && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedItem(item);
                                                        setShowRejectModal(true);
                                                    }}
                                                    className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Reject
                                                </button>
                                            )}
                                            {/* Delete button always visible for all items */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedItem(item);
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
                {showApproveModal && selectedItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4">
                                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                    Approve Item
                                </h2>
                            </div>
                            {/* Item preview */}
                            <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                                {selectedItem.imageUrl && (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(selectedItem.imageUrl)}`}
                                        alt={selectedItem.title}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedItem.title}</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedItem.category} • {selectedItem.location}</p>
                                </div>
                            </div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                                This item will become visible to all users on the Lost & Found page.
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
                {showRejectModal && selectedItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-4">
                                    <X className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                    Reject Item
                                </h2>
                            </div>
                            {/* Item preview */}
                            <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                                {selectedItem.imageUrl && (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(selectedItem.imageUrl)}`}
                                        alt={selectedItem.title}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedItem.title}</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedItem.category} • {selectedItem.location}</p>
                                </div>
                            </div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                                This item will be hidden and not visible to users.
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
                {showDeleteModal && selectedItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-4">
                                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                    Delete Item Permanently
                                </h2>
                            </div>
                            {/* Item preview */}
                            <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                                {selectedItem.imageUrl && (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(selectedItem.imageUrl)}`}
                                        alt={selectedItem.title}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedItem.title}</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedItem.category} • {selectedItem.location}</p>
                                </div>
                            </div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                                Are you sure you want to permanently delete this item?
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-6`}>
                                This action cannot be undone. The item will be permanently removed from the database.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className={`flex-1 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
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
                {showImageModal && selectedItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-4">
                                    <ImageIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                    Edit Item Image
                                </h2>
                            </div>

                            {/* Current Image Preview */}
                            <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                                <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Current Image:
                                </p>
                                <div className={`w-full h-40 rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                                    {selectedItem.imageUrl ? (
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(selectedItem.imageUrl)}`}
                                            alt={selectedItem.title}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <ImageIcon className={`w-12 h-12 mx-auto ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No image</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upload New Image */}
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Upload New Image:
                                </label>
                                <label className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'border-gray-600 hover:border-purple-500 bg-gray-700/30' : 'border-gray-300 hover:border-purple-500 bg-gray-50'}`}>
                                    <Upload className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {imageUploading ? 'Uploading...' : 'Click to upload image'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={imageUploading}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowImageModal(false)}
                                    disabled={imageUploading}
                                    className={`flex-1 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                                >
                                    Cancel
                                </button>
                                {selectedItem.imageUrl && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        disabled={imageUploading}
                                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                                    >
                                        {imageUploading ? 'Removing...' : 'Remove Image'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </>
    );
}
