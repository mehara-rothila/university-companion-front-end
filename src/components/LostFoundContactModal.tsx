'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import lostFoundMessageService, {
  Conversation,
  Message,
  ConversationRequest,
  BlockStatus
} from '@/services/lostFoundMessageService';
import { LostFoundItem } from '@/services/lostFoundService';

interface LostFoundContactModalProps {
  item: LostFoundItem;
  existingConversation?: Conversation | null;
  onClose: () => void;
  onConversationCreated?: (conversation: Conversation) => void;
}

export default function LostFoundContactModal({
  item,
  existingConversation,
  onClose,
  onConversationCreated
}: LostFoundContactModalProps) {
  const { isDarkMode } = useDarkMode();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const [conversation, setConversation] = useState<Conversation | null>(existingConversation || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Typing indicator state
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Block/Report state
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [blockStatus, setBlockStatus] = useState<BlockStatus | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Get the other user in conversation
  const getOtherUser = useCallback(() => {
    if (!conversation || !user) return null;
    return conversation.owner.id === user.id ? conversation.requester : conversation.owner;
  }, [conversation, user]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages when conversation is approved
  const loadMessages = useCallback(async () => {
    if (!conversation || conversation.status !== 'APPROVED') return;

    try {
      const msgs = await lostFoundMessageService.getMessages(conversation.id);
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }, [conversation]);

  // Check block status
  const checkBlockStatus = useCallback(async () => {
    const otherUser = getOtherUser();
    if (!otherUser) return;

    try {
      const status = await lostFoundMessageService.checkBlockStatus(otherUser.id);
      setBlockStatus(status);
    } catch (err) {
      console.error('Error checking block status:', err);
    }
  }, [getOtherUser]);

  useEffect(() => {
    if (conversation?.status === 'APPROVED') {
      loadMessages();
      checkBlockStatus();
    }
  }, [conversation, loadMessages, checkBlockStatus]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!conversation || !isTyping) {
      setIsTyping(true);
      lostFoundMessageService.sendTypingIndicator(conversation!.id, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (conversation) {
        lostFoundMessageService.sendTypingIndicator(conversation.id, false);
      }
    }, 2000);
  }, [conversation, isTyping]);

  // Request a new conversation
  const handleRequestContact = async () => {
    if (!isAuthenticated || !user) {
      setError(t('lostFound.messages.loginRequired'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const request: ConversationRequest = {
        itemId: item.id,
        initialMessage: initialMessage.trim() || undefined
      };

      const newConversation = await lostFoundMessageService.requestConversation(request);
      setConversation(newConversation);
      onConversationCreated?.(newConversation);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || t('lostFound.messages.requestFailed');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation || sendingMessage) return;

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    lostFoundMessageService.sendTypingIndicator(conversation.id, false);

    try {
      setSendingMessage(true);
      const sentMessage = await lostFoundMessageService.sendMessage({
        conversationId: conversation.id,
        content: newMessage.trim()
      });

      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      inputRef.current?.focus();
    } catch (err: any) {
      setError(err.response?.data?.error || t('lostFound.messages.sendFailed'));
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle Enter key to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle message input change with typing indicator
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (conversation && e.target.value.trim()) {
      handleTyping();
    }
  };

  // Block user
  const handleBlockUser = async () => {
    const otherUser = getOtherUser();
    if (!otherUser) return;

    try {
      setActionLoading(true);
      await lostFoundMessageService.blockUser({
        userId: otherUser.id,
        reason: blockReason || undefined
      });
      setBlockStatus({ isBlocked: true, hasBlockedMe: false, anyBlock: true });
      setShowBlockModal(false);
      setBlockReason('');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to block user');
    } finally {
      setActionLoading(false);
    }
  };

  // Unblock user
  const handleUnblockUser = async () => {
    const otherUser = getOtherUser();
    if (!otherUser) return;

    try {
      setActionLoading(true);
      await lostFoundMessageService.unblockUser(otherUser.id);
      setBlockStatus({ isBlocked: false, hasBlockedMe: false, anyBlock: false });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to unblock user');
    } finally {
      setActionLoading(false);
    }
  };

  // Report user
  const handleReportUser = async () => {
    const otherUser = getOtherUser();
    if (!otherUser || !reportReason) return;

    try {
      setActionLoading(true);
      await lostFoundMessageService.reportUser({
        userId: otherUser.id,
        reason: reportReason,
        description: reportDescription || undefined,
        conversationId: conversation?.id
      });
      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');
      // Show success message
      setError(null);
      alert('Report submitted successfully. Our team will review it.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setActionLoading(false);
    }
  };

  // Format timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('lostFound.messages.today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('lostFound.messages.yesterday');
    }
    return date.toLocaleDateString();
  };

  // Get user avatar
  const getUserAvatar = (userInfo: { profileImage?: string; fullName?: string; username: string }) => {
    if (userInfo.profileImage) {
      return (
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(userInfo.profileImage)}`}
          alt={userInfo.fullName || userInfo.username}
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }

    const initials = (userInfo.fullName || userInfo.username)
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'
      }`}>
        {initials}
      </div>
    );
  };

  // Report reasons
  const reportReasons = [
    { value: 'HARASSMENT', label: 'Harassment' },
    { value: 'SPAM', label: 'Spam' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content' },
    { value: 'SCAM', label: 'Scam / Fraud' },
    { value: 'FAKE_ITEM', label: 'Fake Item Listing' },
    { value: 'OFFENSIVE_LANGUAGE', label: 'Offensive Language' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Render different states
  const renderContent = () => {
    // Not authenticated
    if (!isAuthenticated) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
            {t('lostFound.messages.loginRequired')}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('lostFound.messages.loginToContact')}
          </p>
        </div>
      );
    }

    // No conversation yet - show request form
    if (!conversation) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
              {t('lostFound.messages.contactAbout')} {item.title}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              {item.contactMethod === 'ANONYMOUS'
                ? t('lostFound.messages.anonymousNote')
                : t('lostFound.messages.directNote')
              }
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t('lostFound.messages.yourMessage')} ({t('lostFound.messages.optional')})
            </label>
            <textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              rows={4}
              placeholder={t('lostFound.messages.messagePlaceholder')}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            />
          </div>

          {error && (
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'} text-sm`}>
              {error}
            </div>
          )}

          <button
            onClick={handleRequestContact}
            disabled={loading}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200"
          >
            {loading ? t('lostFound.messages.sending') : t('lostFound.messages.sendRequest')}
          </button>
        </div>
      );
    }

    // Pending approval
    if (conversation.status === 'PENDING') {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
            {t('lostFound.messages.requestPending')}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('lostFound.messages.waitingForApproval')}
          </p>
          {conversation.initialMessage && (
            <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} text-left`}>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                {t('lostFound.messages.yourMessage')}:
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {conversation.initialMessage}
              </p>
            </div>
          )}
        </div>
      );
    }

    // Rejected
    if (conversation.status === 'REJECTED') {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
            {t('lostFound.messages.requestRejected')}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('lostFound.messages.ownerDeclined')}
          </p>
        </div>
      );
    }

    // Closed
    if (conversation.status === 'CLOSED') {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
            {t('lostFound.messages.conversationClosed')}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('lostFound.messages.closedDescription')}
          </p>
        </div>
      );
    }

    // Check if blocked
    if (blockStatus?.anyBlock) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
            {blockStatus.isBlocked ? 'User Blocked' : 'You have been blocked'}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            {blockStatus.isBlocked
              ? 'You have blocked this user. Unblock to continue chatting.'
              : 'This user has blocked you. You cannot send messages.'}
          </p>
          {blockStatus.isBlocked && (
            <button
              onClick={handleUnblockUser}
              disabled={actionLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200"
            >
              {actionLoading ? 'Unblocking...' : 'Unblock User'}
            </button>
          )}
        </div>
      );
    }

    // Approved - show chat interface
    const otherUser = getOtherUser();

    return (
      <div className="flex flex-col h-[60vh]">
        {/* Messages area */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'} rounded-lg`}>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('lostFound.messages.noMessages')}
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isOwnMessage = message.sender?.id === user?.id;
                const isSystemMessage = message.messageType === 'SYSTEM';
                const showDateSeparator = index === 0 ||
                  formatDate(messages[index - 1].sentAt) !== formatDate(message.sentAt);

                return (
                  <div key={message.id}>
                    {showDateSeparator && (
                      <div className="text-center my-4">
                        <span className={`text-xs px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                          {formatDate(message.sentAt)}
                        </span>
                      </div>
                    )}

                    {isSystemMessage ? (
                      <div className="text-center">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} italic`}>
                          {message.content}
                        </span>
                      </div>
                    ) : (
                      <div className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        {/* Avatar for other user's messages */}
                        {!isOwnMessage && (
                          <div className="flex-shrink-0">
                            {getUserAvatar(message.sender)}
                          </div>
                        )}

                        <div className={`max-w-[70%] ${
                          isOwnMessage
                            ? 'bg-purple-600 text-white rounded-l-lg rounded-tr-lg'
                            : isDarkMode
                              ? 'bg-gray-700 text-gray-100 rounded-r-lg rounded-tl-lg'
                              : 'bg-white text-gray-900 rounded-r-lg rounded-tl-lg shadow-sm'
                        } px-4 py-2`}>
                          {!isOwnMessage && (
                            <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                              {message.sender?.fullName || message.sender?.username}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-purple-200' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatTime(message.sentAt)}
                            {isOwnMessage && (
                              <span className="ml-2">
                                {message.isRead ? '✓✓' : '✓'}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Avatar for own messages */}
                        {isOwnMessage && (
                          <div className="flex-shrink-0">
                            {getUserAvatar(message.sender)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {otherUserTyping && otherUser && (
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0">
                    {getUserAvatar(otherUser)}
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'} animate-bounce`} style={{ animationDelay: '0ms' }} />
                      <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'} animate-bounce`} style={{ animationDelay: '150ms' }} />
                      <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'} animate-bounce`} style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className={`mt-4 flex items-end gap-2`}>
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            rows={1}
            placeholder={t('lostFound.messages.typeMessage')}
            className={`flex-1 px-4 py-2 rounded-lg border resize-none transition-all duration-200 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-all duration-200"
          >
            {sendingMessage ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {error && (
          <div className={`mt-2 p-2 rounded-lg ${isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'} text-sm`}>
            {error}
          </div>
        )}
      </div>
    );
  };

  const otherUser = getOtherUser();

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-lg w-full`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              {conversation?.status === 'APPROVED' && otherUser ? (
                <>
                  {/* Other user's avatar */}
                  <div className="relative">
                    {otherUser.profileImage ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(otherUser.profileImage)}`}
                        alt={otherUser.fullName || otherUser.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {(otherUser.fullName || otherUser.username).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    )}
                    {/* Online indicator - placeholder for future WebSocket implementation */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                  </div>
                  <div>
                    <h2 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {otherUser.fullName || otherUser.username}
                    </h2>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.title}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {item.imageUrl && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(item.imageUrl)}`}
                      alt={item.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h2 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {item.title}
                    </h2>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.type === 'LOST' ? t('lostFound.lost') : t('lostFound.found')} • {item.category}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Options menu for approved conversations */}
              {conversation?.status === 'APPROVED' && otherUser && (
                <div className="relative" ref={optionsMenuRef}>
                  <button
                    onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                    className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>

                  {showOptionsMenu && (
                    <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-50`}>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowOptionsMenu(false);
                            setShowBlockModal(true);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} flex items-center gap-2`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          Block User
                        </button>
                        <button
                          onClick={() => {
                            setShowOptionsMenu(false);
                            setShowReportModal(true);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} flex items-center gap-2`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Report User
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={onClose}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Block Modal */}
      {showBlockModal && otherUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-sm w-full p-6`}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                Block {otherUser.fullName || otherUser.username}?
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                They won't be able to send you messages or contact requests.
              </p>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Reason (optional)
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={2}
                placeholder="Why are you blocking this user?"
                className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason('');
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200"
              >
                {actionLoading ? 'Blocking...' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && otherUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-sm w-full p-6`}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                Report {otherUser.fullName || otherUser.username}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Help us understand what's happening.
              </p>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Reason *
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              >
                <option value="">Select a reason</option>
                {reportReasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Additional details (optional)
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={3}
                placeholder="Provide more context about the issue..."
                className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                  setReportDescription('');
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleReportUser}
                disabled={actionLoading || !reportReason}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200"
              >
                {actionLoading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
