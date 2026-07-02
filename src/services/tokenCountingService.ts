// Token Counting Service for Athena AI Assistant
// Implements accurate token counting and daily limits (1M tokens per student)

export interface TokenUsage {
  used: number;
  limit: number;
  resetTime: Date;
  sessionsToday: number;
  remainingTokens: number;
  percentageUsed: number;
}

// TransactionType enum values (matches backend: CHAT, IMAGE_ANALYSIS, PDF_ANALYSIS, RATE_LIMIT_EXCEEDED, MANUAL_RESET, DAILY_RESET)
// Frontend uses lowercase, backend uses uppercase
export type TransactionType =
  | 'chat'
  | 'image_analysis'
  | 'pdf_analysis'
  | 'rate_limit_exceeded'
  | 'manual_reset'
  | 'daily_reset';

export interface TokenTransaction {
  id: string;
  timestamp: Date;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  operation: TransactionType;
  userId?: string;
}

class TokenCountingService {
  private readonly DAILY_LIMIT = 500000; // 500K tokens per day per student (updated from 1M)
  private readonly STORAGE_KEY = 'athena_token_usage';
  private readonly TRANSACTIONS_KEY = 'athena_token_transactions';
  private readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Get current token usage for today (synchronous - uses localStorage fallback)
  getTokenUsage(): TokenUsage {
    const today = this.getTodayKey();
    const usage = this.getStoredUsage(today);
    const resetTime = this.getNextResetTime();

    return {
      used: usage.used,
      limit: this.DAILY_LIMIT,
      resetTime,
      sessionsToday: usage.sessions,
      remainingTokens: Math.max(0, this.DAILY_LIMIT - usage.used),
      percentageUsed: (usage.used / this.DAILY_LIMIT) * 100,
    };
  }

