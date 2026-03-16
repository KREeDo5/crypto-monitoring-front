import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Stack, CircularProgress, Alert } from "@mui/material";
import { CoinMarketOverviewSection } from "./components/CoinMarketOverviewSection.tsx";
import { CoinAboutSection } from "./components/CoinAboutSection.tsx";
import { CoinCardsSection } from "./components/CoinCardsSection.tsx";
import { aboutHtml, guideCards } from "./data.ts";

export const CoinDetailsPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [errorNews, setErrorNews] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoadingNews(true);
        const response = await fetch('/news-api?lang=EN&limit=5');
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
  }, []);

  return (
    <Box sx={{ width: "100%", py: 3 }}>
      <Container maxWidth="lg" sx={{ boxSizing: "content-box" }}>
        <Stack spacing={2.5}>
          <CoinMarketOverviewSection />
          <CoinAboutSection html={aboutHtml} previewLines={7} />
          <CoinCardsSection title="Биткоин - руководства" variant="guide" cards={guideCards} />
          
          {/* Блок с новостями */}
          {loadingNews ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1}}>
              <CircularProgress />
            </Box>
          ) : errorNews ? (
            <Alert severity="error" sx={{ my: 2 }}>{errorNews}</Alert>
          ) : (
            <CoinCardsSection 
              title={`${symbol?.toUpperCase()} - последние новости`} 
              variant="news" 
              cards={news} 
            />
          )}
        </Stack>
      </Container>
    </Box>
  );
};
