"use client";
import { Card, CardContent, Typography, Box, LinearProgress, Grid, Chip, IconButton } from "@mui/material";
import { CreditCard, Home, School, DirectionsCar, Business, Edit, Delete } from "@mui/icons-material";
import { Debt, DebtType } from "../lib/types";
import { useAppStore } from "../lib/store";
import { formatCurrency } from "../lib/currency";

const debtIcons: Record<DebtType, React.ReactNode> = {
  credit_card: <CreditCard />,
  mortgage: <Home />,
  student_loan: <School />,
  car_loan: <DirectionsCar />,
  business_loan: <Business />,
  personal_loan: <CreditCard />,
  other: <CreditCard />
};

interface DebtTrackerProps {
  debts: Debt[];
  onEdit?: (debt: Debt) => void;
}

const DebtCard = ({ debt, onEdit }: { debt: Debt; onEdit?: (debt: Debt) => void }) => {
  const { deleteDebt, settings } = useAppStore();
  const progress = ((debt.original_amount - debt.current_balance) / debt.original_amount) * 100;
  
  const monthsToPayoff = debt.minimum_payment > 0 
    ? Math.ceil(debt.current_balance / debt.minimum_payment)
    : 0;

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${debt.name}?`)) {
      await deleteDebt(debt.id);
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ color: 'primary.main' }}>
              {debtIcons[debt.debt_type]}
            </Box>
            <Box>
              <Typography variant="h6" noWrap>
                {debt.name}
              </Typography>
              <Chip 
                label={debt.debt_type.replace('_', ' ')} 
                size="small" 
                variant="outlined"
              />
            </Box>
          </Box>
          <Box>
            <IconButton size="small" onClick={() => onEdit?.(debt)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleDelete} color="error">
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box mb={2}>
          <Typography variant="h5" fontWeight="bold" color="error.main">
            {formatCurrency(debt.current_balance, settings.baseCurrency)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            of {formatCurrency(debt.original_amount, settings.baseCurrency)} original
          </Typography>
        </Box>

        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">Paid Off</Typography>
            <Typography variant="body2">{progress.toFixed(1)}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Interest Rate
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {debt.interest_rate}%
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Min Payment
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {formatCurrency(debt.minimum_payment, settings.baseCurrency)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Due Date
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {debt.due_date}th
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Payoff Time
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {monthsToPayoff}mo
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default function DebtTracker({ debts, onEdit }: DebtTrackerProps) {
  const { settings } = useAppStore();
  const activeDebts = debts.filter(d => d.is_active);
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.current_balance, 0);
  const totalOriginal = activeDebts.reduce((sum, d) => sum + d.original_amount, 0);
  const totalProgress = totalOriginal > 0 ? ((totalOriginal - totalDebt) / totalOriginal) * 100 : 0;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Debt Tracker
        </Typography>

        <Box mb={3} p={2} bgcolor="error.50" borderRadius={1}>
          <Typography variant="h4" fontWeight="bold" color="error.main">
            {formatCurrency(totalDebt, settings.baseCurrency)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Debt Remaining
          </Typography>
          <Box mt={1}>
            <LinearProgress 
              variant="determinate" 
              value={totalProgress} 
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary">
              {totalProgress.toFixed(1)}% paid off
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {activeDebts.map((debt) => (
            <Grid item xs={12} sm={6} md={4} key={debt.id}>
              <DebtCard debt={debt} onEdit={onEdit} />
            </Grid>
          ))}
        </Grid>

        {activeDebts.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              No active debts. Great job! 🎉
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}