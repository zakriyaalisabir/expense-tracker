"use client";
import * as React from "react";
import { Grid, CircularProgress, Box } from "@mui/material";
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
      <Grid container spacing={3}>
        {goals.map(g => (
          <Grid item xs={12} md={6} key={g.id}>
            <GoalCard goal={g} />
          </Grid>
        ))}
      </Grid>
    </PageLayout>
  );
}
