import { Box, Container, Grid, Stack } from "@mui/material";
import { HeadlineCard } from "../widgets/HeadlineCard.tsx";
import { MiniChartCard } from "../widgets/MiniChartCard.tsx";
import { CoinsTable } from "../widgets/CoinsTable.tsx";
import {coinRowsMock} from "../mock/coins.ts";

/*Это надо заменить на топ 5 популярных на данный момент*/
const names = ["BTC", "Ethereum", "Tether", "BNB", "Solana"];

export const DashboardPage: React.FC = () => {
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
          {names.map((name, index) => (
            <Grid size={{ xs: 4, md: 2.4 }} key={name}>
              <MiniChartCard
                name={name}
                price={68708.14}
                changePercent={0.22 * Math.pow(-1, index)}
              />
            </Grid>
          ))}
        </Grid>

        <CoinsTable rows={coinRowsMock} />
      </Container>
    </Box>
  );
};
