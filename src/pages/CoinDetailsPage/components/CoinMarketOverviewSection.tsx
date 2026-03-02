import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useState } from "react";
import {
  aiHtml,
  metricRows,
  periods,
} from "../data.ts";
import {theme} from "../../../theme.ts";
import {glassButtonSx, glassButtonSxPressed} from "../../../shared/styles/glass.ts";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import {miniChartMock} from "../../../mock/miniChart.ts";
import {alpha} from "@mui/material/styles";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

const formatPrice = (value: number): string => {
  return `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} $`;
}

type YTickProps = {
  x?: number;
  y?: number;
  payload?: {
    value: number;
  }
}

const YTick = ({ x = 0, y = 0, payload }: YTickProps) => {
  const raw = payload?.value ?? 0;
  const formatted = String((raw / 1000).toFixed(raw % 1000 ? 1 : 0)).replace(
    ".",
    ",",
  );

  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="start"
      fill={theme.palette.text.secondary}
      fontSize={10}
      fontWeight={700}
    >
      {`$ ${formatted} тыс.`}
    </text>
  );
};

const ChartToolTip = ({ active, payload, label }: TooltipContentProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;

  const value = Number(payload[0]?.value ?? 0);

  return (
    <div
      style={{
        borderRadius: 8,

        backgroundColor: alpha(theme.palette.background.default, 0.1),
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",

        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderTop: "1px solid rgba(255, 255, 255, 0.3)",

        boxShadow: `0 0 10px 0 ${theme.palette.primary.main}`,

        padding: "16px",

        color: theme.palette.text.secondary,
        fontWeight: 400,
        fontSize: 12,
        lineHeight: 1,
      }}
    >
      <div>
        {label}
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <span>Цена:</span>
        <span style={{ color: theme.palette.text.primary, fontWeight: 700 }}>
          {formatPrice(value)}
        </span>
      </div>
    </div>
  );
};

