export type Point = {
  time: number;
  value: number;
};

export type SseChartEvent = {
  symbol: string;
  time: number;
  value: number;
};

export type CoinRowData = {
  name: string;
  symbol: string;
  price: number ; 
  marketCap: number;
  volume24h: number ;
  hourChange: number; 
  dayChange: number;
  weekChange: number;
  priceHistoryDay: number[];
  priceHistoryHour: number[];  
};
