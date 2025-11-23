'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import lostFoundService, { LostFoundItem } from '@/services/lostFoundService';
import { Search, Check, X, MapPin, Calendar, Tag, DollarSign, AlertCircle, Filter } from 'lucide-react';

export default function AdminLostFoundPage() {
    const { isDarkMode } = useDarkMode();
    const { user } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<LostFoundItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING');

    useEffect(() => {
        // Check if user is admin
        if (user && user.role !== 'ADMIN') {
            alert('Access denied. Admin privileges required.');
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
                const data = await lostFoundService.getPendingItems(user!.id);
                setItems(data);
            } else {
                // For ALL filter, use general endpoint
                const data = await lostFoundService.getItems({ status: filter });
                setItems(data);
            }
        } catch (error) {
            console.error('Error loading items:', error);
            alert('Failed to load items. Please check if you have admin access.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedItem || !user) return;

        try {
            setActionLoading(true);
            await lostFoundService.approveItem(selectedItem.id, user.id);
            setShowApproveModal(false);
            setSelectedItem(null);
            loadItems();
        } catch (error) {
            console.error('Error approving item:', error);
            alert('Failed to approve item. Please check your admin privileges.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedItem || !user) return;

        try {
            setActionLoading(true);
            await lostFoundService.rejectItem(selectedItem.id, user.id);
            setShowRejectModal(false);
            setSelectedItem(null);
            loadItems();
        } catch (error) {
            console.error('Error rejecting item:', error);
            alert('Failed to reject item. Please check your admin privileges.');
        } finally {
            setActionLoading(false);
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
        return null; // Or loading spinner handled by AuthGuard/Context usually
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
                                <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <button
                                        onClick={() => setFilter('PENDING')}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'PENDING'
                                                ? 'bg-purple-600 text-white shadow-sm'
                                                : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Pending
                                    </button>
                                    <button
                                        onClick={() => setFilter('ALL')} // Note: Backend needs to support 'ALL' or we fetch multiple
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'ALL'
                                                ? 'bg-purple-600 text-white shadow-sm'
                                                : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        disabled // Disabling ALL for now as backend default is ACTIVE and we want to focus on review
                                        title="Coming soon"
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
                                <Check className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-green-500/50' : 'text-green-400/50'}`} />
                                <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    No pending items
                                </p>
                                <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                                    All submissions have been reviewed!
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200 flex flex-col`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${item.type === 'LOST'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    }`}>
                                                    {item.type}
                                                </span>
                                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${item.priority === 'HIGH'
                                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {item.priority || 'NORMAL'}
                                                </span>
                                            </div>
                                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {formatDate(item.createdAt)}
                                            </span>
                                        </div>

                                        <div className="flex gap-4 mb-4">
                                            {item.imageUrl && (
                                                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(item.imageUrl)}`}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-1 truncate`}>
                                                    {item.title}
                                                </h3>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2 mb-2`}>
                                                    {item.description}
                                                </p>
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    <span className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        <Tag className="w-3 h-3 mr-1" /> {item.category}
                                                    </span>
                                                    <span className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        <MapPin className="w-3 h-3 mr-1" /> {item.location}
                                                    </span>
                                                    {item.reward && (
                                                        <span className={`flex items-center ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                                                            <DollarSign className="w-3 h-3 mr-1" /> Rs {item.reward}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`mt-auto pt-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} flex gap-3`}>
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setShowApproveModal(true);
                                                }}
                                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                                            >
                                                <Check className="w-4 h-4 mr-2" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setShowRejectModal(true);
                                                }}
                                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Reject
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
                            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                                Approve Item
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                                Are you sure you want to approve <strong>{selectedItem.title}</strong>? It will be visible to all users.
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
                            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                                Reject Item
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                                Are you sure you want to reject <strong>{selectedItem.title}</strong>? It will not be visible to users.
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
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium"
                                >
                                    {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </>
    );
}
