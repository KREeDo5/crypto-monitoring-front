import { Avatar, Box, Typography } from "@mui/material";
import { ChangeBadge } from "../shared/components/ChangeBadge.tsx";
import type { CoinRowData } from "../shared/types.ts";
import { theme } from "../theme.ts";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type CoinRowProps = {
  row: CoinRowData;
};

const moneyTextSx = {
  fontSize: "0.75rem",
  fontWeight: 500,
  lineHeight: 1.4,
  letterSpacing: 0,
  textTransform: "none",
} as const;

export const CoinRow: React.FC<CoinRowProps> = ({ row }) => {
  const initial = row.name.charAt(0).toUpperCase();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/coin/${row.symbol.toLowerCase()}`); 
  };
  // Данные для графика строятся на основе истории цен
  const chartData = {
    labels: row.priceHistoryDay.map((_, idx) => idx),
    datasets: [
      {
        data: row.priceHistoryDay,
        borderColor: row.hourChange >= 0 ? theme.palette.success.main : theme.palette.error.main,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: {
      line: { borderJoinStyle: 'round' as const },
    },
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: "flex",
        alignItems: "center",
        borderTop: 1,
        borderTopStyle: "solid",
        borderTopColor: "background.default",
      }}
    >
      {/* Колонка с названием и символом */}
      <Box
        sx={{
          flex: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 3,
          py: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "black",
            width: 32,
            height: 32,
            fontSize: 14,
            color: "white",
          }}
        >
          {initial}
        </Avatar>
        <Box>
          <Typography variant="button" sx={{ textTransform: "none" }} color="text.primary">
            {row.name}
          </Typography>
          <Typography variant="caption" color="primary.main" sx={{ ml: 1 }}>
            {row.symbol}
          </Typography>
        </Box>
      </Box>

      {/* Изменения */}
      <ChangeBadge
        value={row.hourChange}
        sx={{ flex: 0.9, justifyContent: "center", px: 3, py: 2 }}
      />
      <ChangeBadge
        value={row.dayChange}
        sx={{ flex: 0.9, justifyContent: "center", px: 3, py: 2 }}
      />
      <ChangeBadge
        value={row.weekChange}
        sx={{ flex: 0.9, justifyContent: "center", px: 3, py: 2 }}
      />

      <Box
        sx={{
          flex: 1.8,
          display: "flex",
          justifyContent: "right",
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="button" sx={moneyTextSx} color="text.secondary">
          ${row.volume24h.toLocaleString()}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1.8,
          display: "flex",
          justifyContent: "right",
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="button" sx={moneyTextSx} color="text.secondary">
          ${row.marketCap.toLocaleString()}
        </Typography>
      </Box>

      <Box sx={{ width: "160px", height: "64px", px: 2, py: 0.5, pointerEvents: "none" }}>
        {row.priceHistoryDay.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <Box sx={{ width: '100%', height: '100%', bgcolor: 'background.paper' }} />
        )}
      </Box>
    </Box>
  );
};