import * as React from "react";
import { Card, CardContent, Typography } from "@mui/material";

type Props = { title: string; value: number; color?: "success" | "error" | "info" };

const MoneyCard = React.memo(({ title, value, color }: Props) => (
  <Card>
    <CardContent>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
      <Typography variant="h5" color={color}>{value.toFixed(2)}</Typography>
    </CardContent>
  </Card>
));

MoneyCard.displayName = "MoneyCard";
export default MoneyCard;
