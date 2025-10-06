"use client";
import { Card, CardContent, Typography, Box, LinearProgress, Grid } from "@mui/material";
import { TrendingUp, TrendingDown, Remove } from "@mui/icons-material";
import { HealthScore } from "../lib/types";

interface FinancialHealthScoreProps {
  healthScore: HealthScore;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "#4CAF50"; // Green
  if (score >= 60) return "#FF9800"; // Orange
  return "#F44336"; // Red
};

const getScoreIcon = (score: number) => {
  if (score >= 80) return <TrendingUp sx={{ color: getScoreColor(score) }} />;
  if (score >= 60) return <Remove sx={{ color: getScoreColor(score) }} />;
  return <TrendingDown sx={{ color: getScoreColor(score) }} />;
};

const ScoreItem = ({ label, score }: { label: string; score: number }) => (
  <Box mb={2}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
      <Typography variant="body2">{label}</Typography>
      <Box display="flex" alignItems="center" gap={1}>
        {getScoreIcon(score)}
        <Typography variant="body2" fontWeight="bold" color={getScoreColor(score)}>
          {score}
        </Typography>
      </Box>
    </Box>
    <LinearProgress 
      variant="determinate" 
      value={score} 
      sx={{ 
        height: 6, 
        borderRadius: 3,
        bgcolor: 'grey.200',
        '& .MuiLinearProgress-bar': {
          bgcolor: getScoreColor(score)
        }
      }}
    />
  </Box>
);

export default function FinancialHealthScore({ healthScore }: FinancialHealthScoreProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Financial Health Score
        </Typography>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          {healthScore.month}
        </Typography>

        <Box textAlign="center" mb={3}>
          <Typography 
            variant="h2" 
            fontWeight="bold" 
            color={getScoreColor(healthScore.overall_score)}
          >
            {healthScore.overall_score}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overall Score
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ScoreItem 
              label="Budget Adherence" 
              score={healthScore.budget_adherence_score} 
            />
          </Grid>
          <Grid item xs={12}>
            <ScoreItem 
              label="Savings Rate" 
              score={healthScore.savings_rate_score} 
            />
          </Grid>
          <Grid item xs={12}>
            <ScoreItem 
              label="Expense Consistency" 
              score={healthScore.expense_consistency_score} 
            />
          </Grid>
          <Grid item xs={12}>
            <ScoreItem 
              label="Goal Progress" 
              score={healthScore.goal_progress_score} 
            />
          </Grid>
          <Grid item xs={12}>
            <ScoreItem 
              label="Debt Management" 
              score={healthScore.debt_management_score} 
            />
          </Grid>
        </Grid>

        <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="caption" color="text.secondary">
            Your financial health is calculated based on budget adherence, savings rate, 
            expense patterns, goal progress, and debt management.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}