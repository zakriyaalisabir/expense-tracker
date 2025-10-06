"use client";
import React from "react";
import { Card, CardContent, Typography, Box, Grid, Chip, Button } from "@mui/material";
import { LocalFireDepartment, Timeline, TrendingUp, Savings } from "@mui/icons-material";
import { Streak, StreakType } from "../lib/types";
import { useAppStore } from "../lib/store";

const streakIcons: Record<StreakType, React.ReactNode> = {
  daily_tracking: <Timeline />,
  budget_adherence: <TrendingUp />,
  no_overspend: <LocalFireDepartment />,
  savings_goal: <Savings />,
  expense_logging: <Timeline />,
  goal_contribution: <Savings />
};

const streakLabels: Record<StreakType, string> = {
  daily_tracking: "Daily Tracking",
  budget_adherence: "Budget Adherence", 
  no_overspend: "No Overspending",
  savings_goal: "Savings Goal",
  expense_logging: "Expense Logging",
  goal_contribution: "Goal Contribution"
};

interface StreakTrackerProps {
  streaks: Streak[];
}

const StreakCard = ({ streak }: { streak: Streak }) => {
  const isActive = streak.is_active && streak.current_count > 0;
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        bgcolor: isActive ? 'primary.50' : 'grey.50',
        border: isActive ? '2px solid' : '1px solid',
        borderColor: isActive ? 'primary.main' : 'grey.200'
      }}
    >
      <CardContent sx={{ textAlign: 'center' }}>
        <Box sx={{ color: isActive ? 'primary.main' : 'grey.500', mb: 1 }}>
          {React.cloneElement(streakIcons[streak.streak_type] as React.ReactElement, { 
            sx: { fontSize: 32 } 
          })}
        </Box>
        
        <Typography variant="h4" fontWeight="bold" color={isActive ? 'primary.main' : 'grey.500'}>
          {streak.current_count}
        </Typography>
        
        <Typography variant="body2" gutterBottom>
          {streakLabels[streak.streak_type]}
        </Typography>
        
        <Chip 
          label={`Best: ${streak.best_count}`}
          size="small"
          variant="outlined"
          sx={{ mt: 1 }}
        />
        
        {isActive && (
          <Box mt={1}>
            <LocalFireDepartment sx={{ color: 'orange', fontSize: 16 }} />
            <Typography variant="caption" color="orange" ml={0.5}>
              On Fire!
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default function StreakTracker({ streaks }: StreakTrackerProps) {
  const { updateStreak } = useAppStore();
  const activeStreaks = streaks.filter(s => s.is_active && s.current_count > 0);
  const totalDays = activeStreaks.reduce((sum, s) => sum + s.current_count, 0);

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Streak Tracker
          </Typography>
          <Box textAlign="center">
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {totalDays}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Days
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {streaks.map((streak) => (
            <Grid item xs={6} sm={4} key={streak.id}>
              <StreakCard streak={streak} />
            </Grid>
          ))}
        </Grid>

        {activeStreaks.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Start tracking your expenses to build streaks!
            </Typography>
            <Button 
              variant="contained" 
              onClick={async () => {
                await updateStreak('daily_tracking', true);
                await updateStreak('expense_logging', true);
                await updateStreak('budget_adherence', true);
              }}
            >
              Initialize Streaks
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}