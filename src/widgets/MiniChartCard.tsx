import { useNavigate } from 'react-router-dom';
import {
  alpha,
  Box,
  Paper,
  type SxProps,
  type Theme,
  Typography,
} from "@mui/material";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {glassCardSx} from "../shared/styles/glass.ts";
import {miniChartMock} from "../mock/miniChart.ts";
import {theme} from "../theme.ts";

type MiniChartCardProps = {
  symbol: string; 
  name: string;
  price: number;
  changePercent: number;
  priceHistory: number[]; 
};

export const MiniChartCard: React.FC<MiniChartCardProps> = ({
  symbol,
  name,
  price,
  changePercent,
  priceHistory,
}) => {

  const navigate = useNavigate();

  const handleClick = () => {
    console.log(symbol);
    navigate(`/coin/${symbol.toUpperCase()}`);
  };


  const fillId = `fill-${name.replace(/\s+/g, "")}`;
  const filterId = `filter-${name.replace(/\s+/g, "")}`;
  const chartData = (priceHistory.length > 0 ? priceHistory : [price]).map(
    (value, index) => ({ value, time: index })
  );
  const data = miniChartMock;
  const isPositive = changePercent >= 0;

  const colors = {
    main: isPositive ? theme.palette.success.main : theme.palette.error.main, // Основной цвет (линия, свечение)
    bgTop: "#020617", // Верх градиента фона
    bgBottom: isPositive ? theme.palette.success.dark : theme.palette.error.dark, // Низ градиента (зеленоватый или красноватый)
    textPrimary: "text.primary",
  };

  const dynamicGlassSx: SxProps<Theme> = (muiTheme: Theme) => ({
    ...glassCardSx(muiTheme),
    boxShadow: `0 0 16px 0 ${alpha(colors.main, 0.25)}`,
    overflow: "hidden",
  });

  return (
    <Paper sx={dynamicGlassSx} onClick={handleClick}>
      <Box
        sx={{
          position: "absolute",
          insetX: 0,
          bottom: 0,
          height: "50%",
          background: `radial-gradient(circle at bottom, ${alpha(colors.main, 0.2)}, transparent 70%)`,
          opacity: 0.35,
          pointerEvents: "none",
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        },
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            pt: 1.25,
            px: 1.25,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                fontWeight: 400,
                fontSize: "0.75rem",
                lineHeight: 1.4,
                letterSpacing: 0,
                verticalAlign: "middle",
              }}
              color={colors.textPrimary}
            >
              {name}
            </Typography>
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: "0.875rem",
                lineHeight: 1.4,
                letterSpacing: 0,
                verticalAlign: "middle",
              }}
              color={colors.textPrimary}
            >
              {!isPositive && "- "}
              {Math.abs(changePercent).toFixed(2)}%
            </Typography>
          </Box>

          <Typography
            sx={{
              fontWeight: 400,
              fontSize: "0.625rem",
              lineHeight: 1.4,
              letterSpacing: 0,
              verticalAlign: "middle",
            }}
            color={colors.textPrimary}
          >
            {price.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </Typography>
        </Box>

        <Box sx={{ height: 80, pointerEvents: "none" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <filter
                  id={filterId}
                  x="-20%"
                  y="-50%"
                  width="140%"
                  height="200%"
                >
                  <feGaussianBlur
                    in="SourceAlpha"
                    stdDeviation="6"
                    result="blur"
                  />
                  <feOffset in="blur" dx="0" dy="-2" result="offsetBlur" />
                  <feFlood
                    floodColor={colors.main}
                    floodOpacity="1"
                    result="color"
                  />
                  <feComposite
                    in="color"
                    in2="offsetBlur"
                    operator="in"
                    result="shadow"
                  />
                  <feComposite
                    in="SourceGraphic"
                    in2="shadow"
                    operator="over"
                  />
                </filter>

                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.main} stopOpacity={0.9} />
                  <stop
                    offset="100%"
                    stopColor={colors.main}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>

      <XAxis dataKey="time" hide padding={{ left: 0, right: 0 }} />
      <YAxis 
        hide 
        domain={['dataMin', 'dataMax']} 
        padding={{ top: 20, bottom: 20 }} 
      />

              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill={`url(#${fillId})`}
                tooltipType="none"
                activeDot={false}
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.main}
                style={{ filter: `url(#${filterId})` }}
                fill="transparent"
                tooltipType="none"
                dot={false}
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
};