"use client";
import * as React from "react";
import { Card, CardContent, TextField, MenuItem, Typography, Stack, Box, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, Switch, Divider, Paper, Grid, Button, Alert, Avatar } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import PaletteIcon from "@mui/icons-material/Palette";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "@components/AuthProvider";
import AuthGuard from "@components/AuthGuard";
import { useAppStore } from "@lib/store";
import { CURRENCIES, LOADING_DELAY } from "@lib/constants";
import PageLayout from "@components/PageLayout";

export default function SettingsPage(){
  const { user } = useAuth();
  const { settings, setBaseCurrency, addCustomCurrency } = useAppStore();
  const [loading, setLoading] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);
  const [autoBackup, setAutoBackup] = React.useState(false);
  const [name, setName] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [currencySuccess, setCurrencySuccess] = React.useState("");
  const [newCurrency, setNewCurrency] = React.useState("");
  const [newRate, setNewRate] = React.useState("1");
  const [imageError, setImageError] = React.useState(false);

  const allCurrencies = [...CURRENCIES, ...(settings.customCurrencies || [])];

  async function handleRateChange(currency: string, rate: number) {
    await useAppStore.getState().setExchangeRate(currency, rate);
    setCurrencySuccess("Exchange rates saved!");
    setTimeout(() => setCurrencySuccess(""), 2000);
  }

  React.useEffect(() => {
    if (user?.user_metadata?.display_name) {
      setName(user.user_metadata.display_name);
    } else if (user?.email) {
      setName(user.email.split('@')[0]);
    }
  }, [user]);

  // Generate Gravatar URL as fallback
  const getGravatarUrl = (email: string) => {
    const hash = btoa(email.toLowerCase().trim()).replace(/=/g, '');
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=80`;
  };

  async function updateProfile() {
    if (!name.trim()) return;
    const { createClient } = await import('@lib/supabase/client');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { display_name: name.trim() }
    });
    if (error) {
      setSuccess("Error updating profile");
    } else {
      setSuccess("Profile updated successfully!");
    }
    setTimeout(() => setSuccess(""), 3000);
  }

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
    <AuthGuard>
    <PageLayout icon={SettingsIcon} title="Settings" subtitle="Manage your preferences">
      <Grid container spacing={0} sx={{ columnGap: 3, rowGap: 3 }}>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PersonIcon color="primary" />
                <Typography variant="h6">Profile Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    sx={{ 
                      width: 80, 
                      height: 80,
                      bgcolor: 'grey.400',
                      color: 'white',
                      fontSize: '2rem',
                      fontWeight: 'bold'
                    }}
                    src={!imageError ? (user?.user_metadata?.picture || user?.user_metadata?.avatar_url) : undefined}
                    onError={() => setImageError(true)}
                  >
                    {name ? name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {name || user?.email?.split('@')[0] || 'User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email || 'demo@example.com'}
                    </Typography>
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  label="Email"
                  value={user?.email || ""}
                  disabled
                  helperText="Email cannot be changed"
                />
                <TextField
                  fullWidth
                  label="Display Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  helperText="This name will be displayed in your profile"
                />
                {success && <Alert severity="success">{success}</Alert>}
                <Box>
                  <Button variant="contained" onClick={updateProfile}>Save Changes</Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CurrencyExchangeIcon color="primary" />
                <Typography variant="h6">Currency Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <TextField
                  select
                  fullWidth
                  label="Base Currency"
                  value={settings.baseCurrency}
                  onChange={(e)=>setBaseCurrency(e.target.value as any).catch(console.error)}
                  helperText="All amounts will be converted to this currency"
                >
                  {allCurrencies.map(c => (
                    <MenuItem key={c} value={c}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography>{c}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2 }}>Exchange Rates (vs {settings.baseCurrency})</Typography>
                {allCurrencies.filter(c => c !== settings.baseCurrency).map(c => (
                  <TextField
                    key={c}
                    fullWidth
                    type="number"
                    label={`1 ${c} = ? ${settings.baseCurrency}`}
                    value={settings.exchangeRates?.[c] || 1}
                    onChange={(e) => handleRateChange(c, Number(e.target.value))}
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                ))}
                {currencySuccess && <Alert severity="success">{currencySuccess}</Alert>}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight="bold">Add New Currency</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    label="Currency Code"
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value.toUpperCase())}
                    placeholder="GBP"
                    inputProps={{ maxLength: 5 }}
                    sx={{ flex: 1 }}
                    fullWidth
                  />
                  <TextField
                    label="Rate"
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    inputProps={{ step: 0.01, min: 0 }}
                    sx={{ flex: 1 }}
                    fullWidth
                  />
                </Stack>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={async () => {
                    if (newCurrency && !allCurrencies.includes(newCurrency)) {
                      await addCustomCurrency(newCurrency, Number(newRate));
                      setNewCurrency("");
                      setNewRate("1");
                      setCurrencySuccess(`${newCurrency} added successfully!`);
                      setTimeout(() => setCurrencySuccess(""), 2000);
                    }
                  }}
                  disabled={!newCurrency || allCurrencies.includes(newCurrency)}
                >
                  Add Currency
                </Button>
              </Stack>
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
            <Typography variant="h6" gutterBottom>About Expense Tracker</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Version</Typography>
                <Typography variant="body2" color="text.secondary">1.0.0</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Description</Typography>
                <Typography variant="body2" color="text.secondary">
                  A comprehensive personal finance management application with multi-currency support, 
                  budgeting tools, goal tracking, and interactive data visualizations.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Features</Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  • Multi-currency transaction management<br/>
                  • Budget tracking and goal setting<br/>
                  • Interactive charts and reports (D3.js)<br/>
                  • Category and subcategory organization<br/>
                  • Account management (Cash, Bank, Credit, E-wallet, Savings)<br/>
                  • User authentication and data privacy
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Technology Stack</Typography>
                <Typography variant="body2" color="text.secondary">
                  Next.js 14 • TypeScript • Material-UI 6 • D3.js 7 • Zustand 4 • NextAuth.js
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">© 2025 Expense Tracker. All rights reserved.</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </PageLayout>
    </AuthGuard>
  );
}
