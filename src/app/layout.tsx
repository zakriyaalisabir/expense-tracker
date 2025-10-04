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
    palette: { 
      mode, 
      success: { main: COLORS.SUCCESS }, 
      error: { main: COLORS.ERROR },
      background: {
        default: 'transparent',
        paper: mode === 'dark' ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.3)'
      }
    },
    shape: { borderRadius: BORDER_RADIUS },
    components: {
      MuiCard: { 
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: mode === 'dark' 
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
              : '0 8px 32px 0 rgba(31, 38, 135, 0.1)'
          }
        }
      },
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500 } } },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            backgroundImage: 'none'
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(20px)',
            backgroundColor: mode === 'dark' ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.4)',
            boxShadow: 'none',
            borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.4)'
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backdropFilter: 'blur(20px)',
            backgroundColor: mode === 'dark' ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.4)',
            borderRight: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.4)'
          }
        }
      }
    }
  }), [mode]);

  return (
    <html lang="en">
      <body style={{
        background: mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%)',
        minHeight: '100vh',
        backgroundAttachment: 'fixed'
      }}>
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
