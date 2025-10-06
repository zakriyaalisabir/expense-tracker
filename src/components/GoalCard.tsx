"use client";
import * as React from "react";
import { Card, CardContent, Typography, LinearProgress, Stack, IconButton, Box, Chip, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import { Goal } from "@lib/types";
import { goalProgress, useAppStore } from "@lib/store";
import GoalForm from "./GoalForm";

export default function GoalCard({ goal }:{ goal: Goal }){
  const { months, neededMonthly, pct } = goalProgress(goal);
  const { deleteGoal, toggleGoal, accounts } = useAppStore();
  const [editGoal, setEditGoal] = React.useState<Goal | undefined>();
  const isEnabled = goal.enabled !== false;
  const linkedAccount = accounts.find(a => a.id === goal.source_account_id);

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
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" sx={{ opacity: isEnabled ? 1 : 0.6 }}>{goal.name}</Typography>
              <Chip 
                label={isEnabled ? "Active" : "Disabled"} 
                color={isEnabled ? "success" : "default"} 
                size="small"
              />
            </Box>
            <Box>
              <Tooltip title={isEnabled ? "Disable Goal" : "Enable Goal"}>
                <IconButton size="small" onClick={() => toggleGoal(goal.id)}>
                  {isEnabled ? <ToggleOnIcon fontSize="small" color="success" /> : <ToggleOffIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => setEditGoal(goal)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={handleDelete}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={isEnabled ? pct : 0} 
            sx={{ my: 2, height: 10, borderRadius: 5, opacity: isEnabled ? 1 : 0.5 }} 
          />
          <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ opacity: isEnabled ? 1 : 0.6 }}>
            <Typography variant="body2">Progress: {isEnabled ? pct.toFixed(1) : '0.0'}%</Typography>
            <Typography variant="body2">Months left: {isEnabled ? months : '-'}</Typography>
            <Typography variant="body2">Needed / mo: {isEnabled ? new Intl.NumberFormat().format(neededMonthly) : '-'}</Typography>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ opacity: isEnabled ? 1 : 0.6 }}>
              Account: {linkedAccount?.name || 'Unknown'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ opacity: isEnabled ? 1 : 0.6 }}>
              Target: {new Date(goal.target_date).toLocaleDateString()}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
      {editGoal && <GoalForm editGoal={editGoal} onClose={() => setEditGoal(undefined)} />}
    </>
  );
}
