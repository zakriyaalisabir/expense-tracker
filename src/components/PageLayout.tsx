"use client";
import * as React from "react";
import { Fade, Stack, Box, Avatar, Typography, Divider } from "@mui/material";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { FADE_TIMEOUT } from "@lib/constants";

interface PageLayoutProps {
  icon: React.ElementType<SvgIconProps>;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  disableDivider?: boolean;
  spacing?: number;
}

export default function PageLayout({
  icon: Icon,
  title,
  subtitle,
  actions,
  children,
  disableDivider = false,
  spacing = 3
}: PageLayoutProps) {
  return (
    <Fade in timeout={FADE_TIMEOUT}>
      <Stack spacing={spacing}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
              <Icon fontSize="large" sx={{ color: "white" }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">{title}</Typography>
              {subtitle ? (
                <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
              ) : null}
            </Box>
          </Box>
          {actions}
        </Box>
        {disableDivider ? null : <Divider />}
        {children}
      </Stack>
    </Fade>
  );
}
