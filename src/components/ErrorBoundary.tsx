"use client";
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Box } from '@mui/material';
import { logger } from '@lib/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('React Error Boundary caught error', error, { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={3}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Reload
            </Button>
          }>
            Something went wrong. Please try reloading the page.
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}