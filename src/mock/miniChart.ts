export const miniChartMock = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  value: 5000 + Math.sin(i / 5) * 20 + Math.random() * 10,
}));