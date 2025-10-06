"use client";
import { Container, Typography, Box, Button } from "@mui/material";
import { Add, Settings } from "@mui/icons-material";
import { useState } from "react";
import { useAppStore } from "../../lib/store";
import DashboardWidget from "../../components/DashboardWidget";
import { DashboardWidget as WidgetType, WidgetType as WidgetTypeEnum } from "../../lib/types";

export default function CustomDashboardPage() {
  const { dashboardWidgets, updateDashboardWidget, userId } = useAppStore();
  const [isEditMode, setIsEditMode] = useState(false);

  const addWidget = async (widgetType: WidgetTypeEnum) => {
    if (!userId) return;

    const newWidget: WidgetType = {
      id: crypto.randomUUID(),
      user_id: userId,
      widget_type: widgetType,
      position_x: 0,
      position_y: dashboardWidgets.length,
      width: 2,
      height: 1,
      is_visible: true,
      config: {},
    };

    await updateDashboardWidget(newWidget);
  };

  const availableWidgets: WidgetTypeEnum[] = [
    "balance_summary",
    "monthly_spending",
    "budget_progress",
    "goal_progress",
    "recent_transactions",
    "spending_by_category",
    "financial_health",
    "achievements",
    "challenges",
    "streaks",
    "net_worth",
    "investment_summary",
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Custom Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Customize your dashboard layout with widgets
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant={isEditMode ? "contained" : "outlined"}
            startIcon={<Settings />}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? "Exit Edit" : "Edit Layout"}
          </Button>
        </Box>
      </Box>

      {isEditMode && (
        <Box mb={3} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="h6" gutterBottom>
            Add Widgets
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {availableWidgets.map((widgetType) => (
              <Button
                key={widgetType}
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={() => addWidget(widgetType)}
              >
                {widgetType.replace("_", " ")}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
          minHeight: "60vh",
        }}
      >
        {dashboardWidgets
          .filter((widget) => widget.is_visible)
          .map((widget) => (
            <DashboardWidget key={widget.id} widget={widget} />
          ))}
      </Box>

      {dashboardWidgets.filter((w) => w.is_visible).length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No widgets to display
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Click `Edit Layout` to add widgets to your dashboard
          </Typography>
          <Button variant="contained" startIcon={<Settings />} onClick={() => setIsEditMode(true)}>
            Customize Dashboard
          </Button>
        </Box>
      )}
    </Container>
  );
}
