import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, CircularProgress, Container, Stack } from "@mui/material";
import { CoinMarketOverviewSection } from "./components/CoinMarketOverviewSection.tsx";
import { CoinAboutSection } from "./components/CoinAboutSection.tsx";
import { CoinCardsSection } from "./components/CoinCardsSection.tsx";
import { aboutHtml, guideCards } from "./data.ts";

export const CoinDetailsPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [errorNews, setErrorNews] = useState<string | null>(null);

  const [about, setAbout] = useState<string>('');
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutError, setAboutError] = useState<string | null>(null);

  useEffect(() => {

    if (!symbol) return;

    const fetchNews = async () => {
      try {
        setLoadingNews(true);
        const response = await fetch(`/news-api?lang=EN&limit=5&categories=${symbol.toUpperCase()}`);
        if (!response.ok) throw new Error(`Ошибка загрузки новостей: ${response.status}`);
        const data = await response.json();
        const articles = data.Data || [];
        const mappedNews = articles.map((item: any) => ({
          title: item.TITLE,
          url: item.URL,
          description: item.SUBTITLE || item.BODY || '',
          image: item.IMAGE_URL || '',
          publishedAt: item.PUBLISHED_ON ? new Date(item.PUBLISHED_ON * 1000).toLocaleString() : undefined,
          author: item.AUTHORS,
        }));
        setNews(mappedNews);
      } catch (err) {
        setErrorNews((err as Error).message);
        console.error('News fetch error:', err);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();
  }, [symbol]);

  useEffect(() => {
    if (!symbol) return;

    const fetchAbout = async () => {
      setAboutLoading(true);
      setAboutError(null);
      try {
        const res = await fetch(`/api/coins/info/${symbol.toUpperCase()}`);
        if (!res.ok) throw new Error('Ошибка загрузки описания');
        const data = await res.json();
        setAbout(data.description || '');
      } catch (err) {
        setAboutError((err as Error).message);
      } finally {
        setAboutLoading(false);
      }
    };

    fetchAbout();
  }, [symbol]);

  return (
    <Box sx={{ width: "100%", py: 3 }}>
      <Container maxWidth="lg">
        <Stack spacing={2.5}>
          <CoinMarketOverviewSection />

          {/* Блок описания */}
          {aboutLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : aboutError ? (
            <Alert severity="error">Ошибка загрузки описания</Alert>
          ) : (
            <CoinAboutSection html={about} previewLines={7} />
          )}

          {/* Блок новостей */}
          {loadingNews ? (
            <CircularProgress />
          ) : errorNews ? (
            <Alert severity="error">{errorNews}</Alert>
          ) : (
            <CoinCardsSection title={`${symbol?.toUpperCase()} - последние новости`} variant="news" cards={news} />
          )}
        </Stack>
      </Container>
    </Box>
  );
};