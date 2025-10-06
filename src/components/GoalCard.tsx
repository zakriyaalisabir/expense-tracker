"use client";
import * as React from "react";
import { Card, CardContent, Typography, LinearProgress, Stack, IconButton, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Goal } from "@lib/types";
import { goalProgress, useAppStore } from "@lib/store";
import GoalForm from "./GoalForm";

export default function GoalCard({ goal }:{ goal: Goal }){
  const { months, neededMonthly, pct } = goalProgress(goal);
  const deleteGoal = useAppStore(s => s.deleteGoal);
  const [editGoal, setEditGoal] = React.useState<Goal | undefined>();

  const handleDelete = async () => {
    if (confirm(`Delete goal "${goal.name}"?`)) {
      await deleteGoal(goal.id);
    }
  };

  return (
    <>
      <Card elevation={3}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="h6">{goal.name}</Typography>
            <Box>
              <IconButton size="small" onClick={() => setEditGoal(goal)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleDelete}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Stack>
          <LinearProgress variant="determinate" value={pct} sx={{ my: 2, height: 10, borderRadius: 5 }} />
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Typography variant="body2">Progress: {pct.toFixed(1)}%</Typography>
            <Typography variant="body2">Months left: {months}</Typography>
            <Typography variant="body2">Needed / mo: {new Intl.NumberFormat().format(neededMonthly)}</Typography>
          </Stack>
        </CardContent>
      </Card>
      {editGoal && <GoalForm editGoal={editGoal} onClose={() => setEditGoal(undefined)} />}
    </>
  );
}
