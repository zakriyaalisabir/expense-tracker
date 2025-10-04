"use client";
import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { THEME_MODE, THEME_MODE_KEY, COLORS, BORDER_RADIUS, ELEVATION } from "@lib/constants";
import LayoutContent from "@components/LayoutContent";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<"light" | "dark">(THEME_MODE.LIGHT);
  
  React.useEffect(() => {
    const m = window.localStorage.getItem(THEME_MODE_KEY) as "light" | "dark" | null;
    if (m) setMode(m);
  }, []);

  const theme = React.useMemo(() => createTheme({
    palette: { mode, success: { main: COLORS.SUCCESS }, error: { main: COLORS.ERROR } },
    shape: { borderRadius: BORDER_RADIUS },
    components: {
      MuiCard: { defaultProps: { elevation: ELEVATION } },
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500 } } }
    }
  }), [mode]);

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <LayoutContent mode={mode} setMode={setMode}>
              {children}
            </LayoutContent>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
