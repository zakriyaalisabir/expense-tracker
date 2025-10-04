"use client";
import * as React from "react";
import { Card, CardContent, Typography, LinearProgress, Stack } from "@mui/material";
import { Goal } from "@lib/types";
import { goalProgress } from "@lib/store";

export default function GoalCard({ goal }:{ goal: Goal }){
  const { months, neededMonthly, pct } = goalProgress(goal);
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{goal.name}</Typography>
        <LinearProgress variant="determinate" value={pct} sx={{ my: 2, height: 10, borderRadius: 5 }} />
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Typography variant="body2">Progress: {pct.toFixed(1)}%</Typography>
          <Typography variant="body2">Months left: {months}</Typography>
          <Typography variant="body2">Needed / mo: {new Intl.NumberFormat().format(neededMonthly)}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
