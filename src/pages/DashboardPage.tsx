import React, { useState, useEffect, useMemo } from 'react';
import { Box, Container, Grid, Stack } from "@mui/material";
import { HeadlineCard } from "../widgets/HeadlineCard.tsx";
import { MiniChartCard } from "../widgets/MiniChartCard.tsx";
import { CoinsTable } from "../widgets/CoinsTable.tsx";
import {coinRowsMock} from "../mock/coins.ts";
import type { CoinRowData } from '../shared/types.ts';
const BASE_URL = 'http://localhost:25565/api';  

/*Это надо заменить на топ 5 популярных на данный момент*/
//const names = ["BTC", "Ethereum", "Tether", "BNB", "Solana"];

export const DashboardPage: React.FC = () => {
  const [rows, setRows] = useState<CoinRowData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updateRows = (updates: CoinRowData[]) => {
      console.log('Updating rows with:', updates); 
      setRows(prevRows => {
        const rowMap = new Map(prevRows.map(row => [row.symbol, row]));
        updates.forEach(update => rowMap.set(update.symbol, { ...rowMap.get(update.symbol), ...update }));
        return Array.from(rowMap.values());
      });
    };

  useEffect(() => {
  const fetchInitialData = async () => {
  try {
    const response = await fetch(`api/coins/with_metrics`);
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

    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      console.log('Connecting to SSE...');  
      eventSource = new EventSource(`api/stream/data`); 

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

          console.log('Mapped SSE updates:', updates);  
          updateRows(updates);
        } catch (err) {
          console.error('SSE parse error:', err);
        }
      });

      eventSource.onerror = (err) => {
        console.error('SSE error:', err);
        eventSource?.close();
        console.log('Reconnecting SSE in 5 seconds...');  
        setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    return () => {
      console.log('Closing SSE connection');  
      eventSource?.close();
    };
  }, []);

  const top5 = useMemo(() => {
    return [...rows]
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 5);
  }, [rows]);

  if (error) {
    return <Box>Ошибка: {error}</Box>;
  }

  if (rows.length === 0) {
    return <Box>Загрузка...</Box>;
  }

  return (
    <Box sx={{ width: "100%", py: 3 }}>
      <Container maxWidth="lg" sx={{ boxSizing: "content-box" }}>
        <Grid container spacing={1.25} height={300}>
          <Grid size={{ xs: 8, md: 8 }} sx={{ display: "flex" }}>
            <HeadlineCard
              variant="primary"
              title="12 Лучших монет, которые стоит купить в феврале 2026"
              subtitle="Джон Нельсен | 21 час назад"
              imageUrl="/images/crypto-hero.jpg"
            />
          </Grid>

          <Grid size={{ xs: 4, md: 4 }} sx={{ display: "flex" }}>
            <Stack spacing={1.25} height="100%" sx={{ flex: 1 }}>
              <HeadlineCard
                variant="secondary"
                title="Криптовалюта в России"
                subtitle="Александр Иванов | 1 день назад"
                imageUrl="/images/crypto-russia.jpg"
              />

              <HeadlineCard
                variant="secondary"
                title="12 лучших монет, которые стоит купить в феврале 2026"
                subtitle="Георгий Вербицкий | 1 день назад"
                imageUrl="/images/crypto-2026.jpg"
              />
            </Stack>
          </Grid>
        </Grid>

        <Grid
          container
          spacing={2}
          sx={{ height: "156px", my: 2, overflow: "visible" }}
        >
          {top5.map((row) => (
            <Grid size={{ xs: 4, md: 2.4 }} key={row.symbol}>
              <MiniChartCard
                name={row.name}
                price={row.price}
                changePercent={row.percentHour}
                priceHistory={row.priceHistoryHour} // передаём историю
              />
            </Grid>
          ))}
        </Grid>

        <CoinsTable rows={rows} />  
      </Container>
    </Box>
  );
};
