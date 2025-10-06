"use client";
import { Card, CardContent, Typography, Box, Grid, Divider } from "@mui/material";
import { TrendingUp, TrendingDown, AccountBalance, CreditCard } from "@mui/icons-material";
import { Account, Asset, Debt, Investment } from "../lib/types";
import { useAppStore } from "../lib/store";
import { formatCurrency } from "../lib/currency";

interface NetWorthCalculatorProps {
  accounts: Account[];
  assets: Asset[];
  debts: Debt[];
  investments: Investment[];
}

export default function NetWorthCalculator({ accounts, assets, debts, investments }: NetWorthCalculatorProps) {
  const { settings } = useAppStore();
  
  // Calculate total assets
  const accountsValue = accounts.reduce((sum, account) => sum + (account.current_balance || account.opening_balance), 0);
  const assetsValue = assets.filter(a => a.is_active).reduce((sum, asset) => sum + asset.current_value, 0);
  const investmentsValue = investments.filter(i => i.is_active).reduce((sum, investment) => 
    sum + ((investment.current_price || investment.purchase_price) * investment.quantity), 0
  );
  
  const totalAssets = accountsValue + assetsValue + investmentsValue;
  
  // Calculate total liabilities
  const totalLiabilities = debts.filter(d => d.is_active).reduce((sum, debt) => sum + debt.current_balance, 0);
  
  // Net worth
  const netWorth = totalAssets - totalLiabilities;
  const isPositive = netWorth >= 0;

  const AssetSection = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
    <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
      <Box display="flex" alignItems="center" gap={1}>
        <Box sx={{ color: 'success.main' }}>
          {icon}
        </Box>
        <Typography variant="body2">{title}</Typography>
      </Box>
      <Typography variant="body2" fontWeight="bold" color="success.main">
        {formatCurrency(value, settings.baseCurrency)}
      </Typography>
    </Box>
  );

  const LiabilitySection = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
    <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
      <Box display="flex" alignItems="center" gap={1}>
        <Box sx={{ color: 'error.main' }}>
          {icon}
        </Box>
        <Typography variant="body2">{title}</Typography>
      </Box>
      <Typography variant="body2" fontWeight="bold" color="error.main">
        {formatCurrency(value, settings.baseCurrency)}
      </Typography>
    </Box>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Net Worth Calculator
        </Typography>

        {/* Net Worth Summary */}
        <Box mb={3} p={3} bgcolor={isPositive ? 'success.50' : 'error.50'} borderRadius={2} textAlign="center">
          <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={1}>
            {isPositive ? (
              <TrendingUp sx={{ color: 'success.main', fontSize: 32 }} />
            ) : (
              <TrendingDown sx={{ color: 'error.main', fontSize: 32 }} />
            )}
            <Typography variant="h3" fontWeight="bold" color={isPositive ? 'success.main' : 'error.main'}>
              {formatCurrency(Math.abs(netWorth), settings.baseCurrency)}
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary">
            Net Worth
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Assets */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" color="success.main" gutterBottom>
                Assets
              </Typography>
              
              <AssetSection 
                title="Cash & Bank Accounts"
                value={accountsValue}
                icon={<AccountBalance />}
              />
              
              <AssetSection 
                title="Investments"
                value={investmentsValue}
                icon={<TrendingUp />}
              />
              
              <AssetSection 
                title="Other Assets"
                value={assetsValue}
                icon={<TrendingUp />}
              />
              
              <Divider sx={{ my: 1 }} />
              
              <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
                <Typography variant="body1" fontWeight="bold">Total Assets</Typography>
                <Typography variant="body1" fontWeight="bold" color="success.main">
                  {formatCurrency(totalAssets, settings.baseCurrency)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Liabilities */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" color="error.main" gutterBottom>
                Liabilities
              </Typography>
              
              <LiabilitySection 
                title="Total Debts"
                value={totalLiabilities}
                icon={<CreditCard />}
              />
              
              <Divider sx={{ my: 1 }} />
              
              <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
                <Typography variant="body1" fontWeight="bold">Total Liabilities</Typography>
                <Typography variant="body1" fontWeight="bold" color="error.main">
                  {formatCurrency(totalLiabilities, settings.baseCurrency)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Financial Ratios */}
        <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            Financial Health Indicators
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">
                Debt-to-Asset Ratio
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : 0}%
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">
                Investment Allocation
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {totalAssets > 0 ? ((investmentsValue / totalAssets) * 100).toFixed(1) : 0}%
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">
                Liquidity Ratio
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {totalAssets > 0 ? ((accountsValue / totalAssets) * 100).toFixed(1) : 0}%
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}