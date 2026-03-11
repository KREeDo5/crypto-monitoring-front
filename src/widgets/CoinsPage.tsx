import React, { useState, useEffect } from 'react';
import { CoinsTable } from './CoinsTable'; 
import { Box } from '@mui/material'; 
import type {CoinRowData} from "../shared/types.ts";

const BASE_URL = 'http://wesleygibson.ddns.net:25565/api'; 

const CoinsPage: React.FC = () => {
  const [rows, setRows] = useState<CoinRowData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updateRows = (updates: CoinRowData[]) => {
    setRows(prevRows => {
      const rowMap = new Map(prevRows.map(row => [row.symbol, row]));
      updates.forEach(update => {
        rowMap.set(update.symbol, update);
      });
      return Array.from(rowMap.values());
    });
  };

  useEffect(() => {

    const fetchInitialData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/coins/with_metrics`);
        if (!response.ok) {
          throw new Error('Ошибка загрузки данных');
        }
        const data: CoinRowData[] = await response.json();
        setRows(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchInitialData();

    const eventSource = new EventSource(`${BASE_URL}/stream/data`);

    eventSource.onmessage = (event) => {
      try {
        const updates: CoinRowData[] = JSON.parse(event.data);
        updateRows(updates);
      } catch (err) {
        console.error('Ошибка парсинга SSE:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('Ошибка SSE:', err);
      setError('Ошибка соединения с сервером. Попробуем переподключиться...');
      eventSource.close();
      setTimeout(() => {
      }, 5000); 
    };

    return () => {
      eventSource.close();
    };
  }, []); 

  if (error) {
    return <Box>Ошибка: {error}</Box>;
  }

  return <CoinsTable rows={rows} />;
};

export default CoinsPage;