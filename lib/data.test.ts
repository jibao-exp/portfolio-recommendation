import { fetchHoldings, fetchPrices, fetchBenchmark, fetchConstraints } from './data';

const BASE_URL = 'https://antarctica-hiring-data.s3.eu-west-1.amazonaws.com/portfolio-optimisation/2026-04';

describe('fetchHoldings', () => {
  const mockHoldings = [
    { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 0.2 },
    { isin: 'B001', name: 'Asset B', asset_class: 'Fixed Income', currency: 'USD', weight: 0.3 },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('fetches holdings from the correct URL', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHoldings,
    });

    const result = await fetchHoldings();

    expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/holdings.json`);
    expect(result).toEqual(mockHoldings);
  });

  it('returns empty array on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const result = await fetchHoldings();

    expect(result).toEqual([]);
  });

  it('returns empty array on network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchHoldings();

    expect(result).toEqual([]);
  });

  it('returns empty array when response is not an array', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ key: 'value' }),
    });

    const result = await fetchHoldings();

    expect(result).toEqual([]);
  });

  it('filters out holdings with missing isin', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 0.2 },
        { isin: 'B001', name: 'Asset B', asset_class: 'Fixed Income', currency: 'USD', weight: 0.3 },
      ],
    });

    const result = await fetchHoldings();

    expect(result).toHaveLength(1);
    expect(result[0].isin).toBe('B001');
  });

  it('filters out holdings with empty isin', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { isin: '', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 0.2 },
        { isin: 'B001', name: 'Asset B', asset_class: 'Fixed Income', currency: 'USD', weight: 0.3 },
      ],
    });

    const result = await fetchHoldings();

    expect(result).toHaveLength(1);
    expect(result[0].isin).toBe('B001');
  });

  it('filters out holdings with NaN weight', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: NaN },
        { isin: 'B001', name: 'Asset B', asset_class: 'Fixed Income', currency: 'USD', weight: 0.3 },
      ],
    });

    const result = await fetchHoldings();

    expect(result).toHaveLength(1);
    expect(result[0].isin).toBe('B001');
  });

  it('filters out holdings with negative weight', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: -0.1 },
        { isin: 'B001', name: 'Asset B', asset_class: 'Fixed Income', currency: 'USD', weight: 0.3 },
      ],
    });

    const result = await fetchHoldings();

    expect(result).toHaveLength(1);
    expect(result[0].isin).toBe('B001');
  });

  it('filters out holdings with weight greater than 1', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 1.5 },
        { isin: 'B001', name: 'Asset B', asset_class: 'Fixed Income', currency: 'USD', weight: 0.3 },
      ],
    });

    const result = await fetchHoldings();

    expect(result).toHaveLength(1);
    expect(result[0].isin).toBe('B001');
  });

  it('filters out holdings with missing name', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { isin: 'A001', asset_class: 'Equity', currency: 'USD', weight: 0.2 },
        { isin: 'B001', name: 'Asset B', asset_class: 'Fixed Income', currency: 'USD', weight: 0.3 },
      ],
    });

    const result = await fetchHoldings();

    expect(result).toHaveLength(1);
    expect(result[0].isin).toBe('B001');
  });

  it('filters out null items in holdings array', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        null,
        { isin: 'A001', name: 'Asset A', asset_class: 'Equity', currency: 'USD', weight: 0.2 },
        undefined,
      ],
    });

    const result = await fetchHoldings();

    expect(result).toHaveLength(1);
  });
});

describe('fetchPrices', () => {
  const mockPrices = [
    { date: '2023-04-05', isin: 'A001', price: 100 },
    { date: '2023-04-06', isin: 'A001', price: '101.5' },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('fetches prices and converts string prices to numbers', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrices,
    });

    const result = await fetchPrices();

    expect(result).toHaveLength(2);
    expect(result[0].price).toBe(100);
    expect(result[1].price).toBe(101.5);
    expect(typeof result[1].price).toBe('number');
  });

  it('handles numeric prices without conversion', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { date: '2023-04-05', isin: 'A001', price: 85.0 },
      ],
    });

    const result = await fetchPrices();

    expect(result[0].price).toBe(85.0);
  });

  it('filters out NaN prices', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { date: '2023-04-05', isin: 'A001', price: 'not-a-number' },
        { date: '2023-04-06', isin: 'A001', price: 100 },
      ],
    });

    const result = await fetchPrices();

    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(100);
  });

  it('returns empty array when prices response is not an array', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ key: 'value' }),
    });

    const result = await fetchPrices();

    expect(result).toEqual([]);
  });

  it('returns empty array on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    });

    const result = await fetchPrices();

    expect(result).toEqual([]);
  });

  it('returns empty array on network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchPrices();

    expect(result).toEqual([]);
  });

  it('filters out prices with zero price', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { date: '2023-04-05', isin: 'A001', price: 0 },
        { date: '2023-04-06', isin: 'A001', price: 100 },
      ],
    });

    const result = await fetchPrices();

    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(100);
  });

  it('filters out prices with negative price', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { date: '2023-04-05', isin: 'A001', price: -10 },
        { date: '2023-04-06', isin: 'A001', price: 100 },
      ],
    });

    const result = await fetchPrices();

    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(100);
  });

  it('filters out prices with missing isin', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { date: '2023-04-05', price: 100 },
        { date: '2023-04-06', isin: 'A001', price: 100 },
      ],
    });

    const result = await fetchPrices();

    expect(result).toHaveLength(1);
  });

  it('filters out prices with missing date', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { isin: 'A001', price: 100 },
        { date: '2023-04-06', isin: 'A001', price: 100 },
      ],
    });

    const result = await fetchPrices();

    expect(result).toHaveLength(1);
  });

  it('filters out null items in prices array', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        null,
        { date: '2023-04-05', isin: 'A001', price: 100 },
      ],
    });

    const result = await fetchPrices();

    expect(result).toHaveLength(1);
  });
});

describe('fetchBenchmark', () => {
  const mockBenchmark = [
    { date: '2023-04-05', level: 1000.0 },
    { date: '2023-04-06', level: 992.6 },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('fetches benchmark data from the correct URL', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBenchmark,
    });

    const result = await fetchBenchmark();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://antarctica-hiring-data.s3.eu-west-1.amazonaws.com/portfolio-optimisation/2026-04/benchmark.json'
    );
    expect(result).toEqual(mockBenchmark);
  });

  it('returns empty array on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const result = await fetchBenchmark();

    expect(result).toEqual([]);
  });

  it('returns empty array when benchmark response is not an array', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ key: 'value' }),
    });

    const result = await fetchBenchmark();

    expect(result).toEqual([]);
  });

  it('returns empty array on network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchBenchmark();

    expect(result).toEqual([]);
  });

  it('filters out benchmark points with zero level', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { date: '2023-04-05', level: 0 },
        { date: '2023-04-06', level: 1000 },
      ],
    });

    const result = await fetchBenchmark();

    expect(result).toHaveLength(1);
    expect(result[0].level).toBe(1000);
  });

  it('filters out benchmark points with negative level', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { date: '2023-04-05', level: -100 },
        { date: '2023-04-06', level: 1000 },
      ],
    });

    const result = await fetchBenchmark();

    expect(result).toHaveLength(1);
    expect(result[0].level).toBe(1000);
  });

  it('filters out benchmark points with NaN level', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { date: '2023-04-05', level: NaN },
        { date: '2023-04-06', level: 1000 },
      ],
    });

    const result = await fetchBenchmark();

    expect(result).toHaveLength(1);
    expect(result[0].level).toBe(1000);
  });

  it('filters out benchmark points with missing date', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { level: 1000 },
        { date: '2023-04-06', level: 1000 },
      ],
    });

    const result = await fetchBenchmark();

    expect(result).toHaveLength(1);
  });

  it('filters out null items in benchmark array', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        null,
        { date: '2023-04-05', level: 1000 },
      ],
    });

    const result = await fetchBenchmark();

    expect(result).toHaveLength(1);
  });
});

describe('fetchConstraints', () => {
  const mockConstraints = {
    min_weight: 0.02,
    max_weight: 0.25,
    per_asset_class_caps: { Equity: 0.3, 'Fixed Income': 0.3, Alternatives: 0.3 },
    max_assets: 5,
  };

  const defaultConstraints = {
    min_weight: 0.02,
    max_weight: 0.25,
    per_asset_class_caps: {},
    max_assets: 5,
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('fetches constraints from the correct URL', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockConstraints,
    });

    const result = await fetchConstraints();

    expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/constraints.json`);
    expect(result).toEqual(mockConstraints);
  });

  it('returns defaults on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 408,
      statusText: 'Timeout',
    });

    const result = await fetchConstraints();

    expect(result).toEqual(defaultConstraints);
  });

  it('returns defaults on network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchConstraints();

    expect(result).toEqual(defaultConstraints);
  });

  it('returns defaults when response is not an object', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => 'not an object',
    });

    const result = await fetchConstraints();

    expect(result).toEqual(defaultConstraints);
  });

  it('fills missing fields with defaults', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ min_weight: 0.05 }),
    });

    const result = await fetchConstraints();

    expect(result.min_weight).toBe(0.05);
    expect(result.max_weight).toBe(0.25);
    expect(result.max_assets).toBe(5);
  });

  it('returns defaults when min_weight is greater than max_weight', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ min_weight: 0.5, max_weight: 0.25 }),
    });

    const result = await fetchConstraints();

    expect(result).toEqual(defaultConstraints);
  });

  it('returns defaults when min_weight is negative', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ min_weight: -0.1, max_weight: 0.25 }),
    });

    const result = await fetchConstraints();

    expect(result.min_weight).toBe(0.02);
    expect(result.max_weight).toBe(0.25);
  });

  it('returns defaults when max_weight is zero', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ min_weight: 0.02, max_weight: 0 }),
    });

    const result = await fetchConstraints();

    expect(result.max_weight).toBe(0.25);
  });

  it('returns defaults when max_assets is zero', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ max_assets: 0 }),
    });

    const result = await fetchConstraints();

    expect(result.max_assets).toBe(5);
  });

  it('returns defaults when max_assets is negative', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ max_assets: -3 }),
    });

    const result = await fetchConstraints();

    expect(result.max_assets).toBe(5);
  });

  it('returns defaults when per_asset_class_caps is an array', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ per_asset_class_caps: ['Equity', 'Fixed Income'] }),
    });

    const result = await fetchConstraints();

    expect(result.per_asset_class_caps).toEqual({});
  });

  it('returns defaults when per_asset_class_caps is null', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ per_asset_class_caps: null }),
    });

    const result = await fetchConstraints();

    expect(result.per_asset_class_caps).toEqual({});
  });

  it('returns defaults when response is an array', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [1, 2, 3],
    });

    const result = await fetchConstraints();

    expect(result).toEqual(defaultConstraints);
  });

  it('returns defaults when response is null', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });

    const result = await fetchConstraints();

    expect(result).toEqual(defaultConstraints);
  });
});