  // Get token usage from backend (async - preferred method)
  async getTokenUsageFromBackend(): Promise<TokenUsage> {
    try {
      // Get auth token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const response = await fetch(`${this.API_URL}/api/tokens/usage`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) {
        console.warn('Failed to fetch token usage from backend, using local storage');
        return this.getTokenUsage();
      }

      const data = await response.json();
      const dailyLimit = data.dailyLimit || this.DAILY_LIMIT;
      const tokensUsed = data.tokensUsed || 0;
      return {
        used: tokensUsed,
        limit: dailyLimit,
        resetTime: this.getNextResetTime(),
        sessionsToday: 0, // Not provided by backend, but we can track locally
        remainingTokens: data.tokensRemaining || this.DAILY_LIMIT,
        percentageUsed: dailyLimit > 0 ? (tokensUsed / dailyLimit) * 100 : 0,
      };
    } catch (error) {
      console.error('Error fetching token usage from backend:', error);
      // Fallback to local storage
      return this.getTokenUsage();
    }
  }

  // Get token statistics from backend (async)
  async getTokenStatsFromBackend(): Promise<any> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${this.API_URL}/api/tokens/stats`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch token stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching token stats from backend:', error);
      return null;
    }
  }

  // Record token usage
  recordTokenUsage(inputTokens: number, outputTokens: number, operation: string): TokenTransaction {
    const totalTokens = inputTokens + outputTokens;
    const today = this.getTodayKey();

    // Create transaction record
    const transaction: TokenTransaction = {
      id: this.generateTransactionId(),
      timestamp: new Date(),
      inputTokens,
      outputTokens,
      totalTokens,
      operation: operation as any,
      userId: this.getCurrentUserId(),
    };

    // Update daily usage
    const currentUsage = this.getStoredUsage(today);
    const newUsage = {
      used: currentUsage.used + totalTokens,
      sessions: currentUsage.sessions + 1,
      lastUpdated: new Date().toISOString(),
    };

    // Store updated usage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${this.STORAGE_KEY}_${today}`, JSON.stringify(newUsage));
    }

    // Store transaction
    this.storeTransaction(transaction);

    console.log(
      `🤖 Token Usage: +${totalTokens} tokens (${inputTokens} input + ${outputTokens} output) - Total today: ${newUsage.used}/${this.DAILY_LIMIT}`
    );

    return transaction;
  }

  // Estimate token count for text (approximation: 4 characters ≈ 1 token)
  estimateTokenCount(text: string): number {
    if (!text) return 0;

    // More accurate estimation based on OpenAI's tokenizer patterns
    // This is an approximation - exact counting would require the actual tokenizer
    const words = text.split(/\s+/).length;
    const characters = text.length;

    // Rough estimation: average of word-based and character-based counts
    const wordBasedTokens = Math.ceil(words * 1.3); // ~1.3 tokens per word
    const charBasedTokens = Math.ceil(characters / 4); // ~4 chars per token

    return Math.max(wordBasedTokens, Math.ceil(charBasedTokens * 0.75));
  }

  // Check if user can make a request (has tokens available)
  canMakeRequest(estimatedTokens: number = 0): boolean {
    const usage = this.getTokenUsage();
    return usage.used + estimatedTokens <= usage.limit;
  }

  // Get token usage warning level
  getUsageWarningLevel(): 'safe' | 'warning' | 'critical' | 'exceeded' {
    const usage = this.getTokenUsage();
    const percentage = usage.percentageUsed;

    if (percentage >= 100) return 'exceeded';
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'safe';
  }

  // Get usage statistics for display
  getUsageStats(): {
    todayUsage: TokenUsage;
    recentTransactions: TokenTransaction[];
    averageTokensPerMessage: number;
    mostTokensInSingleRequest: number;
    totalSessions: number;
  } {
    const todayUsage = this.getTokenUsage();
    const recentTransactions = this.getRecentTransactions(10);

    const averageTokensPerMessage =
      recentTransactions.length > 0
        ? recentTransactions.reduce((sum, t) => sum + t.totalTokens, 0) / recentTransactions.length
        : 0;

    const mostTokensInSingleRequest =
      recentTransactions.length > 0 ? Math.max(...recentTransactions.map((t) => t.totalTokens)) : 0;

    return {
      todayUsage,
      recentTransactions,
      averageTokensPerMessage: Math.round(averageTokensPerMessage),
      mostTokensInSingleRequest,
      totalSessions: todayUsage.sessionsToday,
    };
  }

  // Reset daily usage (called automatically at midnight)
  resetDailyUsage(): void {
    if (typeof window === 'undefined') return;

    const today = this.getTodayKey();
    localStorage.removeItem(`${this.STORAGE_KEY}_${today}`);
    console.log('🔄 Daily token usage reset');
  }

  // Clean up old usage data (keep last 7 days)
  cleanupOldData(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    keys.forEach((key) => {
      if (key.startsWith(this.STORAGE_KEY) && key.includes('_')) {
        const dateKey = key.split('_').pop();
        if (dateKey && new Date(dateKey) < cutoffDate) {
          localStorage.removeItem(key);
        }
      }
    });
  }

  // Export usage data for analysis
  exportUsageData(): string {
    const stats = this.getUsageStats();
    return JSON.stringify(stats, null, 2);
  }

  // Private helper methods
  private getTodayKey(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }

  private getStoredUsage(dateKey: string): {
    used: number;
    sessions: number;
    lastUpdated?: string;
  } {
    if (typeof window === 'undefined') return { used: 0, sessions: 0 };
    const stored = localStorage.getItem(`${this.STORAGE_KEY}_${dateKey}`);
    return stored ? JSON.parse(stored) : { used: 0, sessions: 0 };
  }

  private getNextResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string {
    if (typeof window === 'undefined') return 'student_anonymous';
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.id) {
          return 'student_' + user.id;
        }
      } catch {
        // ignore parse error
      }
    }
    return 'student_anonymous';
  }

  private storeTransaction(transaction: TokenTransaction): void {
    if (typeof window === 'undefined') return;

    const transactions = this.getRecentTransactions(100); // Keep last 100
    transactions.unshift(transaction);

    // Keep only the most recent 100 transactions
    if (transactions.length > 100) {
      transactions.splice(100);
    }

    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
  }

  private getRecentTransactions(limit: number = 10): TokenTransaction[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.TRANSACTIONS_KEY);
    const transactions = stored ? JSON.parse(stored) : [];
    return transactions.slice(0, limit);
  }

  // Auto-cleanup on initialization
  constructor() {
    // Only run client-side code in browser
    if (typeof window !== 'undefined') {
      this.cleanupOldData();

      // Check if we need to reset daily usage (new day)
      const lastReset = localStorage.getItem('last_token_reset');
      const today = this.getTodayKey();

      if (lastReset !== today) {
        // Don't reset if it's the same day
        if (lastReset && lastReset < today) {
          this.resetDailyUsage();
        }
        localStorage.setItem('last_token_reset', today);
      }
    }
  }

  // Calculate tokens for different operations
  calculateImageTokens(imageSizeKB: number): number {
    // Kimi Vision tokens are roughly based on image resolution
    // This is an approximation - actual usage may vary
    const baseTokens = 258; // Base cost for image processing
    const sizeTokens = Math.ceil(imageSizeKB / 100) * 10; // ~10 tokens per 100KB
    return baseTokens + sizeTokens;
  }

  calculatePdfTokens(textLength: number): number {
    // PDF processing includes text extraction + analysis
    const extractionTokens = this.estimateTokenCount(textLength.toString());
    const analysisTokens = Math.ceil(extractionTokens * 0.3); // Analysis overhead
    return extractionTokens + analysisTokens;
  }

  // Get real-time token usage from Kimi response
  extractTokensFromKimiResponse(response: any): { inputTokens: number; outputTokens: number } {
    // Extract actual token usage from Kimi API response if available
    if (response.inputTokens !== undefined && response.outputTokens !== undefined) {
      return {
        inputTokens: response.inputTokens || 0,
        outputTokens: response.outputTokens || 0,
      };
    }

    // Fallback to estimation if metadata not available
    const outputText = response.response || '';
    return {
      inputTokens: 0, // Would need to estimate input
      outputTokens: this.estimateTokenCount(outputText),
    };
  }
}

export const tokenCountingService = new TokenCountingService();
