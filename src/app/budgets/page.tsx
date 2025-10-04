"use client";
import * as React from "react";
import { Card, CardContent, Grid, TextField, Button, Stack, Typography } from "@mui/material";
import { useAppStore } from "@lib/store";
import BudgetBar from "@components/BudgetBar";

export default function BudgetsPage(){
  const { addBudget, transactions } = useAppStore();
  const [month,setMonth] = React.useState(new Date().toISOString().slice(0,7));
  const [total,setTotal] = React.useState(30000);
  const spent = transactions.filter(t => t.type==="expense" && t.date.slice(0,7)===month).reduce((a,b)=>a+b.base_amount,0);
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card><CardContent>
          <Typography variant="h6">Monthly Budget</Typography>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Month" type="month" value={month} onChange={e=>setMonth(e.target.value)}/>
            <TextField label="Total" type="number" value={total} onChange={e=>setTotal(Number(e.target.value))}/>
            <Button variant="contained" onClick={()=>addBudget({ id:`bud_${month}`, month, total })}>Save</Button>
            <BudgetBar spent={spent} limit={total}/>
          </Stack>
        </CardContent></Card>
      </Grid>
    </Grid>
  );
}
