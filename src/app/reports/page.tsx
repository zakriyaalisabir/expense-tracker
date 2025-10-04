"use client";
import * as React from "react";
import { Card, CardContent, Button, Stack, TextField, Typography, Box, Avatar, Divider } from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useAppStore } from "@lib/store";

function exportCSV(filename: string, rows: any[]) {
  const headers = Object.keys(rows[0] ?? {});
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage(){
  const { transactions, categories, accounts } = useAppStore();
  const [from,setFrom] = React.useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10));
  const [to,setTo] = React.useState(new Date().toISOString().slice(0,10));
  function doExport(){
    const filtered = transactions.filter(t => {
      const d = t.date.slice(0,10);
      return d >= from && d <= to;
    }).map(t => ({
      id: t.id, date: t.date, type: t.type, amount: t.amount, currency: t.currency,
      account: accounts.find(a=>a.id===t.account_id)?.name ?? t.account_id,
      category: categories.find(c=>c.id===t.category_id)?.name ?? t.category_id,
      tags: t.tags.join(";"), description: t.description ?? "", base_amount: t.base_amount
    }));
    if (filtered.length) exportCSV(`report_${from}_to_${to}.csv`, filtered);
  }
  return (
    <Stack spacing={3}>
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
          <AssessmentIcon fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">Reports</Typography>
          <Typography variant="body2" color="text.secondary">Export and print reports</Typography>
        </Box>
      </Box>
      <Divider />
    <Card><CardContent>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ my: 2 }}>
        <TextField type="date" label="From" value={from} onChange={e=>setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField type="date" label="To" value={to} onChange={e=>setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
        <Button variant="contained" onClick={doExport}>Export CSV</Button>
        <Button variant="outlined" onClick={()=>window.print()}>Print</Button>
      </Stack>
      <Typography variant="body2" color="text.secondary">Exports current transactions in range as CSV. Use print for a clean printable summary.</Typography>
    </CardContent></Card>
    </Stack>
  );
}
