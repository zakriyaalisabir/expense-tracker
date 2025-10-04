"use client";
import * as React from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { AppBar, Toolbar, Typography, IconButton, Box, Container, Tabs, Tab, LinearProgress, Drawer, List, ListItem, ListItemButton, ListItemText, useMediaQuery } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const tabs = [
  { label: "Dashboard", href: "/" },
  { label: "Transactions", href: "/transactions" },
  { label: "Categories", href: "/categories" },
  { label: "Accounts", href: "/accounts" },
  { label: "Budgets", href: "/budgets" },
  { label: "Goals", href: "/goals" },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<"light" | "dark">("light");
  const [loading, setLoading] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:900px)');
  
  React.useEffect(() => {
    const m = window.localStorage.getItem("theme-mode") as "light" | "dark" | null;
    if (m) setMode(m);
  }, []);

  React.useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  const theme = React.useMemo(() => createTheme({
    palette: { mode, success: { main: "#2e7d32" }, error: { main: "#c62828" } },
    shape: { borderRadius: 16 },
    components: {
      MuiCard: { defaultProps: { elevation: 2 } },
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500 } } }
    }
  }), [mode]);

  const current = tabs.findIndex(t => t.href === pathname);

  const handleNavigation = (href: string) => {
    setDrawerOpen(false);
    router.push(href);
  };
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppBar position="sticky" color="default" elevation={1}>
            <Toolbar>
              {isMobile && (
                <IconButton edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h6" sx={{ flexGrow: 1 }}>💰 Expense Tracker</Typography>
              <Box sx={{ display: { xs: "none", md: "block" }, mr: 2 }}>
                <Tabs value={current !== -1 ? current : false} variant="scrollable" scrollButtons="auto">
                  {tabs.map((t) => (
                    <Tab key={t.href} label={t.label} component={Link} href={t.href} />
                  ))}
                </Tabs>
              </Box>
              <IconButton onClick={() => {
                const next = mode === "light" ? "dark" : "light";
                setMode(next);
                window.localStorage.setItem("theme-mode", next);
              }}>
                {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
            </Toolbar>
            {loading && <LinearProgress />}
          </AppBar>
          <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <Box sx={{ width: 250 }} role="presentation">
              <List>
                {tabs.map((t) => (
                  <ListItem key={t.href} disablePadding>
                    <ListItemButton selected={pathname === t.href} onClick={() => handleNavigation(t.href)}>
                      <ListItemText primary={t.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>
          <Container maxWidth="lg" sx={{ py: 3 }}>
            {children}
          </Container>
        </ThemeProvider>
      </body>
    </html>
  );
}
