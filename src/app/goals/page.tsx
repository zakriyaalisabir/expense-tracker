"use client";
import * as React from "react";
import { Grid, Stack, Typography, Fade, CircularProgress, Box, Avatar, Divider } from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import GoalForm from "@components/GoalForm";
import GoalCard from "@components/GoalCard";
import { useAppStore } from "@lib/store";
import { FADE_TIMEOUT, LOADING_DELAY } from "@lib/constants";

export default function GoalsPage(){
  const goals = useAppStore(s => s.goals);
  const [loading, setLoading] = React.useState(true);

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
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <FlagIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">Goals</Typography>
            <Typography variant="body2" color="text.secondary">
              {goals.length} active goals
            </Typography>
          </Box>
        </Box>
        <GoalForm />
      </Box>
      <Divider />
      <Grid container spacing={3}>
        {goals.map(g => (
          <Grid item xs={12} md={6} key={g.id}>
            <GoalCard goal={g} />
          </Grid>
        ))}
      </Grid>
    </Stack>
    </Fade>
  );
}
