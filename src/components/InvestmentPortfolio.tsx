"use client";
import { Card, CardContent, Typography, Box, Grid, Chip, IconButton } from "@mui/material";
import { TrendingUp, TrendingDown, ShowChart, CurrencyBitcoin, Home, Edit, Delete } from "@mui/icons-material";
import { Investment, InvestmentType } from "../lib/types";
import { useAppStore } from "../lib/store";
import { formatCurrency } from "../lib/currency";

const investmentIcons: Record<InvestmentType, React.ReactNode> = {
  stock: <ShowChart />,
  bond: <TrendingUp />,
  crypto: <CurrencyBitcoin />,
  mutual_fund: <ShowChart />,
  etf: <ShowChart />,
  real_estate: <Home />,
  commodity: <TrendingUp />,
  other: <ShowChart />
};

interface InvestmentPortfolioProps {
  investments: Investment[];
  onEdit?: (investment: Investment) => void;
}

const InvestmentCard = ({ investment, onEdit }: { investment: Investment; onEdit?: (investment: Investment) => void }) => {
  const { deleteInvestment } = useAppStore();
  
  const currentValue = (investment.current_price || investment.purchase_price) * investment.quantity;
  const purchaseValue = investment.purchase_price * investment.quantity;
  const gainLoss = currentValue - purchaseValue;
  const gainLossPercent = (gainLoss / purchaseValue) * 100;
  const isGain = gainLoss >= 0;

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${investment.name}?`)) {
      await deleteInvestment(investment.id);
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ color: 'primary.main' }}>
              {investmentIcons[investment.investment_type]}
            </Box>
            <Box>
              <Typography variant="h6" noWrap>
                {investment.symbol}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {investment.name}
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton size="small" onClick={() => onEdit?.(investment)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleDelete} color="error">
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box mb={2}>
          <Typography variant="h5" fontWeight="bold">
            {formatCurrency(currentValue, investment.currency)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {investment.quantity} shares @ {formatCurrency(investment.current_price || investment.purchase_price, investment.currency)}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          {isGain ? (
            <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
          ) : (
            <TrendingDown sx={{ color: 'error.main', fontSize: 20 }} />
          )}
          <Typography 
            variant="body2" 
            fontWeight="bold"
            color={isGain ? 'success.main' : 'error.main'}
          >
            {isGain ? '+' : ''}{formatCurrency(gainLoss, investment.currency)}
          </Typography>
          <Chip 
            label={`${isGain ? '+' : ''}${gainLossPercent.toFixed(2)}%`}
            size="small"
            color={isGain ? 'success' : 'error'}
          />
        </Box>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Purchase Price
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {formatCurrency(investment.purchase_price, investment.currency)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Type
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {investment.investment_type.replace('_', ' ')}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default function InvestmentPortfolio({ investments, onEdit }: InvestmentPortfolioProps) {
  const activeInvestments = investments.filter(i => i.is_active);
  
  const totalCurrentValue = activeInvestments.reduce((sum, i) => 
    sum + ((i.current_price || i.purchase_price) * i.quantity), 0
  );
  
  const totalPurchaseValue = activeInvestments.reduce((sum, i) => 
    sum + (i.purchase_price * i.quantity), 0
  );
  
  const totalGainLoss = totalCurrentValue - totalPurchaseValue;
  const totalGainLossPercent = totalPurchaseValue > 0 ? (totalGainLoss / totalPurchaseValue) * 100 : 0;
  const isGain = totalGainLoss >= 0;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Investment Portfolio
        </Typography>

        <Box mb={3} p={2} bgcolor={isGain ? 'success.50' : 'error.50'} borderRadius={1}>
          <Typography variant="h4" fontWeight="bold" color={isGain ? 'success.main' : 'error.main'}>
            {formatCurrency(totalCurrentValue, 'USD')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Portfolio Value
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            {isGain ? (
              <TrendingUp sx={{ color: 'success.main' }} />
            ) : (
              <TrendingDown sx={{ color: 'error.main' }} />
            )}
            <Typography 
              variant="body2" 
              fontWeight="bold"
              color={isGain ? 'success.main' : 'error.main'}
            >
              {isGain ? '+' : ''}{formatCurrency(totalGainLoss, 'USD')} ({isGain ? '+' : ''}{totalGainLossPercent.toFixed(2)}%)
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {activeInvestments.map((investment) => (
            <Grid item xs={12} sm={6} md={4} key={investment.id}>
              <InvestmentCard investment={investment} onEdit={onEdit} />
            </Grid>
          ))}
        </Grid>

        {activeInvestments.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              No investments yet. Start building your portfolio! 📈
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}