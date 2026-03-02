import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#1B2430",
      componentPrimary: "#232D3B",
      componentSecondary: "#232B38",
    },
    primary: {
      main: "#4B84D9",
    },
    success: {
      main: "#59AF75",
      dark: "#3E7E59",
    },
    error: {
      main: "#D35358",
      dark: "#8F3941",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#C8C8C8",
    },
    divider: "#181D27",
    aiGradient: {
      start: "#0004F9",
      end: "#B302FF",
      background: "#151E2E",
    },
  },
});

/*
Previous theme:

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#1B2430",
      paper: "#232D3B",
    },
    primary: {
      main: "#4b84d9",
    },
    success: {
      main: "#59AF75",
      dark: "#33584b",
    },
    error: {
      main: "#D35358",
      dark: "#572733",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#C8C8C8",
      disabled: "",
    },
  },
});
*/
