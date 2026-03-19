import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Button, Chip, Collapse, Divider, Grid, LinearProgress,
  Paper, Stack, Typography, CircularProgress, Alert
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip, type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import { alpha } from "@mui/material/styles";
import { theme } from "../../../theme.ts";
import { glassButtonSx, glassButtonSxPressed } from "../../../shared/styles/glass.ts";
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

type PeriodMetricItem = {
  price: number;
  unixSeconds: number;
};

type CoinMetricItem = {
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  hourChange: number;
  dayChange: number;
  weekChange: number;
};

const formatPrice = (value: number): string => {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + " $";
};

const formatCompactPrice = (value: number): string => {
  if (value >= 1e12) return (value / 1e12).toFixed(2) + ' трлн $';
  if (value >= 1e9) return (value / 1e9).toFixed(2) + ' млрд $';
  if (value >= 1e6) return (value / 1e6).toFixed(2) + ' млн $';
  return formatPrice(value);
};

const periods = ['1ч', '24ч', '7д', '30д'];
const periodToApiParam = ['HOUR', 'DAY', 'WEEK', 'MONTH'];

type YTickProps = {
  x?: number;
  y?: number;
  payload?: {
    value: number;
  }
}

const YTick = ({ x = 0, y = 0, payload }: YTickProps) => {
  const value = payload?.value ?? 0;
  const formatted = formatCompactPrice(value);
  return (
    <text x={x} y={y} dy={4} textAnchor="start" fill={theme.palette.text.secondary} fontSize={10} fontWeight={700}>
      {formatted}
    </text>
  );
};

