import { Avatar, Box, Typography } from "@mui/material";
import {ChangeBadge} from "../shared/components/ChangeBadge.tsx";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type {CoinRowData} from "../shared/types.ts";
import {miniChartMock} from "../mock/miniChart.ts";
import {theme} from "../theme.ts";

type CoinRowProps = {
  row: CoinRowData;
}

const moneyTextSx = {
  fontSize: "0.75rem",
  fontWeight: 500,
  lineHeight: 1.4,
  letterSpacing: 0,
  textTransform: "none",
} as const;

export const CoinRow: React.FC<CoinRowProps> = ({ row }) => {
  const series = miniChartMock;

  const initial = row.name.charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderTop: 1,
        borderTopStyle: "solid",
        borderTopColor: "background.default",
      }}
    >
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
            bgcolor: "black", // Hardcode
            width: 32,
            height: 32,
            fontSize: 14,
            color: "white", // Hardcode
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

      <ChangeBadge
        value={row.percentHour}
        sx={{ flex: 0.9, justifyContent: "center", px: 3, py: 2 }}
      />

      <ChangeBadge
        value={row.percentDay}
        sx={{ flex: 0.9, justifyContent: "center", px: 3, py: 2 }}
      />

      <ChangeBadge
        value={row.percentWeek}
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
        <Typography
          variant="button"
          sx={moneyTextSx}
          color="text.secondary"
        >
          ${row.volumeDay.toLocaleString()}
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
        <Typography
          variant="button"
          sx={moneyTextSx}
          color="text.secondary"
        >
          ${row.marketCap.toLocaleString()}
        </Typography>
      </Box>

      <Box sx={{ width: "160px", height: "64px", px: 2, py: 0.5, pointerEvents: "none" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={row.percentHour >= 0 ? theme.palette.success.main : theme.palette.error.main}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <XAxis dataKey="time" hide />
            <YAxis hide />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}