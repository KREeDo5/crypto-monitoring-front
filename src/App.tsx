import { Box, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme.ts";
import {DashboardPage} from "./pages/DashboardPage.tsx";
import { CoinDetailsPage } from "./pages/CoinDetailsPage/CoinDetailsPage.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export const App: React.FC = () => {
  return (
      <BrowserRouter>
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowX: "hidden",
            overflowY: "auto",
          }}
        > 
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/coin/:symbol" element={<CoinDetailsPage />} />
            </Routes>
        </Box>
      </Box>
    </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
