export interface Position {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  gainLoss: number;
  gainLossPct: number;
  sector: string;
  logoColor: string;
}

export const mockPositions: Position[] = [
  {
    id: '1',
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    shares: 0.17393,
    avgCost: 114.99,
    currentPrice: 204.95,
    value: 35.63,
    gainLoss: 15.63,
    gainLossPct: 78.15,
    sector: 'Technology',
    logoColor: '#76b900',
  },
  {
    id: '2',
    ticker: 'VDE',
    name: 'Vanguard Energy ETF',
    shares: 0.06568,
    avgCost: 117.08,
    currentPrice: 161.00,
    value: 10.58,
    gainLoss: 2.89,
    gainLossPct: 37.58,
    sector: 'Energy',
    logoColor: '#c1272d',
  },
  {
    id: '3',
    ticker: 'XLK',
    name: 'SPDR Technology ETF',
    shares: 0.04919,
    avgCost: 101.65,
    currentPrice: 183.16,
    value: 9.01,
    gainLoss: 3.99,
    gainLossPct: 80.20,
    sector: 'Technology',
    logoColor: '#1a73e8',
  },
  {
    id: '4',
    ticker: 'KC',
    name: 'Kingsoft Cloud',
    shares: 0.20577,
    avgCost: 14.58,
    currentPrice: 10.89,
    value: 2.24,
    gainLoss: -0.76,
    gainLossPct: -25.33,
    sector: 'Technology',
    logoColor: '#ff6b00',
  },
];

export const mockPortfolio = {
  totalValue: 57.46,
  totalCost: 35.69,
  totalGainLoss: 21.77,
  totalGainLossPct: 61.0,
  dayChange: 0.82,
  dayChangePct: 1.45,
};
