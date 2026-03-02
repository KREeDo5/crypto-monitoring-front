import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

export const glassCardSx = (theme: Theme) => ({
  position: "relative",
  borderRadius: 5,

  backgroundColor: alpha(theme.palette.background.default, 0.05),
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",

  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderTop: "1px solid rgba(255, 255, 255, 0.3)",

  boxShadow: `0 0 10px 0 ${theme.palette.primary.main}`,

  overflow: "visible",
});

export const glassButtonSx = (theme: Theme) => ({
  borderRadius: 2,
  color: "text.secondary",

  backgroundColor: alpha(theme.palette.background.default, 0.05),
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",

  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderTop: "1px solid rgba(255, 255, 255, 0.3)",

  textTransform: "none",
  "&:hover": {
    backgroundColor: alpha(theme.palette.background.default, 0.05),
    boxShadow: `0 0 10px 0 ${theme.palette.primary.main}`,
  },
});

export const glassButtonSxPressed = (theme: Theme) => ({
  color: "text.primary",
  bgcolor: `${alpha(theme.palette.primary.main, 0.5)} !important`,
  boxShadow: `0 0 10px 0 ${theme.palette.primary.main}`,
});
