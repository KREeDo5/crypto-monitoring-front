import { Box, Paper, Typography } from "@mui/material";
import { CoinCardItem } from "./CoinCardItem.tsx";
import type { GuideCard, NewsCard } from "../data.ts";

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
