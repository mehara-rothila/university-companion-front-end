import { tokenCountingService } from '../tokenCountingService';

const DAILY_LIMIT = 500000;
const todayKey = () => new Date().toISOString().split('T')[0];
const usageStorageKey = () => `athena_token_usage_${todayKey()}`;

const seedUsage = (used: number, sessions = 1) => {
  localStorage.setItem(
    usageStorageKey(),
    JSON.stringify({ used, sessions, lastUpdated: new Date().toISOString() })
  );
};

beforeEach(() => {
  localStorage.clear();
});

describe('getTokenUsage', () => {
  it('returns a fresh allowance when nothing is stored', () => {
    const usage = tokenCountingService.getTokenUsage();

    expect(usage.used).toBe(0);
    expect(usage.limit).toBe(DAILY_LIMIT);
    expect(usage.remainingTokens).toBe(DAILY_LIMIT);
    expect(usage.percentageUsed).toBe(0);
  });

  it('reads stored usage for today', () => {
    seedUsage(100000, 3);

    const usage = tokenCountingService.getTokenUsage();

    expect(usage.used).toBe(100000);
    expect(usage.sessionsToday).toBe(3);
    expect(usage.remainingTokens).toBe(DAILY_LIMIT - 100000);
    expect(usage.percentageUsed).toBe(20);
  });

  it('never reports negative remaining tokens', () => {
    seedUsage(DAILY_LIMIT + 5000);

    expect(tokenCountingService.getTokenUsage().remainingTokens).toBe(0);
  });

  it('reports the next reset at upcoming midnight', () => {
    const resetTime = tokenCountingService.getTokenUsage().resetTime;

    expect(resetTime.getHours()).toBe(0);
    expect(resetTime.getMinutes()).toBe(0);
    expect(resetTime.getTime()).toBeGreaterThan(Date.now());
  });
});

describe('recordTokenUsage', () => {
  it('accumulates usage and stores the transaction', () => {
    tokenCountingService.recordTokenUsage(100, 50, 'chat');
    const transaction = tokenCountingService.recordTokenUsage(200, 100, 'chat');

    expect(transaction.totalTokens).toBe(300);
    expect(transaction.inputTokens).toBe(200);
    expect(transaction.outputTokens).toBe(100);

    const usage = tokenCountingService.getTokenUsage();
    expect(usage.used).toBe(450);
    expect(usage.sessionsToday).toBe(2);

    const stored = JSON.parse(localStorage.getItem('athena_token_transactions') || '[]');
    expect(stored).toHaveLength(2);
  });
});

describe('estimateTokenCount', () => {
  it('returns 0 for empty text', () => {
    expect(tokenCountingService.estimateTokenCount('')).toBe(0);
  });

  it('estimates more tokens for longer text', () => {
    const short = tokenCountingService.estimateTokenCount('hello');
    const long = tokenCountingService.estimateTokenCount(
      'this is a much longer sentence that should produce a larger token estimate'
    );

    expect(short).toBeGreaterThan(0);
    expect(long).toBeGreaterThan(short);
  });
});

describe('canMakeRequest', () => {
  it('allows requests within the daily limit', () => {
    seedUsage(1000);
    expect(tokenCountingService.canMakeRequest(500)).toBe(true);
  });

  it('rejects requests that would exceed the limit', () => {
    seedUsage(DAILY_LIMIT - 100);
    expect(tokenCountingService.canMakeRequest(200)).toBe(false);
  });
});

describe('getUsageWarningLevel', () => {
  it.each([
    [0, 'safe'],
    [DAILY_LIMIT * 0.5, 'safe'],
    [DAILY_LIMIT * 0.8, 'warning'],
    [DAILY_LIMIT * 0.95, 'critical'],
    [DAILY_LIMIT, 'exceeded'],
  ])('reports %d used tokens as %s', (used, level) => {
    seedUsage(used as number);
    expect(tokenCountingService.getUsageWarningLevel()).toBe(level);
  });
});

describe('getTokenUsageFromBackend', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('maps the backend response into TokenUsage', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tokensUsed: 125000,
        tokensRemaining: 375000,
        dailyLimit: DAILY_LIMIT,
      }),
    }) as jest.Mock;

    const usage = await tokenCountingService.getTokenUsageFromBackend();

    expect(usage.used).toBe(125000);
    expect(usage.remainingTokens).toBe(375000);
    expect(usage.limit).toBe(DAILY_LIMIT);
    expect(usage.percentageUsed).toBe(25);
  });

  it('sends the stored auth token as a Bearer header', async () => {
    localStorage.setItem('token', 'jwt-abc');
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ tokensUsed: 0, tokensRemaining: DAILY_LIMIT, dailyLimit: DAILY_LIMIT }),
    });
    global.fetch = fetchMock as jest.Mock;

    await tokenCountingService.getTokenUsageFromBackend();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/tokens/usage'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-abc' }),
      })
    );
  });

  it('falls back to local storage when the backend fails', async () => {
    seedUsage(42000);
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as jest.Mock;

    const usage = await tokenCountingService.getTokenUsageFromBackend();

    expect(usage.used).toBe(42000);
  });

  it('falls back to local storage when fetch throws', async () => {
    seedUsage(9000);
    global.fetch = jest.fn().mockRejectedValue(new Error('network down')) as jest.Mock;

    const usage = await tokenCountingService.getTokenUsageFromBackend();

    expect(usage.used).toBe(9000);
  });
});

describe('cleanupOldData', () => {
  it('removes usage entries older than 7 days and keeps recent ones', () => {
    const oldKey = 'athena_token_usage_2020-01-01';
    localStorage.setItem(oldKey, JSON.stringify({ used: 1, sessions: 1 }));
    seedUsage(500);

    tokenCountingService.cleanupOldData();

    expect(localStorage.getItem(oldKey)).toBeNull();
    expect(localStorage.getItem(usageStorageKey())).not.toBeNull();
  });
});

describe('operation token calculators', () => {
  it('calculates image tokens from file size', () => {
    // 258 base + ceil(500/100)*10 = 308
    expect(tokenCountingService.calculateImageTokens(500)).toBe(308);
  });

  it('charges at least the base cost for tiny images', () => {
    expect(tokenCountingService.calculateImageTokens(0)).toBe(258);
  });

  it('calculates pdf tokens with analysis overhead', () => {
    const tokens = tokenCountingService.calculatePdfTokens(4000);
    expect(tokens).toBeGreaterThan(0);
  });
});

describe('extractTokensFromKimiResponse', () => {
  it('uses exact counts when the response provides them', () => {
    const result = tokenCountingService.extractTokensFromKimiResponse({
      inputTokens: 120,
      outputTokens: 80,
    });

    expect(result).toEqual({ inputTokens: 120, outputTokens: 80 });
  });

  it('estimates output tokens when metadata is missing', () => {
    const result = tokenCountingService.extractTokensFromKimiResponse({
      response: 'a reasonably sized response text from the model',
    });

    expect(result.inputTokens).toBe(0);
    expect(result.outputTokens).toBeGreaterThan(0);
  });
});
