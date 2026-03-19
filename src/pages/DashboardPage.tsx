import React, { startTransition, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Container, Grid, Skeleton, Stack } from "@mui/material";
import { HeadlineCard } from "../widgets/HeadlineCard.tsx";
import { MiniChartCard } from "../widgets/MiniChartCard.tsx";
import { CoinsTable } from "../widgets/CoinsTable.tsx";
import type { CoinRowData } from '../shared/types.ts';

type NewsArticle = {
  AUTHORS?: string;
  PUBLISHED_ON?: number;
  IMAGE_URL?: string;
  TITLE?: string;
};

type NewsData = {
  title: string;
  subtitle: string;
  imageUrl: string;
  url: string;
}

type PeriodMetricItem = {
  price: number;
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
}

type RowUpdate = Partial<CoinRowData> & Pick<CoinRowData, 'symbol'>;

const INITIAL_TABLE_ROWS = 10;
const INITIAL_HISTORY_ROWS = 5;
const HISTORY_BATCH_SIZE = 5;
const TABLE_SKELETON_ROWS = 5;

const timeAgo = (timestamp: number): string => {
  const now = Date.now() / 1000; // текущее время в секундах
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(diff / 3600);
  const days = Math.floor(diff / 86400);

  if (days > 0) return `${days} ${days === 1 ? 'день' : 'дня'} назад`;
  if (hours > 0) return `${hours} ${hours === 1 ? 'час' : 'часа'} назад`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? 'минуту' : 'минут'} назад`;
  return 'только что';
};

function isNewsArticle(item: unknown): item is NewsArticle {
  if (typeof item !== "object" || item === null) return false;

  const obj = item as Record<string, unknown>;

  return (
    (obj.AUTHORS === undefined || typeof obj.AUTHORS === "string") &&
    (obj.PUBLISHED_ON === undefined || typeof obj.PUBLISHED_ON === "number") &&
    (obj.IMAGE_URL === undefined || typeof obj.IMAGE_URL === "string") &&
    (obj.TITLE === undefined || typeof obj.TITLE === "string")
  );
}

type NewsSkeletonProps = {
  variant: 'primary' | 'secondary';
};

const NewsCardSkeleton: React.FC<NewsSkeletonProps> = ({ variant }) => {
  const isPrimary = variant === 'primary';

  return (
    <Box
      sx={{
        height: "100%",
        flex: 1,
        p: isPrimary ? 2.5 : 1.75,
        borderRadius: 5,
        bgcolor: "background.componentPrimary",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: isPrimary ? 1.25 : 0.5,
      }}
    >
      <Skeleton variant="text" width={isPrimary ? "75%" : "85%"} height={isPrimary ? 36 : 28} />
      <Skeleton variant="text" width={isPrimary ? "55%" : "65%"} height={isPrimary ? 24 : 20} />
    </Box>
  );
};

const MiniChartCardSkeleton: React.FC = () => (
  <Box
    sx={{
      height: "100%",
      minHeight: 156,
      p: 1.5,
      borderRadius: 5,
      bgcolor: "background.componentPrimary",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <Box>
      <Skeleton variant="text" width="70%" height={22} />
      <Skeleton variant="text" width="45%" height={18} />
    </Box>
    <Skeleton variant="rounded" width="100%" height={72} />
  </Box>
);

export const DashboardPage: React.FC = () => {
  const [rows, setRows] = useState<CoinRowData[]>([]);
  const [coinsLoading, setCoinsLoading] = useState<boolean>(true);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [loadedHistorySymbols, setLoadedHistorySymbols] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [news, setNews] = useState<NewsData[]>([]);
  const [newsLoading, setNewsLoading] = useState<boolean>(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Функция загрузки новостей (аналогично примеру)
  const fetchNews = async () => {
    try {
      setNewsError(null);
      setNewsLoading(true);
      const response = await fetch('/news-api?lang=EN&limit=3');
      if (!response.ok) throw new Error(`Ошибка загрузки новостей: ${response.status}`);
      const data: unknown = await response.json();
      const articles =
        typeof data === "object" &&
        data !== null &&
        "Data" in data &&
        Array.isArray(data.Data)
          ? data.Data
          : [];

      const mappedNews: NewsData[] = articles
        .filter(isNewsArticle)
        .map((item) => {
          const author = item.AUTHORS || 'Криптоновости';
          const published = item.PUBLISHED_ON ? timeAgo(item.PUBLISHED_ON) : '';
          const subtitle = published ? `${author} | ${published}` : author;

          let imageUrl = item.IMAGE_URL;
          if (imageUrl?.startsWith('//')) {
            imageUrl = `https:${imageUrl}`;
          }

        return {
          title: item.TITLE || 'Без заголовка',
          subtitle,
          imageUrl: imageUrl || '/images/news-placeholder.jpg',
          url: item.URL,
        };
      });

      setNews(mappedNews);
    } catch (err) {
      setNewsError((err as Error).message);
      console.error('News fetch error:', err);
    } finally {
      setNewsLoading(false);
    }
  };

  const updateRows = (updates: RowUpdate[]) => {
    setRows((prevRows) => {
      const rowMap = new Map(prevRows.map((row) => [row.symbol, row]));
      updates.forEach((update) => rowMap.set(update.symbol, { ...rowMap.get(update.symbol), ...update }));
      return Array.from(rowMap.values());
    });
  };

  useEffect(() => {
    let isCancelled = false;
    let eventSource: EventSource | null = null;
    let deferredHistoryTimer: number | undefined;

    const fetchCoinHistory = async (symbol: string) => {
      try {
        const [dayRes, hourRes] = await Promise.all([
          fetch(`/api/metrics/${symbol}?period=DAY`),
          fetch(`/api/metrics/${symbol}?period=HOUR`),
        ]);

        const [dayData, hourData]: [PeriodMetricItem[], PeriodMetricItem[]] = await Promise.all([
          dayRes.ok ? dayRes.json() : Promise.resolve([]),
          hourRes.ok ? hourRes.json() : Promise.resolve([]),
        ]);

        return {
          symbol,
          historyDay: dayData.map((item) => item.price).filter((price) => !Number.isNaN(price)),
          historyHour: hourData.map((item) => item.price).filter((price) => !Number.isNaN(price)),
        };
      } catch (err) {
        console.error(`Не удалось загрузить историю для ${symbol}`, err);
        return {
          symbol,
          historyDay: [],
          historyHour: [],
        };
      }
    };

    const mergeHistories = (
      histories: Array<{ symbol: string; historyDay: number[]; historyHour: number[] }>
    ) => {
      const historyMap = new Map(histories.map((item) => [item.symbol, item]));

      startTransition(() => {
        setLoadedHistorySymbols((prev) => {
          const next = new Set(prev);
          histories.forEach((history) => next.add(history.symbol));
          return next;
        });

        setRows((prevRows) =>
          prevRows.map((row) => {
            const history = historyMap.get(row.symbol);

            return history
              ? {
                  ...row,
                  priceHistoryDay: history.historyDay,
                  priceHistoryHour: history.historyHour,
                }
              : row;
          })
        );
      });
    };

    const loadHistoryBatches = async (coins: CoinMetricItem[]) => {
      for (let index = 0; index < coins.length; index += HISTORY_BATCH_SIZE) {
        if (isCancelled) {
          return;
        }

        const batch = coins.slice(index, index + HISTORY_BATCH_SIZE);
        await Promise.all(
          batch.map(async (coin) => {
            const history = await fetchCoinHistory(coin.symbol);

            if (isCancelled) {
              return;
            }

            mergeHistories([history]);
          })
        );
      }
    };

    const loadHistories = async (coins: CoinMetricItem[]) => {
      if (coins.length === 0) {
        return;
      }

      setHistoryLoading(true);

      const prioritizedCoins = coins.slice(0, INITIAL_HISTORY_ROWS);
      const deferredCoins = coins.slice(INITIAL_HISTORY_ROWS);

      await loadHistoryBatches(prioritizedCoins);

      if (isCancelled) {
        return;
      }

      if (deferredCoins.length === 0) {
        setHistoryLoading(false);
        return;
      }

      deferredHistoryTimer = window.setTimeout(async () => {
        await loadHistoryBatches(deferredCoins);

        if (!isCancelled) {
          setHistoryLoading(false);
        }
      }, 0);
    };

    const fetchInitialData = async () => {
      try {
        setError(null);
        setCoinsLoading(true);
        setLoadedHistorySymbols(new Set());
        const response = await fetch(`/api/coins/with_metrics`);
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        const apiData: CoinMetricItem[] = await response.json();

        const mappedData: CoinRowData[] = apiData.map((item) => ({
          name: item.name || 'Unknown',
          symbol: item.symbol || 'UNK',
          price: Number(item.price ?? 0),
          hourChange: Number(item.hourChange ?? 0),
          dayChange: Number(item.dayChange ?? 0),
          weekChange: Number(item.weekChange ?? 0),
          volume24h: Number(item.volume24h ?? 0),
          marketCap: Number(item.marketCap ?? 0),
          priceHistoryDay: [],
          priceHistoryHour: [],
        }));

        if (isCancelled) {
          return;
        }

        startTransition(() => {
          setRows(mappedData);
          setCoinsLoading(false);
        });

        void loadHistories(apiData);
      } catch (err) {
        console.error('Fetch error:', err);
        if (!isCancelled) {
          setError((err as Error).message);
          setRows([]);
          setCoinsLoading(false);
          setHistoryLoading(false);
        }
      }
    };

    const connectSSE = () => {
      console.log('Connecting to SSE...');
      eventSource = new EventSource(`/api/stream/data`);

      eventSource.onopen = () => {
        console.log('SSE connection opened');
      };

      eventSource.addEventListener('data_update', (event) => {
        try {
          const rawUpdates = JSON.parse(event.data);
          const updates: RowUpdate[] = rawUpdates.map((item: CoinRowData) => ({
            name: item.name || 'Unknown',
            symbol: item.symbol || 'UNK',
            price: Number(item.price ?? 0),
            hourChange: Number(item.hourChange ?? 0),
            dayChange: Number(item.dayChange ?? 0),
            weekChange: Number(item.weekChange ?? 0),
            volume24h: Number(item.volume24h ?? 0),
            marketCap: Number(item.marketCap ?? 0),
          }));
          updateRows(updates);
        } catch (err) {
          console.error('SSE parse error:', err);
        }
      });

      eventSource.onerror = (err) => {
        console.error('SSE error:', err);
        eventSource?.close();
        setTimeout(connectSSE, 5000);
      };
    };

    void fetchInitialData();
    void fetchNews();
    connectSSE();

    return () => {
      isCancelled = true;
      if (deferredHistoryTimer !== undefined) {
        window.clearTimeout(deferredHistoryTimer);
      }
      eventSource?.close();
    };
  }, []);

  const top5 = useMemo(() => {
    return [...rows]
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 5);
  }, [rows]);

  const visibleRows = useMemo(() => {
    if (rows.length <= INITIAL_TABLE_ROWS) {
      return rows;
    }

    const revealedRowsCount = Math.min(
      rows.length,
      Math.max(INITIAL_TABLE_ROWS, loadedHistorySymbols.size + (INITIAL_TABLE_ROWS - INITIAL_HISTORY_ROWS))
    );

    return rows.slice(0, revealedRowsCount);
  }, [loadedHistorySymbols, rows]);

  const hiddenRowsCount = Math.max(rows.length - visibleRows.length, 0);

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>Ошибка: {error}</Alert>;
  }

  return (
    <Box sx={{ width: "100%", py: 3 }}>
      <Container maxWidth="lg" sx={{ boxSizing: "content-box" }}>
        <Grid container spacing={1.25} height={300}>
          <Grid size={{ xs: 8, md: 8 }} sx={{ display: "flex" }}>
            {newsLoading ? (
              <NewsCardSkeleton variant="primary" />
            ) : newsError || news.length === 0 ? (
              <HeadlineCard
                variant="primary"
                title="Новости временно недоступны"
                subtitle="Попробуйте позже"
                imageUrl="/images/placeholder.jpg"
                href={news[0]?.url}
              />
            ) : (
              <HeadlineCard
                variant="primary"
                title={news[0]?.title || 'Без заголовка'}
                subtitle={news[0]?.subtitle || ''}
                imageUrl={news[0]?.imageUrl || '/images/placeholder.jpg'}
                href={news[0]?.url}
              />
            )}
          </Grid>

          <Grid size={{ xs: 4, md: 4 }} sx={{ display: "flex" }}>
            <Stack spacing={1.25} height="100%" sx={{ flex: 1 }}>
              {newsLoading ? (
                <>
                  <NewsCardSkeleton variant="secondary" />
                  <NewsCardSkeleton variant="secondary" />
                </>
              ) : newsError || news.length < 2 ? (
                <>
                  <HeadlineCard
                    variant="secondary"
                    title="Следите за обновлениями"
                    subtitle="Скоро появятся новости"
                    imageUrl="/images/placeholder.jpg"
                    href={news[1]?.url}
                  />
                  <HeadlineCard
                    variant="secondary"
                    title="Крипто-дайджест"
                    subtitle="Оставайтесь с нами"
                    imageUrl="/images/placeholder.jpg"
                    href={news[2]?.url}
                  />
                </>
              ) : (
                <>
                  <HeadlineCard
                    variant="secondary"
                    title={news[1]?.title || 'Без заголовка'}
                    subtitle={news[1]?.subtitle || ''}
                    imageUrl={news[1]?.imageUrl || '/images/placeholder.jpg'}
                    href={news[1]?.url}
                  />
                  <HeadlineCard
                    variant="secondary"
                    title={news[2]?.title || 'Без заголовка'}
                    subtitle={news[2]?.subtitle || ''}
                    imageUrl={news[2]?.imageUrl || '/images/placeholder.jpg'}
                    href={news[2]?.url}
                  />
                </>
              )}
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ height: "156px", my: 2, overflow: "visible" }}>
          {coinsLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <Grid size={{ xs: 4, md: 2.4 }} key={`mini-chart-skeleton-${index}`}>
                  <MiniChartCardSkeleton />
                </Grid>
              ))
            : top5.map((row) => (
                <Grid size={{ xs: 4, md: 2.4 }} key={row.symbol}>
                  <MiniChartCard
                    symbol={row.symbol}
                    name={row.name}
                    price={row.price}
                    changePercent={row.hourChange}
                    priceHistory={row.priceHistoryHour}
                    chartLoading={!loadedHistorySymbols.has(row.symbol)}
                  />
                </Grid>
              ))}
        </Grid>

        <CoinsTable
          rows={visibleRows}
          skeletonRows={coinsLoading ? INITIAL_TABLE_ROWS : Math.min(hiddenRowsCount, TABLE_SKELETON_ROWS)}
        />
      </Container>
    </Box>
  );
};
