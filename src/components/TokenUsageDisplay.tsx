'use client';

import React, { useEffect, useState } from 'react';
import { Zap, AlertCircle } from 'lucide-react';
import { tokenCountingService } from '@/services/tokenCountingService';
import { useAuth } from '@/app/context/AuthContext';
import { useDarkMode } from '@/app/context/DarkModeContext';

interface TokenUsageDisplayProps {
  compact?: boolean;
  showDetails?: boolean;
  refreshTrigger?: number; // Incremented from parent to trigger refresh
}

let tokenUsageRefreshCallback: (() => void) | null = null;

export function triggerTokenRefresh() {
  if (tokenUsageRefreshCallback) {
    tokenUsageRefreshCallback();
  }
}

export default function TokenUsageDisplay({ compact = false, showDetails = true, refreshTrigger = 0 }: TokenUsageDisplayProps) {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [tokensUsed, setTokensUsed] = useState(0);
  const [tokensRemaining, setTokensRemaining] = useState(500000);
  const [dailyLimit, setDailyLimit] = useState(500000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // Initial fetch only - event-driven updates via triggerTokenRefresh()
    fetchTokenUsage();
  }, [user?.id]);

  // Set up the callback for external refresh triggers
  useEffect(() => {
    tokenUsageRefreshCallback = fetchTokenUsage;
    return () => {
      tokenUsageRefreshCallback = null;
    };
  }, []);

  // Refresh when parent triggers it
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchTokenUsage();
    }
  }, [refreshTrigger]);

  const fetchTokenUsage = async () => {
    if (!user?.id) return;

    try {
      setError(null);
      // Try backend first
      const usage = await tokenCountingService.getTokenUsageFromBackend(user.id);
      setTokensUsed(usage.used);
      setTokensRemaining(usage.remainingTokens);
      setDailyLimit(usage.limit);
      setLoading(false);
    } catch (err) {
      console.warn('Backend unavailable, using local storage:', err);
      // Fall back to local storage
      const localUsage = tokenCountingService.getTokenUsage();
      setTokensUsed(localUsage.used);
      setTokensRemaining(localUsage.remainingTokens);
      setDailyLimit(localUsage.limit);
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={`px-4 py-2 rounded-lg text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
        📝 Sign in to track token usage
      </div>
    );
  }

  const percentageUsed = (tokensUsed / dailyLimit) * 100;
  const isWarning = percentageUsed >= 75;
  const isExceeded = percentageUsed >= 100;

  if (compact) {
    // Enhanced compact display with better styling
    return (
      <div className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all ${
        isExceeded
          ? `${isDarkMode ? 'bg-gradient-to-r from-red-900/40 to-red-800/40 border border-red-700/50' : 'bg-gradient-to-r from-red-100 to-red-50 border border-red-300'}`
          : isWarning
          ? `${isDarkMode ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-700/50' : 'bg-gradient-to-r from-yellow-100 to-orange-50 border border-yellow-300'}`
          : `${isDarkMode ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-700/50' : 'bg-gradient-to-r from-blue-100 to-purple-50 border border-blue-300'}`
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${
              isExceeded ? 'bg-red-500/20' : isWarning ? 'bg-yellow-500/20' : 'bg-blue-500/20'
            }`}>
              <Zap className={`w-4 h-4 ${
                isExceeded ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-blue-500'
              }`} />
            </div>
            <div>
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {tokensRemaining.toLocaleString()}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                / {dailyLimit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Mini progress bar */}
          <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-300/30">
            <div
              className={`h-full transition-all duration-300 ${
                isExceeded
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : isWarning
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>

          {/* Percentage */}
          <p className={`text-xs font-bold w-10 text-right ${
            isExceeded ? 'text-red-600 dark:text-red-400' : isWarning ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'
          }`}>
            {percentageUsed.toFixed(0)}%
          </p>
        </div>
      </div>
    );
  }

  // Full display with progress bar
  return (
    <div className={`p-5 rounded-xl border backdrop-blur-sm transition-all ${
      isExceeded
        ? `${isDarkMode ? 'bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-700/50' : 'bg-gradient-to-br from-red-100 to-red-50 border-red-300'}`
        : isWarning
        ? `${isDarkMode ? 'bg-gradient-to-br from-yellow-900/30 to-orange-800/20 border-yellow-700/50' : 'bg-gradient-to-br from-yellow-100 to-orange-50 border-yellow-300'}`
        : `${isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-700/50' : 'bg-gradient-to-br from-blue-100/80 to-purple-100/80 border-blue-300'}`
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className={`w-5 h-5 ${
            isExceeded ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-blue-500'
          }`} />
          <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Daily Token Limit
          </span>
        </div>
        {isExceeded && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">Limit Reached</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className={`w-full h-4 rounded-full overflow-hidden shadow-inner ${
          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-300/50'
        }`}>
          <div
            className={`h-full transition-all duration-300 rounded-full shadow-lg ${
              isExceeded
                ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700'
                : isWarning
                ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600'
                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600'
            }`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Token Details */}
      {showDetails && (
        <div className="grid grid-cols-3 gap-3">
          {/* Used */}
          <div className={`p-3 rounded-lg backdrop-blur-sm ${
            isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white/50 border border-white/60'
          }`}>
            <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              📊 Used
            </p>
            <p className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {(tokensUsed / 1000).toFixed(0)}K
            </p>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {tokensUsed.toLocaleString()}
            </p>
          </div>

          {/* Remaining */}
          <div className={`p-3 rounded-lg backdrop-blur-sm ${
            isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white/50 border border-white/60'
          }`}>
            <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              ⚡ Remaining
            </p>
            <p className={`text-lg font-bold mt-1 ${
              isExceeded ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}>
              {(Math.max(0, tokensRemaining) / 1000).toFixed(0)}K
            </p>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {Math.max(0, tokensRemaining).toLocaleString()}
            </p>
          </div>

          {/* Usage % */}
          <div className={`p-3 rounded-lg backdrop-blur-sm ${
            isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white/50 border border-white/60'
          }`}>
            <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              📈 Usage
            </p>
            <p className={`text-lg font-bold mt-1 ${
              isExceeded ? 'text-red-600 dark:text-red-400' : isWarning ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'
            }`}>
              {percentageUsed.toFixed(1)}%
            </p>
            <div className="w-full h-1 rounded-full bg-gray-300/30 mt-2 overflow-hidden">
              <div
                className={`h-full ${
                  isExceeded
                    ? 'bg-red-500'
                    : isWarning
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Warning Messages */}
      {isExceeded && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700">
          <p className="text-xs text-red-700 dark:text-red-300">
            ❌ You've reached your daily token limit (500,000 tokens). Your limit will reset at midnight.
          </p>
        </div>
      )}
      {isWarning && !isExceeded && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            ⚠️ You're approaching your daily token limit. Use tokens wisely!
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-3 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
          <p className="text-xs text-gray-700 dark:text-gray-300">{error}</p>
        </div>
      )}
    </div>
  );
}
