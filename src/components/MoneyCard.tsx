"use client";
import * as React from "react";
import { Card, CardContent, Typography } from "@mui/material";

export default function MoneyCard({ title, value, variant="h5", color }:{
  title: string; value: number; variant?: any; color?: "success"|"error"|"primary";
}){
  const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">{title}</Typography>
        <Typography variant={variant} color={color ? `${color}.main` : undefined}>
          {formatted}
        </Typography>
      </CardContent>
    </Card>
  );
}