export const CoinMarketOverviewSection: React.FC = () => {
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);
  const [activePeriod, setActivePeriod] = useState(0);

  return (
    <Paper
      elevation={0}
      sx={{
        py: 2,
        background: "none",
      }}
    >
      <Grid container spacing={2.5} alignItems="stretch">
        <Grid size={{ xs: 12, md: 4.2 }} sx={{ display: "flex" }}>
          <Stack spacing={2.5} sx={{ width: "100%" }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "#000",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <CurrencyBitcoinIcon sx={{ fontSize: 16 }} />
                </Box>

                <Typography
                  sx={{ color: "text.primary", fontSize: 18, fontWeight: 700 }}
                >
                  Bitcoin{" "}
                  <Box
                    component="span"
                    sx={{ color: "primary.main", fontWeight: 400 }}
                  >
                    курс BTC
                  </Box>
                </Typography>
              </Stack>

              <Typography
                sx={{
                  color: "text.primary",
                  fontWeight: 700,
                  fontSize: 32,
                  lineHeight: 1,
                }}
              >
                65 539,97 $
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <LinearProgress
                variant="determinate"
                value={70}
                sx={{
                  height: 12,
                  borderRadius: 1.5,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 1.5,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
                  },
                }}
              />

              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{
                  color: "text.secondary",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                <Typography>64 435,13 $</Typography>
                <Typography>Диапазон 24 ч.</Typography>
                <Typography>67 695,50 $</Typography>
              </Stack>
            </Stack>

            <Stack spacing={1.25}>
              {metricRows.map((row) => (
                <Stack
                  key={row.label}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ py: 1.25 }}
                >
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: 14,
                        fontWeight: 500,
                        lineHeight: 1,
                      }}
                    >
                      {row.label}
                    </Typography>
                    <InfoOutlinedIcon
                      sx={{ color: "text.secondary", fontSize: 14 }}
                    />
                  </Stack>
                  <Typography
                    sx={{
                      color: "text.primary",
                      fontSize: 16,
                      fontWeight: 500,
                      lineHeight: 1,
                    }}
                  >
                    {row.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            {!isAiSummaryOpen && (
              <Button
                startIcon={<AutoAwesomeIcon />}
                variant="outlined"
                onClick={() => setIsAiSummaryOpen(true)}
                sx={{
                  color: "text.primary",
                  width: "auto",
                  p: 1.25,
                  border: "1px solid transparent",
                  borderRadius: 2,
                  background: `linear-gradient(${theme.palette.background.default}, ${theme.palette.background.default}) padding-box, linear-gradient(90deg, ${theme.palette.aiGradient.start}, ${theme.palette.aiGradient.end}) border-box`,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: 16,
                  lineHeight: 1,
                  justifyContent: "center",
                  transition: "box-shadow 0.15s linear",
                  "& .MuiButton-startIcon": { color: "text.primary" },
                  "&:hover": {
                    boxShadow: `0 0 20px 0 ${theme.palette.primary.main}`,
                  },
                }}
              >
                Резюме от Искусственного Интеллекта
              </Button>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 7.8 }} sx={{ display: "flex" }}>
          <Stack spacing={2} sx={{ width: "100%", height: "100%" }}>
            <Stack
              direction="row"
              spacing={1.25}
              flexWrap="nowrap"
              sx={{ width: "100%" }}
            >
              {periods.map((period, index) => (
                <Chip
                  key={index}
                  label={period}
                  size="small"
                  sx={(muiTheme) => ({
                    flex: 1,
                    minWidth: "fit-content",
                    height: 12,
                    boxSizing: "content-box",
                    px: 1.5,
                    py: 1,
                    fontWeight: 700,
                    fontSize: 12,
                    lineHeight: 1,
                    "& .MuiChip-label": {
                      width: "100%",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    },
                    ...glassButtonSx(muiTheme),
                    ...(activePeriod === index
                      ? glassButtonSxPressed(muiTheme)
                      : {}),
                  })}
                  onClick={() => setActivePeriod(index)}
                />
              ))}
            </Stack>

            <Box
              sx={{
                flex: 1,
                minHeight: { xs: 260, md: 0 },
                "&, & *": {
                  outline: "none",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={miniChartMock}
                  margin={{ top: 12, right: 0, bottom: 0, left: 0 }}
                >
                  <defs>
                    <filter
                      id="filter"
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
                        floodColor={theme.palette.primary.main}
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

                    <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={theme.palette.primary.main}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="100%"
                        stopColor={theme.palette.primary.main}
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(120,130,190,0.55)"
                    strokeDasharray="3.5 3.5"
                  />

                  <XAxis
                    dataKey="time"
                    ticks={[0, 5, 10, 15, 20, 25]} // Тоже побольше надо
                    height={16}
                    tickMargin={0}
                    axisLine={false}
                    tickLine={false}
                    padding={{ left: 0, right: 0 }}
                    tick={{
                      fill: theme.palette.text.secondary,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                  <YAxis
                    orientation="right"
                    domain={[4960, 5050]} // Нижнее, верхнее должен быть отступ от фактических минимальных и максимальных данных. Линия не касается пола и потолка графа
                    ticks={[
                      4960, 4970, 4980, 4990, 5000, 5010, 5020, 5030, 5040,
                      5050,
                    ]} // Шаги 10 штук ровно должно быть сгенерено
                    width={64}
                    tickMargin={-2}
                    axisLine={false}
                    tickLine={false}
                    tick={<YTick />}
                  />

                  <Tooltip
                    cursor={{
                      stroke: "none",
                    }}
                    isAnimationActive
                    animationDuration={100}
                    content={(props) => <ChartToolTip {...props} />}
                  />

                  <Area
                    type="linear"
                    dataKey="value"
                    stroke="none"
                    fill={`url(#fill)`}
                    tooltipType="none"
                    activeDot={false}
                    animationDuration={1000}
                  />
                  <Area
                    type="linear"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    style={{ filter: `url(#filter)` }}
                    fill="transparent"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <Collapse in={isAiSummaryOpen} timeout={320}>
        <Paper
          sx={{
            mt: 4,
            p: 2,
            border: "1px solid transparent",
            borderRadius: 2,
            background: `linear-gradient(${theme.palette.aiGradient.background}, ${theme.palette.aiGradient.background}) padding-box, linear-gradient(90deg, ${theme.palette.aiGradient.start}, ${theme.palette.aiGradient.end}) border-box`,
            boxShadow: `0 0 20px 0 ${theme.palette.primary.main}`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeIcon sx={{ height: 18 }} />
            <Typography
              sx={{ color: "text.primary", fontWeight: 500, fontSize: 16 }}
            >
              Резюме от Искусственного Интеллекта
            </Typography>
          </Stack>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: 14,
              mt: 0.5,
              lineHeight: 1.4,
            }}
          >
            *Ответ сгенерирован ИИ на основе текущих данных по Bitcoin и не
            является финансовой рекомендацией.
          </Typography>

          <Divider sx={{ borderColor: "rgba(90, 112, 255, 0.7)", my: 1.2 }} />

          <Box
            sx={{
              color: "text.secondary",
              fontSize: 16,
              lineHeight: 1.4,
              "& p": {
                margin: 0,
                marginBottom: 1,
              },
              "& p:not(:has(+ p))": {
                marginBottom: 0,
              },
              "& ul, & ol": {
                margin: 0,
                paddingLeft: "18px",
              },
            }}
            dangerouslySetInnerHTML={{ __html: aiHtml }}
          />
        </Paper>
      </Collapse>
    </Paper>
  );
};

