"use client";
import * as React from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { AppBar, Toolbar, Typography, IconButton, Box, Container, Tabs, Tab } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Dashboard", href: "/" },
  { label: "Transactions", href: "/transactions" },
  { label: "Accounts", href: "/accounts" },
  { label: "Budgets", href: "/budgets" },
  { label: "Goals", href: "/goals" },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<"light" | "dark">("light");
  React.useEffect(() => {
    const m = window.localStorage.getItem("theme-mode") as "light" | "dark" | null;
    if (m) setMode(m);
  }, []);
  const theme = React.useMemo(() => createTheme({
    palette: { mode, success: { main: "#2e7d32" }, error: { main: "#c62828" } },
    shape: { borderRadius: 16 },
    components: {
      MuiCard: { defaultProps: { elevation: 2 } },
      MuiButton: { defaultProps: { disableElevation: true } }
    }
  }), [mode]);

  const pathname = usePathname();
  const current = tabs.findIndex(t => t.href === pathname);
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppBar position="sticky" color="default" elevation={1}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>Expense Tracker</Typography>
              <Box sx={{ display: { xs: "none", md: "block" }, mr: 2 }}>
                <Tabs value={current !== -1 ? current : false}>
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
          </AppBar>
          <Container maxWidth="lg" sx={{ py: 3 }}>
            {children}
          </Container>
        </ThemeProvider>
      </body>
    </html>
  );
}
