"use client";
import * as React from "react";
import { Card, CardContent, TextField, MenuItem, Typography, Stack, Box, Fade, CircularProgress, Avatar, List, ListItem, ListItemAvatar, ListItemText, Switch, Divider, Paper, Grid } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import PaletteIcon from "@mui/icons-material/Palette";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAppStore } from "@lib/store";
import { CURRENCIES, FADE_TIMEOUT, LOADING_DELAY } from "@lib/constants";

export default function SettingsPage(){
  const { settings, setBaseCurrency } = useAppStore();
  const [loading, setLoading] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);
  const [autoBackup, setAutoBackup] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), LOADING_DELAY);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Fade in timeout={FADE_TIMEOUT}>
    <Stack spacing={3}>
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
          <SettingsIcon fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">Settings</Typography>
          <Typography variant="body2" color="text.secondary">Manage your preferences</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CurrencyExchangeIcon color="primary" />
                <Typography variant="h6">Currency Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <TextField
                select
                fullWidth
                label="Base Currency"
                value={settings.baseCurrency}
                onChange={(e)=>setBaseCurrency(e.target.value as any)}
                helperText="All amounts will be converted to this currency"
              >
                {CURRENCIES.map(c => (
                  <MenuItem key={c} value={c}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography>{c}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PaletteIcon color="primary" />
                <Typography variant="h6">Appearance</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <NotificationsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Notifications" 
                    secondary="Enable push notifications"
                  />
                  <Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <SettingsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Auto Backup" 
                    secondary="Automatically backup data"
                  />
                  <Switch checked={autoBackup} onChange={(e) => setAutoBackup(e.target.checked)} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>About</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">Version: 1.0.0</Typography>
              <Typography variant="body2" color="text.secondary">Built with Next.js, MUI, D3.js & Zustand</Typography>
              <Typography variant="body2" color="text.secondary">© 2024 Expense Tracker</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
    </Fade>
  );
}
