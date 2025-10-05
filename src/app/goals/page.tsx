"use client";
import * as React from "react";
import { Grid, CircularProgress, Box, Alert, Typography, Divider } from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import GoalForm from "@components/GoalForm";
import GoalCard from "@components/GoalCard";
import { useAppStore } from "@lib/store";
import { LOADING_DELAY } from "@lib/constants";
import PageLayout from "@components/PageLayout";

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
    <PageLayout
      icon={FlagIcon}
      title="Goals"
      subtitle={`${goals.length} active goals`}
      actions={<GoalForm />}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Financial Goals:</strong> Set and track your savings goals with target amounts and dates. 
          Monitor progress automatically as you save towards your objectives.
        </Typography>
      </Alert>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={0} sx={{ columnGap: 3, rowGap: 3 }}>
        {goals.map(g => (
          <Grid item xs={12} md={6} key={g.id}>
            <GoalCard goal={g} />
          </Grid>
        ))}
      </Grid>
    </PageLayout>
  );
}
