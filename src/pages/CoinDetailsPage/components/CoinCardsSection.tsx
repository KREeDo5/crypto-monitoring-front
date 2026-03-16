import { Box, Paper, Typography } from "@mui/material";
import { CoinCardItem } from "./CoinCardItem.tsx";
import type { GuideCard, NewsCard } from "../data.ts";

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
      image: item.IMAGE_URL ? `https:${item.IMAGE_URL}` : undefined, // иногда URL без протокола
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

type CoinCardsSectionProps =
  | {
      title: string;
      variant: "guide";
      cards: GuideCard[];
    }
  | {
      title: string;
      variant: "news";
      cards: NewsCard[];
    };

export const CoinCardsSection: React.FC<CoinCardsSectionProps> = ({ title, variant, cards }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 5,
        bgcolor: "background.componentPrimary",
      }}
    >
      <Typography sx={{ color: "text.primary", fontSize: 18, fontWeight: 700, mb: 2 }}>{title}</Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "nowrap",
          gap: 2,
          justifyContent: "space-between",
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {variant === "guide" &&
          cards.map((card, index) => <CoinCardItem key={`${card.title}-${index}`} variant="guide" card={card} />)}
        {variant === "news" &&
          cards.map((card, index) => <CoinCardItem key={`${card.title}-${index}`} variant="news" card={card} />)}
      </Box>
    </Paper>
  );
};
