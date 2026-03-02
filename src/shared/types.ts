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
  percentHour: number;
  percentDay: number;
  percentWeek: number;
  volumeDay: number;
  marketCap: number;
};
