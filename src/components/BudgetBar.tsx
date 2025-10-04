"use client";
import * as React from "react";
import { LinearProgress, Box, Typography } from "@mui/material";

export default function BudgetBar({ spent, limit }:{ spent: number; limit: number; }){
  const pct = Math.min(100, (spent/limit)*100);
  const warn = pct >= 80 && pct < 100;
  const over = pct >= 100;
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="body2">Spent</Typography>
        <Typography variant="body2">{new Intl.NumberFormat().format(spent)} / {new Intl.NumberFormat().format(limit)}</Typography>
      </Box>
      <LinearProgress variant="determinate" value={pct} color={over ? "error" : warn ? "warning" : "primary"} sx={{ height: 10, borderRadius: 5, mt: 1 }} />
      <Typography variant="caption" color={over ? "error" : warn ? "warning.main" : "text.secondary"}>
        {over ? "Over budget!" : warn ? "Over 80% of budget" : "Within budget"}
      </Typography>
    </Box>
  );
}
