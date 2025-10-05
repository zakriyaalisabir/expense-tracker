"use client";
import * as React from "react";
import { Snackbar, Alert } from "@mui/material";
import { useAppStore } from "@lib/store";

export default function ErrorNotification() {
  const { error, clearError } = useAppStore();

  return (
    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={clearError}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={clearError} severity="error" variant="filled">
        {error}
      </Alert>
    </Snackbar>
  );
}