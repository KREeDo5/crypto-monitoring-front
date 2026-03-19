import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Container, Paper, Skeleton, Stack } from "@mui/material";
import { CoinMarketOverviewSection } from "./components/CoinMarketOverviewSection.tsx";
import { CoinAboutSection } from "./components/CoinAboutSection.tsx";
import { CoinCardsSection } from "./components/CoinCardsSection.tsx";
import type { NewsCard } from "./data.ts";

type NewsArticle = {
  BODY?: string;
  SUBTITLE?: string;
  AUTHORS?: string;
  PUBLISHED_ON?: number;
  IMAGE_URL?: string;
  TITLE?: string;
  URL?: string;
};

function isNewsArticle(item: unknown): item is NewsArticle {
  if (typeof item !== "object" || item === null) return false;

  const obj = item as Record<string, unknown>;

  return (
    (obj.AUTHORS === undefined || typeof obj.AUTHORS === "string") &&
    (obj.PUBLISHED_ON === undefined || typeof obj.PUBLISHED_ON === "number") &&
    (obj.IMAGE_URL === undefined || typeof obj.IMAGE_URL === "string") &&
    (obj.TITLE === undefined || typeof obj.TITLE === "string") &&
    (obj.URL === undefined || typeof obj.URL === "string")
  );
}

export const CoinDetailsPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [news, setNews] = useState<NewsCard[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [errorNews, setErrorNews] = useState<string | null>(null);

  const [about, setAbout] = useState<string>('');
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutError, setAboutError] = useState<string | null>(null);

  const initialPageLoading = loadingNews || aboutLoading;

  useEffect(() => {
    if (!symbol) return;

    const fetchNews = async () => {
      try {
        setErrorNews(null);
        setLoadingNews(true);
        const response = await fetch(`/news-api?lang=EN&limit=5&categories=${symbol.toUpperCase()}`);
        if (!response.ok) throw new Error(`Ошибка загрузки новостей: ${response.status}`);
        const data: unknown = await response.json();
        const articles =
          typeof data === "object" &&
          data !== null &&
          "Data" in data &&
          Array.isArray(data.Data)
            ? data.Data
            : [];

        const mappedNews: NewsCard[] = articles
          .filter(isNewsArticle)
          .map((item) => ({
            title: item.TITLE || 'Без заголовка',
            url: item.URL || '#',
            description: item.SUBTITLE || item.BODY || '',
            image: item.IMAGE_URL || '/images/placeholder.jpg',
            date: item.PUBLISHED_ON ? new Date(item.PUBLISHED_ON * 1000).toLocaleString() : '',
            author: item.AUTHORS || 'Unknown',
          }));

        setNews(mappedNews);
      } catch (err) {
        setErrorNews((err as Error).message);
        console.error('News fetch error:', err);
      } finally {
        setLoadingNews(false);
      }
    };

    void fetchNews();
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

    void fetchAbout();
  }, [symbol]);

  return (
    <Box sx={{ width: "100%", py: 3 }}>
      <Container maxWidth="lg">
        <Stack spacing={2.5}>
          <CoinMarketOverviewSection />

          {initialPageLoading ? (
            <>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 5, bgcolor: "background.componentPrimary" }}>
                <Skeleton variant="text" width="28%" height={32} />
                <Skeleton variant="text" width="100%" height={22} />
                <Skeleton variant="text" width="97%" height={22} />
                <Skeleton variant="text" width="95%" height={22} />
                <Skeleton variant="text" width="91%" height={22} />
                <Skeleton variant="text" width="20%" height={28} sx={{ mt: 1 }} />
              </Paper>

              <Paper elevation={0} sx={{ p: 2, borderRadius: 5, bgcolor: "background.componentPrimary" }}>
                <Skeleton variant="text" width="34%" height={32} sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", gap: 2, overflow: "hidden" }}>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Box key={`news-skeleton-${index}`} sx={{ width: { xs: 220, md: 260 }, flex: "0 0 auto" }}>
                      <Skeleton variant="rounded" height={125} />
                      <Skeleton variant="text" width="100%" height={26} sx={{ mt: 1.5 }} />
                      <Skeleton variant="text" width="92%" height={22} />
                      <Skeleton variant="text" width="84%" height={22} />
                      <Skeleton variant="text" width="45%" height={18} sx={{ mt: 1 }} />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </>
          ) : aboutError ? (
            <Alert severity="error">Ошибка загрузки описания</Alert>
          ) : errorNews ? (
            <Alert severity="error">{errorNews}</Alert>
          ) : (
            <>
              <CoinAboutSection html={about} previewLines={7} />
              <CoinCardsSection title={`${symbol?.toUpperCase()} - последние новости`} variant="news" cards={news} />
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
};
