"use client";
import * as React from "react";
import { useAuth } from "@components/AuthProvider";
import { AppBar, Toolbar, Typography, IconButton, Box, Container, Tabs, Tab, LinearProgress, Drawer, List, ListItem, ListItemButton, ListItemText, useMediaQuery, Avatar, Button, Alert } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MenuIcon from "@mui/icons-material/Menu";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TABS, THEME_MODE, THEME_MODE_KEY, LOADING_DELAY, DRAWER_WIDTH, MOBILE_BREAKPOINT } from "@lib/constants";

export default function LayoutContent({ children, mode, setMode }: any) {
  const [loading, setLoading] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const { user, signOut } = useAuth();
  const demoEnabled = process.env.NEXT_PUBLIC_DEMO_ENABLED === 'true';
  const [demoMode, setDemoMode] = React.useState(false);
  const [showDemoBanner, setShowDemoBanner] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), LOADING_DELAY);
    return () => clearTimeout(timer);
  }, [pathname]);

  React.useEffect(() => {
    // Detect demo mode via cookie or localStorage
    if (!demoEnabled) {
      setDemoMode(false);
      return;
    }
    const hasLocal = typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true';
    const hasCookie = typeof document !== 'undefined' && document.cookie.includes('demo-mode=true');
    setDemoMode(hasLocal || hasCookie);
  }, [demoEnabled, pathname]);

  const current = TABS.findIndex(t => t.href === pathname);

  const handleNavigation = (href: string) => {
    setDrawerOpen(false);
    router.push(href);
  };

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Avatar sx={{ bgcolor: "primary.main", mr: 1.5, width: 40, height: 40, color: "#fff" }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 22, color: "inherit" }} />
          </Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>Expense Tracker</Typography>
          {user && (
            <Box sx={{ display: { xs: "none", md: "block" }, mr: 2 }}>
              <Tabs value={current !== -1 ? current : false} variant="scrollable" scrollButtons="auto">
                {TABS.map((t) => (
                  <Tab key={t.href} label={t.label} component={Link} href={t.href} />
                ))}
              </Tabs>
            </Box>
          )}
          <IconButton onClick={() => {
            const next = mode === THEME_MODE.LIGHT ? THEME_MODE.DARK : THEME_MODE.LIGHT;
            setMode(next);
            window.localStorage.setItem(THEME_MODE_KEY, next);
          }} sx={{ mr: 1 }}>
            {mode === THEME_MODE.LIGHT ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<LogoutIcon />}
            onClick={async () => {
              if (user) {
                await signOut();
              } else {
                router.push('/auth');
              }
            }}
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            {user ? 'Sign Out' : 'Sign In'}
          </Button>
        </Toolbar>
        {loading && <LinearProgress />}
      </AppBar>
      {demoEnabled && demoMode && showDemoBanner && (
        <Box sx={{ maxWidth: 'lg', mx: 'auto', px: { xs: 2, md: 3 }, pt: 2 }}>
          <Alert
            severity="info"
            onClose={() => setShowDemoBanner(false)}
            action={
              <Button color="inherit" size="small" onClick={async () => await signOut()}>
                Exit Demo
              </Button>
            }
          >
            You are in Demo Mode. Data is temporary and stored locally. Sign in for your own account.
          </Alert>
        </Box>
      )}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: DRAWER_WIDTH }} role="presentation">
          <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ bgcolor: "primary.main", color: "#fff" }}>
              <AccountBalanceWalletIcon sx={{ color: "inherit" }} />
            </Avatar>
            <Typography variant="h6" fontWeight="bold">Expense Tracker</Typography>
          </Box>
          <List>
            {TABS.map((t) => (
              <ListItem key={t.href} disablePadding>
                <ListItemButton selected={pathname === t.href} onClick={() => handleNavigation(t.href)}>
                  <ListItemText primary={t.label} />
                </ListItemButton>
              </ListItem>
            ))}
            {user && (
              <ListItem disablePadding>
                <ListItemButton onClick={async () => {
                  setDrawerOpen(false);
                  await signOut();
                }}>
                  <LogoutIcon sx={{ mr: 2 }} />
                  <ListItemText primary="Sign Out" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          px: { xs: 2, md: 3 },
          mx: 'auto'
        }}
      >
        {children}
      </Container>
    </>
  );
}
