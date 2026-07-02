import {
  generateId,
  formatTimestamp,
  formatFileSize,
  getTimeBasedGreeting,
  generateWelcomeMessage,
  getQuickActions,
  classifyIntent,
  extractEntities,
  calculateConfidence,
  formatResponse,
  containsSensitiveInfo,
  calculateTypingDuration,
} from '../athenaUtils';

describe('generateId', () => {
  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it('matches the timestamp-random format', () => {
    expect(generateId()).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

describe('formatTimestamp', () => {
  it('formats a date as hours and minutes', () => {
    const formatted = formatTimestamp(new Date('2026-07-02T14:05:00'));
    expect(formatted).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('formatFileSize', () => {
  it('handles zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('formats bytes, KB, MB and GB', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });
});

describe('getTimeBasedGreeting', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  const atHour = (hour: number) => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 2, hour, 0, 0));
    return getTimeBasedGreeting();
  };

  it('greets by time of day', () => {
    expect(atHour(8)).toContain('Good morning');
    expect(atHour(13)).toContain('Good afternoon');
    expect(atHour(18)).toContain('Good evening');
    expect(atHour(22)).toContain('Good night');
  });
});

describe('generateWelcomeMessage', () => {
  it('creates an athena message with suggestions', () => {
    const message = generateWelcomeMessage();

    expect(message.type).toBe('athena');
    expect(message.content).toContain('Athena');
    expect(message.id).toBeTruthy();
    expect(message.timestamp).toBeInstanceOf(Date);
    expect(message.suggestions).toHaveLength(4);
  });
});

describe('classifyIntent', () => {
  it.each([
    ['I want to borrow a book', 'library'],
    ['I lost my wallet yesterday', 'lost_found'],
    ['how do I apply for a scholarship', 'financial_aid'],
    ['where is the lecture hall', 'navigation'],
    ['I am feeling a lot of stress', 'wellness'],
    ['I need counseling for anxiety', 'wellness'],
    ['what is the weather like', 'weather'],
    ['any new announcement', 'notifications'],
    ['this is an emergency', 'emergency'],
    ['what can I eat at the cafeteria', 'dining'],
    ['when is my exam', 'academic'],
  ])('classifies "%s" as %s', (message, intent) => {
    expect(classifyIntent(message)).toBe(intent);
  });

  it('falls back to general for unmatched messages', () => {
    expect(classifyIntent('hello there')).toBe('general');
  });

  it('is case-insensitive', () => {
    expect(classifyIntent('WEATHER please')).toBe('weather');
  });

  it('matches whole words only, not substrings', () => {
    // "feeling" must not match the financial_aid keyword "fee"
    expect(classifyIntent('I am feeling fine')).toBe('general');
  });
});

describe('getQuickActions', () => {
  it('returns actions for a known intent', () => {
    const actions = getQuickActions('library');

    expect(actions).toHaveLength(3);
    expect(actions.every(action => action.route === '/library')).toBe(true);
  });

  it('falls back to general actions for unknown intents', () => {
    expect(getQuickActions('nonexistent')).toEqual(getQuickActions('general'));
  });
});

describe('extractEntities', () => {
  it('extracts building names', () => {
    const entities = extractEntities('How do I get to the Engineering Building?');
    expect(entities.buildings).toEqual(['engineering building']);
  });

  it('extracts time references', () => {
    const entities = extractEntities('Is it open tomorrow at 10:30?');
    expect(entities.timeReferences).toEqual(expect.arrayContaining(['tomorrow', '10:30']));
  });

  it('flags urgent messages', () => {
    expect(extractEntities('I need this ASAP').urgency).toBe('high');
    expect(extractEntities('no rush at all').urgency).toBeUndefined();
  });

  it('returns an empty object when nothing matches', () => {
    expect(extractEntities('just saying hi')).toEqual({});
  });
});

describe('calculateConfidence', () => {
  it('scores higher when more keywords match', () => {
    const low = calculateConfidence('hello', 'library');
    const high = calculateConfidence('I need a book from the library to study research', 'library');

    expect(high).toBeGreaterThan(low);
  });

  it('never drops below the 25% floor', () => {
    expect(calculateConfidence('completely unrelated', 'library')).toBe(25);
  });

  it('caps at 100%', () => {
    const confidence = calculateConfidence(
      'lost and found something missing', 'lost_found');
    expect(confidence).toBeLessThanOrEqual(100);
  });

  it('returns the minimum confidence for intents without keyword patterns', () => {
    expect(calculateConfidence('what can I eat', 'dining')).toBe(25);
  });
});

describe('formatResponse', () => {
  it('converts bold and italic markdown', () => {
    expect(formatResponse('**bold**')).toBe('<strong>bold</strong>');
    expect(formatResponse('*italic*')).toBe('<em>italic</em>');
  });

  it('converts bullet points and line breaks', () => {
    expect(formatResponse('• item')).toContain('<span>item</span>');
    expect(formatResponse('line1\nline2')).toBe('line1<br/>line2');
  });
});

describe('containsSensitiveInfo', () => {
  it.each([
    ['my card is 4111 1111 1111 1111', true],
    ['ssn 123-45-6789', true],
    ['mail me at student@uni.edu', true],
    ['my password is secret', true],
    ['what is my PIN', true],
    ['what time does the library open', false],
  ])('detects sensitive info in "%s" -> %s', (message, expected) => {
    expect(containsSensitiveInfo(message)).toBe(expected);
  });
});

describe('calculateTypingDuration', () => {
  it('has a 1 second base duration', () => {
    expect(calculateTypingDuration(0)).toBe(1000);
  });

  it('grows with response length', () => {
    expect(calculateTypingDuration(100)).toBe(4000);
  });

  it('caps at 5 seconds', () => {
    expect(calculateTypingDuration(10000)).toBe(5000);
  });
});
