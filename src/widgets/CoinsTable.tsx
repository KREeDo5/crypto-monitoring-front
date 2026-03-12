import { Box } from "@mui/material";
import { CoinRow } from "./CoinRow.tsx";
import type {CoinRowData} from "../shared/types.ts";

type CoinsTableProps = {
  rows: CoinRowData[];
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

export const CoinsTable: React.FC<CoinsTableProps> = ({ rows }) => {
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
        {columns.map(col => (
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

      {rows.map(row => (
        <CoinRow key={row.symbol} row={row} />
      ))}
    </Box>
  );
};

