import { Box, type SxProps, type Theme, Typography } from "@mui/material";

type ChangeBadgeProps = {
  value: number;
  sx?: SxProps<Theme>;
};

export const ChangeBadge: React.FC<ChangeBadgeProps> = ({ value, sx }) => {
  const isPositive = value >= 0;
  const displayValue = (value != null && !isNaN(value)) ? value : 0;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 0.5,
        color: isPositive ? "success.main" : "error.main",
        ...sx,
      }}
    >
      <Box
        component="span"
        sx={{
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderBottom: isPositive ? `9px solid currentColor` : "none",
          borderTop: !isPositive ? `9px solid currentColor` : "none",
        }}
      />
      <Typography
        component="span"
        variant="button"
        sx={{ textTransform: "none" }}
      >
        {displayValue.toFixed(1)}%
      </Typography>
    </Box>
  );
};
