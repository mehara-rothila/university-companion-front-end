'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import lostFoundMessageService, {
  Conversation,
  UnreadCounts
} from '@/services/lostFoundMessageService';

interface LostFoundInboxProps {
  onSelectConversation: (conversation: Conversation) => void;
  onClose: () => void;
}

export default function LostFoundInbox({
  onSelectConversation,
  onClose
}: LostFoundInboxProps) {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Conversation[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({ unreadMessages: 0, pendingRequests: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [convs, pending, counts] = await Promise.all([
        lostFoundMessageService.getConversations('APPROVED'),
        lostFoundMessageService.getPendingRequests(),
        lostFoundMessageService.getUnreadCount()
      ]);
      setConversations(convs);
      setPendingRequests(pending);
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error loading inbox data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (conversationId: number) => {
    try {
      setActionLoading(conversationId);
      await lostFoundMessageService.approveConversation(conversationId);
      await loadData();
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (conversationId: number) => {
    if (!confirm(t('lostFoundPage.messages.confirmReject'))) return;

    try {
      setActionLoading(conversationId);
      await lostFoundMessageService.rejectConversation(conversationId);
      await loadData();
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('lostFoundPage.messages.justNow');
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const getOtherUser = (conv: Conversation) => {
    return conv.owner.id === user?.id ? conv.requester : conv.owner;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl w-full max-w-md h-[80vh] flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {t('lostFoundPage.messages.inbox')}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'messages'
                ? `${isDarkMode ? 'text-purple-400' : 'text-purple-600'} border-b-2 border-purple-500`
                : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
            }`}
          >
            {t('lostFoundPage.messages.conversations')}
            {unreadCounts.unreadMessages > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                {unreadCounts.unreadMessages}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'requests'
                ? `${isDarkMode ? 'text-purple-400' : 'text-purple-600'} border-b-2 border-purple-500`
                : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
            }`}
          >
            {t('lostFoundPage.messages.requests')}
            {unreadCounts.pendingRequests > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500 text-white rounded-full">
                {unreadCounts.pendingRequests}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : activeTab === 'messages' ? (
            // Active Conversations
            conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('lostFoundPage.messages.noConversations')}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  {t('lostFoundPage.messages.startByContacting')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {conversations.map((conv) => {
                  const otherUser = getOtherUser(conv);
                  return (
                    <button
                      key={conv.id}
                      onClick={() => onSelectConversation(conv)}
                      className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                        isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        {otherUser.profileImage ? (
                          <img
                            src={otherUser.profileImage}
                            alt={otherUser.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                            <span className="text-purple-600 font-semibold text-lg">
                              {(otherUser.fullName || otherUser.username).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {otherUser.fullName || otherUser.username}
                          </h3>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatTime(conv.updatedAt)}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {conv.item.title}
                        </p>
                        {conv.lastMessage && (
                          <p className={`text-sm truncate mt-1 ${
                            conv.unreadCount && conv.unreadCount > 0
                              ? isDarkMode ? 'text-gray-200 font-medium' : 'text-gray-800 font-medium'
                              : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>

                      {/* Unread badge */}
                      {conv.unreadCount && conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            // Pending Requests
            pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('lostFoundPage.messages.noPendingRequests')}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  {t('lostFoundPage.messages.allCaughtUp')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        {request.requester.profileImage ? (
                          <img
                            src={request.requester.profileImage}
                            alt={request.requester.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                            <span className="text-purple-600 font-semibold text-lg">
                              {(request.requester.fullName || request.requester.username).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {request.requester.fullName || request.requester.username}
                          </h3>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatTime(request.createdAt)}
                          </span>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                          {t('lostFoundPage.messages.wantsToContactAbout')} <span className="font-medium">{request.item.title}</span>
                        </p>
                        {request.initialMessage && (
                          <div className={`p-2 rounded-lg mb-3 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              "{request.initialMessage}"
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={actionLoading === request.id}
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded-lg font-medium transition-colors"
                          >
                            {actionLoading === request.id ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              </span>
                            ) : (
                              t('lostFoundPage.messages.approve')
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={actionLoading === request.id}
                            className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                              isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            } disabled:opacity-50`}
                          >
                            {t('lostFoundPage.messages.decline')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

