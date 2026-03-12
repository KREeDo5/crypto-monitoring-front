import { Box, Container, Stack } from "@mui/material";
import { CoinAboutSection } from "./components/CoinAboutSection.tsx";
import { CoinCardsSection } from "./components/CoinCardsSection.tsx";
import { CoinMarketOverviewSection } from "./components/CoinMarketOverviewSection.tsx";
import { aboutHtml, guideCards, newsCards } from "./data.ts";
import { useParams } from 'react-router-dom';

export const CoinDetailsPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  return (
    <Box sx={{ width: "100%", py: 3 }}>
      <Container maxWidth="lg" sx={{ boxSizing: "content-box" }}>
        <Stack spacing={2.5}>
          <CoinMarketOverviewSection />
          <CoinAboutSection html={aboutHtml} previewLines={7} />
          <CoinCardsSection title="Биткоин - руководства" variant="guide" cards={guideCards} />
          <CoinCardsSection title="Биткоин - последние новости" variant="news" cards={newsCards} />
        </Stack>
      </Container>
    </Box>
  );
};
