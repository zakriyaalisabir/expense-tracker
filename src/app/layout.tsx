"use client";
import * as React from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { THEME_MODE, THEME_MODE_KEY, COLORS, BORDER_RADIUS, ELEVATION } from "@lib/constants";
import LayoutContent from "@components/LayoutContent";
import { AuthProvider } from "@/components/AuthProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<"light" | "dark">(THEME_MODE.LIGHT);
  
  React.useEffect(() => {
    const m = window.localStorage.getItem(THEME_MODE_KEY) as "light" | "dark" | null;
    if (m) setMode(m);
  }, []);

  const theme = React.useMemo(() => createTheme({
    palette: { 
      mode, 
      primary: { main: mode === 'dark' ? '#60a5fa' : '#3b82f6' },
      success: { main: COLORS.SUCCESS }, 
      error: { main: COLORS.ERROR },
      background: {
        default: 'transparent',
        paper: mode === 'dark' ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.3)'
      }
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      h6: { fontWeight: 600, letterSpacing: '-0.02em' },
      button: { textTransform: 'none', fontWeight: 600 }
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCard: { 
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(24px)',
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: mode === 'dark' 
              ? '0 4px 24px 0 rgba(0, 0, 0, 0.4), 0 1px 3px 0 rgba(0, 0, 0, 0.2)'
              : '0 4px 24px 0 rgba(31, 38, 135, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.08)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: mode === 'dark'
                ? '0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 2px 6px 0 rgba(0, 0, 0, 0.3)'
                : '0 8px 32px 0 rgba(31, 38, 135, 0.16), 0 2px 6px 0 rgba(0, 0, 0, 0.1)'
            }
          }
        }
      },
      MuiButton: { 
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 20px',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          },
          contained: {
            '&:hover': { transform: 'translateY(-1px)' }
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': { borderWidth: '1.5px' }
          }
        }
      },
      MuiTab: { 
        styleOverrides: { 
          root: { 
            textTransform: 'none', 
            fontWeight: 600,
            fontSize: '0.9rem',
            minHeight: 48,
            transition: 'all 0.2s ease'
          } 
        } 
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(24px)',
            backgroundImage: 'none'
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(24px)',
            backgroundColor: mode === 'dark' ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.5)',
            boxShadow: mode === 'dark'
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
            borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.6)'
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backdropFilter: 'blur(24px)',
            backgroundColor: mode === 'dark' ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.5)',
            borderRight: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.6)'
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-1px)' }
            }
          }
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease',
            '&:hover': { transform: 'scale(1.1)' }
          }
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              backgroundColor: mode === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.15)',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(96, 165, 250, 0.3)' : 'rgba(59, 130, 246, 0.2)'
              }
            }
          }
        }
      }
    }
  }), [mode]);

  return (
    <html lang="en">
      <body style={{
        background: mode === 'dark'
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
          : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
        minHeight: '100vh',
        backgroundAttachment: 'fixed'
      }}>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <LayoutContent mode={mode} setMode={setMode}>
              {children}
            </LayoutContent>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
