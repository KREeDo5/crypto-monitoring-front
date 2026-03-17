import React, { useState, useEffect, useMemo } from 'react';
import { Box, Container, Grid, Stack, CircularProgress, Alert } from "@mui/material";
import { HeadlineCard } from "../widgets/HeadlineCard.tsx";
import { MiniChartCard } from "../widgets/MiniChartCard.tsx";
import { CoinsTable } from "../widgets/CoinsTable.tsx";
import type { CoinRowData } from '../shared/types.ts';

const BASE_URL = 'http://localhost:25565/api';

// Вспомогательная функция для форматирования относительного времени
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

export const DashboardPage: React.FC = () => {
  const [rows, setRows] = useState<CoinRowData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Состояния для новостей
  const [news, setNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState<boolean>(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Функция загрузки новостей (аналогично примеру)
  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      const response = await fetch('/news-api?lang=EN&limit=3');
      if (!response.ok) throw new Error(`Ошибка загрузки новостей: ${response.status}`);
      const data = await response.json();
      const articles = data.Data || [];

      const mappedNews = articles.map((item: any) => {
        // Формируем subtitle: автор + относительное время
        const author = item.AUTHORS || 'Криптоновости';
        const published = item.PUBLISHED_ON ? timeAgo(item.PUBLISHED_ON) : '';
        const subtitle = published ? `${author} | ${published}` : author;

        // Обрабатываем изображение: иногда приходит с протоколом // или без
        let imageUrl = item.IMAGE_URL;
        if (imageUrl && imageUrl.startsWith('//')) {
          imageUrl = `https:${imageUrl}`;
        }

        return {
          title: item.TITLE || 'Без заголовка',
          subtitle,
          imageUrl: imageUrl || '/images/news-placeholder.jpg', // заглушка
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

  // Загрузка монет и истории (существующий код)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`/api/coins/with_metrics`);
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        const apiData = await response.json();

        const historyPromises = apiData.map(async (coin: any) => {
          try {
            const dayRes = await fetch(`/api/metrics/${coin.symbol}?period=DAY`);
            const dayData = await dayRes.json();
            const dayPrices = Array.isArray(dayData)
              ? dayData.map(item => Number(item.price)).filter(p => !isNaN(p))
              : [];

            const hourRes = await fetch(`/api/metrics/${coin.symbol}?period=HOUR`);
            const hourData = await hourRes.json();
            const hourPrices = Array.isArray(hourData)
              ? hourData.map(item => Number(item.price)).filter(p => !isNaN(p))
              : [];

            return {
              symbol: coin.symbol,
              historyDay: dayPrices,
              historyHour: hourPrices,
            };
          } catch (err) {
            console.error(`Не удалось загрузить историю для ${coin.symbol}`, err);
            return {
              symbol: coin.symbol,
              historyDay: [],
              historyHour: [],
            };
          }
        });

        const histories = await Promise.all(historyPromises);
        const dayMap = new Map(histories.map(h => [h.symbol, h.historyDay]));
        const hourMap = new Map(histories.map(h => [h.symbol, h.historyHour]));

        const mappedData: CoinRowData[] = apiData.map((item: any) => ({
          name: item.name || 'Unknown',
          symbol: item.symbol || 'UNK',
          price: Number(item.price ?? 0),
          percentHour: Number(item.hourChange ?? 0),
          percentDay: Number(item.dayChange ?? 0),
          percentWeek: Number(item.weekChange ?? 0),
          volumeDay: Number(item.volume24h ?? 0),
          marketCap: Number(item.marketCap ?? 0),
          priceHistoryDay: dayMap.get(item.symbol) || [],
          priceHistoryHour: hourMap.get(item.symbol) || [],
        }));

        setRows(mappedData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError((err as Error).message);
      }
    };

    fetchInitialData();
    fetchNews(); // Загружаем новости

    // SSE подключение (без изменений)
    let eventSource: EventSource | null = null;
    const connectSSE = () => {
      console.log('Connecting to SSE...');
      eventSource = new EventSource(`/api/stream/data`);

      eventSource.onopen = () => {
        console.log('SSE connection opened');
      };

      eventSource.addEventListener('data_update', (event) => {
        try {
          const rawUpdates = JSON.parse(event.data);
          const updates = rawUpdates.map((item: any) => ({
            name: item.name || 'Unknown',
            symbol: item.symbol || 'UNK',
            price: Number(item.price ?? 0),
            percentHour: Number(item.hourChange ?? 0),
            percentDay: Number(item.dayChange ?? 0),
            percentWeek: Number(item.weekChange ?? 0),
            volumeDay: Number(item.volume24h ?? 0),
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

    connectSSE();

    return () => {
      console.log('Closing SSE connection');
      eventSource?.close();
    };
  }, []);

  const updateRows = (updates: CoinRowData[]) => {
    console.log('Updating rows with:', updates);
    setRows(prevRows => {
      const rowMap = new Map(prevRows.map(row => [row.symbol, row]));
      updates.forEach(update => rowMap.set(update.symbol, { ...rowMap.get(update.symbol), ...update }));
      return Array.from(rowMap.values());
    });
  };

  const top5 = useMemo(() => {
    return [...rows]
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 5);
  }, [rows]);

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>Ошибка: {error}</Alert>;
  }

  if (rows.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }


  return (
    <Box sx={{ width: "100%", py: 3 }}>
      <Container maxWidth="lg" sx={{ boxSizing: "content-box" }}>
        <Grid container spacing={1.25} height={300}>
          <Grid size={{ xs: 8, md: 8 }} sx={{ display: "flex" }}>
            {newsLoading || newsError || news.length > 0 ? (
              newsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : newsError || news.length === 0 ? (
                <HeadlineCard
                  variant="primary"
                  title="Новости временно недоступны"
                  subtitle="Попробуйте позже"
                  imageUrl="/images/placeholder.jpg"
                />
              ) : (
                <HeadlineCard
                  variant="primary"
                  title={news[0]?.title || 'Без заголовка'}
                  subtitle={news[0]?.subtitle || ''}
                  imageUrl={news[0]?.imageUrl || '/images/placeholder.jpg'}
                />
              )
            ) : null}
          </Grid>

          <Grid size={{ xs: 4, md: 4 }} sx={{ display: "flex" }}>
            <Stack spacing={1.25} height="100%" sx={{ flex: 1 }}>
              {newsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress size={30} />
                </Box>
              ) : newsError || news.length < 2 ? (
                <>
                  <HeadlineCard
                    variant="secondary"
                    title="Следите за обновлениями"
                    subtitle="Скоро появятся новости"
                    imageUrl="/images/placeholder.jpg"
                  />
                  <HeadlineCard
                    variant="secondary"
                    title="Крипто-дайджест"
                    subtitle="Оставайтесь с нами"
                    imageUrl="/images/placeholder.jpg"
                  />
                </>
              ) : (
                <>
                  <HeadlineCard
                    variant="secondary"
                    title={news[1]?.title || 'Без заголовка'}
                    subtitle={news[1]?.subtitle || ''}
                    imageUrl={news[1]?.imageUrl || '/images/placeholder.jpg'}
                  />
                  <HeadlineCard
                    variant="secondary"
                    title={news[2]?.title || 'Без заголовка'}
                    subtitle={news[2]?.subtitle || ''}
                    imageUrl={news[2]?.imageUrl || '/images/placeholder.jpg'}
                  />
                </>
              )}
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ height: "156px", my: 2, overflow: "visible" }}>
          {top5.map((row) => (
            <Grid size={{ xs: 4, md: 2.4 }} key={row.symbol}>
              <MiniChartCard
              symbol={row.symbol}
                name={row.name}
                price={row.price}
                changePercent={row.percentHour}
                priceHistory={row.priceHistoryHour}
              />
            </Grid>
          ))}
        </Grid>

        <CoinsTable rows={rows} />
      </Container>
    </Box>
  );
};