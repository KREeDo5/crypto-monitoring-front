import { Box, Skeleton } from "@mui/material";
import { CoinRow } from "./CoinRow.tsx";
import type { CoinRowData } from "../shared/types.ts";

type CoinsTableProps = {
  rows: CoinRowData[];
  skeletonRows?: number;
};

const headerCellSx = {
  fontSize: "0.75rem",
  fontWeight: 500,
  lineHeight: 1.4,
  letterSpacing: 0,
} as const;

const columns = [
  { key: "coin", label: "Монета", flex: 2, align: "left" as const },
  { key: "h1", label: "1ч", flex: 0.9, align: "center" as const },
  { key: "h24", label: "24ч", flex: 0.9, align: "center" as const },
  { key: "d7", label: "7д", flex: 0.9, align: "center" as const },
  {
    key: "volume",
    label: "Объём торгов (24ч)",
    flex: 1.8,
    align: "right" as const,
  },
  {
    key: "cap",
    label: "Рыночная капитализация",
    flex: 1.8,
    align: "right" as const,
  },
  {
    key: "chart",
    label: "Последние 24 часа",
    flex: 1.3,
    align: "center" as const,
  },
];

export const CoinsTable: React.FC<CoinsTableProps> = ({ rows, skeletonRows = 0 }) => {
  return (
    <Box
      sx={{
        mt: 1.25,
        borderRadius: 5,
        bgcolor: "background.componentPrimary",
        color: "text.primary",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderBottomStyle: "solid",
          borderBottomColor: "background.default",
          display: "flex",
        }}
      >
        {columns.map((col) => (
          <Box
            key={col.key}
            sx={{
              flex: col.flex,
              textAlign: col.align,
              px: 3,
              py: 1.5,
              ...headerCellSx,
            }}
          >
            {col.label}
          </Box>
        ))}
      </Box>

      {rows.map((row) => (
        <CoinRow key={row.symbol} row={row} />
      ))}

      {Array.from({ length: skeletonRows }).map((_, index) => (
        <Box
          key={`coin-row-skeleton-${index}`}
          sx={{
            display: "flex",
            alignItems: "center",
            borderTop: 1,
            borderTopStyle: "solid",
            borderTopColor: "background.default",
            px: 3,
            py: 2,
            gap: 2,
          }}
        >
          <Box sx={{ flex: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Box sx={{ width: "100%" }}>
              <Skeleton variant="text" width="35%" height={24} />
              <Skeleton variant="text" width="20%" height={18} />
            </Box>
          </Box>
          <Box sx={{ flex: 0.9, display: "flex", justifyContent: "center" }}>
            <Skeleton variant="rounded" width={60} height={24} />
          </Box>
          <Box sx={{ flex: 0.9, display: "flex", justifyContent: "center" }}>
            <Skeleton variant="rounded" width={60} height={24} />
          </Box>
          <Box sx={{ flex: 0.9, display: "flex", justifyContent: "center" }}>
            <Skeleton variant="rounded" width={60} height={24} />
          </Box>
          <Box sx={{ flex: 1.8, display: "flex", justifyContent: "flex-end" }}>
            <Skeleton variant="text" width="70%" height={24} />
          </Box>
          <Box sx={{ flex: 1.8, display: "flex", justifyContent: "flex-end" }}>
            <Skeleton variant="text" width="75%" height={24} />
          </Box>
          <Box sx={{ width: "160px", px: 2 }}>
            <Skeleton variant="rounded" width="100%" height={48} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};
