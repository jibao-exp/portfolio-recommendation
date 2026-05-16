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

  it('throws on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    });

    await expect(fetchHoldings()).rejects.toThrow('Failed to fetch holdings: Not Found');
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

  it('throws on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Service Unavailable',
    });

    await expect(fetchPrices()).rejects.toThrow('Failed to fetch prices: Service Unavailable');
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

  it('throws on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });

    await expect(fetchBenchmark()).rejects.toThrow('Failed to fetch benchmark: Internal Server Error');
  });
});

describe('fetchConstraints', () => {
  const mockConstraints = {
    min_weight: 0.02,
    max_weight: 0.25,
    per_asset_class_caps: { Equity: 0.3, 'Fixed Income': 0.3, Alternatives: 0.3 },
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

  it('throws on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Timeout',
    });

    await expect(fetchConstraints()).rejects.toThrow('Failed to fetch constraints: Timeout');
  });
});
