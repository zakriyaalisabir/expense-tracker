"use client";
import * as React from "react";
import { Grid, Card, CardContent, TextField, Button, MenuItem, Stack, Typography } from "@mui/material";
import { useAppStore } from "@lib/store";
import GoalCard from "@components/GoalCard";

export default function GoalsPage(){
  const { goals, addGoal, accounts } = useAppStore();
  const [form,setForm] = React.useState({ name:"", target_amount:0, target_date:new Date().toISOString().slice(0,10), monthly_contribution:0, source_account_id: accounts[0]?.id ?? "" });
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card><CardContent>
          <Typography variant="h6">Add Goal</Typography>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
            <TextField label="Target Amount" type="number" value={form.target_amount} onChange={e=>setForm({...form, target_amount:Number(e.target.value)})}/>
            <TextField label="Target Date" type="date" value={form.target_date} onChange={e=>setForm({...form, target_date:e.target.value})}/>
            <TextField label="Monthly Contribution" type="number" value={form.monthly_contribution} onChange={e=>setForm({...form, monthly_contribution:Number(e.target.value)})}/>
            <TextField select label="Source Account" value={form.source_account_id} onChange={e=>setForm({...form, source_account_id:e.target.value})}>
              {accounts.map(a=>(<MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>))}
            </TextField>
            <Button variant="contained" onClick={()=>addGoal({ id:`goal_${Math.random().toString(36).slice(2,10)}`, ...form })}>Save</Button>
          </Stack>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Stack spacing={2}>
          {goals.map(g => (<GoalCard key={g.id} goal={g}/>))}
        </Stack>
      </Grid>
    </Grid>
  );
}