const ChartToolTip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload; 
  const value = Number(payload[0].value ?? 0);
  const date = new Date(data.timestamp);
  const formattedDate = date.toLocaleString('ru-RU', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  return (
    <div style={{ borderRadius: 8, backgroundColor: alpha(theme.palette.background.default, 0.1), backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", borderTop: "1px solid rgba(255,255,255,0.3)", boxShadow: `0 0 10px 0 ${theme.palette.primary.main}`, padding: 16, color: theme.palette.text.secondary, fontWeight: 400, fontSize: 12 }}>
      <div>{formattedDate}</div>
      <div>Цена: {formatPrice(value)}</div>
    </div>
  );
};

export const CoinMarketOverviewSection: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coinInfo, setCoinInfo] = useState<CoinMetricItem | null>(null);
  const [history, setHistory] = useState<PeriodMetricItem[]>([]);
  const [activePeriod, setActivePeriod] = useState(0);
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

const formatXAxis = (timestamp: number) => {
  const date = new Date(timestamp);
  if (activePeriod === 0) { 
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (activePeriod === 1) { 
    return `${date.getHours()}:00`;
  } else if (activePeriod === 2) { 
    return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
  } else {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }
};

useEffect(() => {
  if (!symbol) return;
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const coinsRes = await fetch('/api/coins/with_metrics');
      if (!coinsRes.ok) throw new Error('Ошибка загрузки данных монет');
      const coinsData: CoinMetricItem[] = await coinsRes.json();
      const coin = coinsData.find(
        (c) => c.symbol.toUpperCase() === symbol.toUpperCase()
      );
      if (!coin) throw new Error('Монета не найдена');
      const safeCoin: CoinMetricItem = {
        name: coin.name || 'Unknown',
        symbol: coin.symbol || '',
        price: coin.price ?? 0,
        hourChange: coin.hourChange ?? 0,
        dayChange: coin.dayChange ?? 0,
        weekChange: coin.weekChange ?? 0,
        volume24h: coin.volume24h ?? 0,
        marketCap: coin.marketCap ?? 0,
      };
      setCoinInfo(safeCoin);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [symbol]);

  useEffect(() => {
  if (isAiSummaryOpen) {
    fetchAiSummary();
  }
}, [isAiSummaryOpen, activePeriod, symbol]);

useEffect(() => {
  if (!symbol) return;

  let isMounted = true;

  const loadHistory = async () => {
    try {
    const periodParam = periodToApiParam[activePeriod];
    const res = await fetch(`/api/metrics/${symbol.toUpperCase()}?period=${periodParam}`);
    if (!res.ok) throw new Error('Ошибка загрузки истории');
    const data: PeriodMetricItem[] = await res.json();
    const sorted = [...data].sort((a, b) => a.unixSeconds - b.unixSeconds);
    if (isMounted) {
      setHistory(sorted);
      if (sorted.length > 0) {
        const lastPrice = sorted[sorted.length - 1].price;
        setCoinInfo(prev => prev ? { ...prev, price: lastPrice } : prev);
      }
    }
  } catch (err) {
    console.error('Polling history error:', err);
  }
  };

  loadHistory(); 
  const intervalId = setInterval(loadHistory, 30000); 

  return () => {
    isMounted = false;
    clearInterval(intervalId);
  };
}, [symbol, activePeriod]); 

const chartData = history.map((item, idx) => ({
  index: idx, 
  timestamp: item.unixSeconds * 1000,
  value: item.price,
}));

  const dayHistory = history.filter((_, idx) => idx >= history.length - 24);
  const minPrice = dayHistory.length ? Math.min(...dayHistory.map(d => d.price)) : 0;
  const maxPrice = dayHistory.length ? Math.max(...dayHistory.map(d => d.price)) : 0;
  const currentPrice = coinInfo?.price || 0;
  const progressValue = maxPrice > minPrice ? ((currentPrice - minPrice) / (maxPrice - minPrice)) * 100 : 0;

  const yValues = chartData.map(d => d.value);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const yPadding = (yMax - yMin) * 0.1 || 1;
  const yDomain = [yMin - yPadding, yMax + yPadding];

  const fetchAiSummary = async () => {
  if (!symbol) return;
  setAiLoading(true);
  setAiError(null);
  try {
    const periodParam = periodToApiParam[activePeriod];
    const res = await fetch(`/api/analysis/${symbol.toUpperCase()}?period=${periodParam}`);
    if (!res.ok) throw new Error('Ошибка загрузки резюме');
    const data = await res.json(); 
    const summaryText = data.analysis || 'Нет данных';
    setAiSummary(summaryText);
  } catch (err) {
    setAiError((err as Error).message);
  } finally {
    setAiLoading(false);
  }
};

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !coinInfo) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error || 'Не удалось загрузить данные'}
      </Alert>
    );
  }

  return (
    <Paper elevation={0} sx={{ py: 2, background: "none" }}>
      <Grid container spacing={2.5} alignItems="stretch">
        <Grid size={{ xs: 12, md: 4.2 }} sx={{ display: "flex" }}>
          <Stack spacing={2.5} sx={{ width: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#000", color: "#fff", display: "grid", placeItems: "center" }}>
                  <CurrencyBitcoinIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography sx={{ color: "text.primary", fontSize: 18, fontWeight: 700 }}>
                  {coinInfo.name}{" "}
                  <Box component="span" sx={{ color: "primary.main", fontWeight: 400 }}>
                    курс {coinInfo.symbol}
                  </Box>
                </Typography>
              </Stack>
              <Typography sx={{ color: "text.primary", fontWeight: 700, fontSize: 32, lineHeight: 1 }}>
                {coinInfo.price ? formatPrice(coinInfo.price) : 'N/A'}
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <LinearProgress
                variant="determinate"
                value={progressValue}
                sx={{
                  height: 12,
                  borderRadius: 1.5,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 1.5,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
                  },
                }}
              />
              <Stack direction="row" justifyContent="space-between" sx={{ color: "text.secondary", fontSize: 14, fontWeight: 500 }}>
                <Typography>{formatPrice(minPrice)}</Typography>
                <Typography>Диапазон 24 ч.</Typography>
                <Typography>{formatPrice(maxPrice)}</Typography>
              </Stack>
            </Stack>

            <Stack spacing={1.25}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.25 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography sx={{ color: "text.secondary", fontSize: 14, fontWeight: 500 }}>Рыночная капитализация</Typography>
                  <InfoOutlinedIcon sx={{ color: "text.secondary", fontSize: 14 }} />
                </Stack>
                <Typography sx={{ color: "text.primary", fontSize: 16, fontWeight: 500 }}>
                  {coinInfo.marketCap ? formatCompactPrice(coinInfo.marketCap) : 'N/A'}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.25 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography sx={{ color: "text.secondary", fontSize: 14, fontWeight: 500 }}>Объём торгов (24ч)</Typography>
                  <InfoOutlinedIcon sx={{ color: "text.secondary", fontSize: 14 }} />
                </Stack>
                <Typography sx={{ color: "text.primary", fontSize: 16, fontWeight: 500 }}>
                  {coinInfo.volume24h ? formatCompactPrice(coinInfo.volume24h) : 'N/A'}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.25 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography sx={{ color: "text.secondary", fontSize: 14, fontWeight: 500 }}>Изменение за 1ч</Typography>
                  <InfoOutlinedIcon sx={{ color: "text.secondary", fontSize: 14 }} />
                </Stack>
                <Typography sx={{ fontSize: 16, fontWeight: 500, color: coinInfo.hourChange >= 0 ? 'success.main' : 'error.main' }}>
                  {coinInfo.hourChange != null
                    ? (coinInfo.hourChange > 0 ? '+' : '') + coinInfo.hourChange.toFixed(2) + '%'
                    : 'N/A'}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.25 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography sx={{ color: "text.secondary", fontSize: 14, fontWeight: 500 }}>Изменение за 24ч</Typography>
                  <InfoOutlinedIcon sx={{ color: "text.secondary", fontSize: 14 }} />
                </Stack>
                <Typography sx={{ fontSize: 16, fontWeight: 500, color: coinInfo.dayChange >= 0 ? 'success.main' : 'error.main' }}>
                  {coinInfo.dayChange != null
                    ? (coinInfo.dayChange > 0 ? '+' : '') + coinInfo.dayChange.toFixed(2) + '%'
                    : 'N/A'}
                </Typography>
              </Stack>
            </Stack>

            {!isAiSummaryOpen && (
              <Button
                startIcon={<AutoAwesomeIcon />}
                variant="outlined"
                onClick={() => setIsAiSummaryOpen(true)}
                sx={{
                  color: "text.primary",
                  width: "auto",
                  p: 1.25,
                  border: "1px solid transparent",
                  borderRadius: 2,
                  background: `linear-gradient(${theme.palette.background.default}, ${theme.palette.background.default}) padding-box, linear-gradient(90deg, ${theme.palette.aiGradient.start}, ${theme.palette.aiGradient.end}) border-box`,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: 16,
                  lineHeight: 1,
                  justifyContent: "center",
                  transition: "box-shadow 0.15s linear",
                  "& .MuiButton-startIcon": { color: "text.primary" },
                  "&:hover": { boxShadow: `0 0 20px 0 ${theme.palette.primary.main}` },
                }}
              >
                Резюме от Искусственного Интеллекта
              </Button>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 7.8 }} sx={{ display: "flex" }}>
          <Stack spacing={2} sx={{ width: "100%", height: "100%" }}>
            <Stack direction="row" spacing={1.25} flexWrap="nowrap" sx={{ width: "100%" }}>
              {periods.map((period, index) => (
                <Chip
                  key={index}
                  label={period}
                  size="small"
                  sx={(muiTheme) => ({
                    flex: 1,
                    minWidth: "fit-content",
                    height: 12,
                    boxSizing: "content-box",
                    px: 1.5,
                    py: 1,
                    fontWeight: 700,
                    fontSize: 12,
                    lineHeight: 1,
                    "& .MuiChip-label": { width: "100%", textAlign: "center", whiteSpace: "nowrap" },
                    ...glassButtonSx(muiTheme),
                    ...(activePeriod === index ? glassButtonSxPressed(muiTheme) : {}),
                  })}
                  onClick={() => setActivePeriod(index)}
                />
              ))}
            </Stack>

            <Box sx={{ flex: 1, minHeight: { xs: 260, md: 0 }, "&, & *": { outline: "none" } }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 12, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <filter id="filter" x="-20%" y="-50%" width="140%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
                      <feOffset in="blur" dx="0" dy="-2" result="offsetBlur" />
                      <feFlood floodColor={theme.palette.primary.main} floodOpacity="1" result="color" />
                      <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
                      <feComposite in="SourceGraphic" in2="shadow" operator="over" />
                    </filter>
                    <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.2} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid vertical={false} stroke="rgba(120,130,190,0.55)" strokeDasharray="3.5 3.5" />

                            <XAxis
                      dataKey="index"
                      scale="band"
                      domain={['auto', 'auto']}
                      type="category"
                      tickFormatter={(index) => formatXAxis(chartData[index].timestamp)}
                      height={50}
                      interval={Math.ceil(chartData.length / 6)}
                      minTickGap={20}
                      angle={-30}
                      textAnchor="end"
                      tick={{ fill: theme.palette.text.secondary, fontSize: 10, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      padding={{ left: 10, right: 10 }}
                    />
                  <YAxis
                    orientation="right"
                    domain={yDomain}
                    width={64}
                    tickMargin={-2}
                    axisLine={false}
                    tickLine={false}
                    tick={<YTick />}
                  />

                  <Tooltip cursor={{ stroke: "none" }} isAnimationActive animationDuration={100} content={(props) => <ChartToolTip {...props} />} />

                  <Area type="linear" dataKey="value" stroke="none" fill={`url(#fill)`} tooltipType="none" activeDot={false} animationDuration={1000} />
                  <Area type="linear" dataKey="value" stroke={theme.palette.primary.main} style={{ filter: `url(#filter)` }} fill="transparent" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <Collapse in={isAiSummaryOpen} timeout={320}>
        <Paper sx={{ mt: 4, p: 2, border: "1px solid transparent", borderRadius: 2, background: `linear-gradient(${theme.palette.aiGradient.background}, ${theme.palette.aiGradient.background}) padding-box, linear-gradient(90deg, ${theme.palette.aiGradient.start}, ${theme.palette.aiGradient.end}) border-box`, boxShadow: `0 0 20px 0 ${theme.palette.primary.main}` }}>
          <Stack direction="row" spacing={1} alignItems="center">
      <AutoAwesomeIcon sx={{ height: 18 }} />
      <Typography sx={{ color: "text.primary", fontWeight: 500, fontSize: 16 }}>
        Резюме от Искусственного Интеллекта
      </Typography>
    </Stack>
    <Typography sx={{ color: "text.secondary", fontSize: 14, mt: 0.5, lineHeight: 1.4 }}>
      *Ответ сгенерирован ИИ на основе текущих данных и не является финансовой рекомендацией.
    </Typography>
    <Divider sx={{ borderColor: "rgba(90, 112, 255, 0.7)", my: 1.2 }} />

    {aiLoading ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
      <CircularProgress size={24} />
    </Box>
  ) : aiError ? (
    <Typography color="error" sx={{ py: 1 }}>Ошибка: {aiError}</Typography>
  ) : (
    <Box sx={{ color: "text.secondary", fontSize: 16, lineHeight: 1.6 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
          p: ({ children }) => <Typography sx={{ mb: 1.5 }}>{children}</Typography>,
        }}
      >
        {aiSummary || '*Нет данных*'}
      </ReactMarkdown>
    </Box>
  )}
  </Paper>
      </Collapse>
    </Paper>
  );
};