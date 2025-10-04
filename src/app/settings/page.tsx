"use client";
import * as React from "react";
import { Card, CardContent, TextField, MenuItem, Typography } from "@mui/material";
import { useAppStore } from "@lib/store";

export default function SettingsPage(){
  const { settings, setBaseCurrency } = useAppStore();
  return (
    <Card><CardContent>
      <Typography variant="h6">Settings</Typography>
      <TextField
        select
        label="Base Currency"
        value={settings.baseCurrency}
        onChange={(e)=>setBaseCurrency(e.target.value as any)}
        sx={{ mt: 2 }}
      >
        {["THB","USD","EUR","JPY"].map(c => (<MenuItem key={c} value={c}>{c}</MenuItem>))}
      </TextField>
    </CardContent></Card>
  );
}
