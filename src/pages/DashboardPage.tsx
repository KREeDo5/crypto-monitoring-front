import React, { useState, useEffect, useMemo } from 'react';
import { Box, Container, Grid, Stack } from "@mui/material";
import { HeadlineCard } from "../widgets/HeadlineCard.tsx";
import { MiniChartCard } from "../widgets/MiniChartCard.tsx";
import { CoinsTable } from "../widgets/CoinsTable.tsx";
import {coinRowsMock} from "../mock/coins.ts";
import type { CoinRowData } from '../shared/types.ts';
const BASE_URL = 'http://wesleygibson.ddns.net:25565/api';  

/*Это надо заменить на топ 5 популярных на данный момент*/
//const names = ["BTC", "Ethereum", "Tether", "BNB", "Solana"];

export const DashboardPage: React.FC = () => {
  const [rows, setRows] = useState<CoinRowData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updateRows = (updates: CoinRowData[]) => {
    setRows(prevRows => {
      const rowMap = new Map(prevRows.map(row => [row.symbol, row]));
      updates.forEach(update => rowMap.set(update.symbol, { ...rowMap.get(update.symbol), ...update }));
      return Array.from(rowMap.values());
    });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/coins/with_metrics`);
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        const apiData = await response.json();
        console.log('Raw API data:', apiData);  
        const mappedData: CoinRowData[] = apiData.map((item: any) => ({
          name: item.name || 'Unknown',
          symbol: item.symbol || 'UNK',
          price: item.price,
          percentHour: item.hourChange,
          percentDay: item.dayChange,
          percentWeek: item.weekChange,
          volumeDay: item.volume24h,
          marketCap: item.marketCap,
          sparkline: undefined, 
        }));
        setRows(mappedData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError((err as Error).message);
      }
    };

    fetchInitialData();

    const eventSource = new EventSource(`${BASE_URL}/stream/data`);
    eventSource.onmessage = (event) => {
      try {
        const rawUpdates = JSON.parse(event.data);
        console.log('Raw SSE updates:', rawUpdates);  // Дебаг
        const updates = rawUpdates.map((item: any) => ({
          name: item.name || 'Unknown',
          symbol: item.symbol || 'UNK',
          price: item.price,
          percentHour: item.hourChange,
          percentDay: item.dayChange,
          percentWeek: item.weekChange,
          volumeDay: item.volume24h,
          marketCap: item.marketCap,
        }));
        updateRows(updates);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };
    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
    };

    return () => eventSource.close();
  }, []);

  const top5 = useMemo(() => {
    return [...rows]
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 5);
  }, [rows]);

  if (error) {
    return <Box>Ошибка: {error}</Box>;
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
          {top5.map((row, index) => (
            <Grid size={{ xs: 4, md: 2.4 }} key={row.symbol}>
              <MiniChartCard
                name={row.name} 
                price={row.price}  
                changePercent={row.hourChange}  
              />
            </Grid>
          ))}
        </Grid>

        <CoinsTable rows={rows} />  
      </Container>
    </Box>
  );
};
