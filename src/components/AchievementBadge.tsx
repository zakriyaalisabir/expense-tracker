"use client";
import React from "react";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { EmojiEvents, TrendingUp, Savings, Timeline } from "@mui/icons-material";
import { Achievement, BadgeType } from "../lib/types";

const badgeIcons: Record<BadgeType, React.ReactNode> = {
  budget_keeper: <EmojiEvents />,
  saver: <Savings />,
  goal_achiever: <EmojiEvents />,
  streak_master: <Timeline />,
  first_transaction: <TrendingUp />,
  first_budget: <EmojiEvents />,
  first_goal: <Savings />,
  big_saver: <Savings />,
  consistent_tracker: <Timeline />,
  expense_cutter: <TrendingUp />,
  income_booster: <TrendingUp />,
};

const badgeColors: Record<BadgeType, string> = {
  budget_keeper: "#FFD700",
  saver: "#32CD32",
  goal_achiever: "#FF6347",
  streak_master: "#9370DB",
  first_transaction: "#87CEEB",
  first_budget: "#FFD700",
  first_goal: "#32CD32",
  big_saver: "#228B22",
  consistent_tracker: "#4169E1",
  expense_cutter: "#FF4500",
  income_booster: "#00CED1",
};

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "small" | "medium" | "large";
}

export default function AchievementBadge({ achievement, size = "medium" }: AchievementBadgeProps) {
  const iconSize = size === "small" ? 24 : size === "medium" ? 32 : 48;
  const cardSize = size === "small" ? 80 : size === "medium" ? 120 : 160;

  return (
    <Card
      sx={{
        width: cardSize,
        height: cardSize,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: badgeColors[achievement.badge_type] + "20",
        border: `2px solid ${badgeColors[achievement.badge_type]}`,
        cursor: "pointer",
        "&:hover": { transform: "scale(1.05)" },
        transition: "transform 0.2s",
      }}
    >
      <CardContent sx={{ textAlign: "center", p: 1 }}>
        <Box sx={{ color: badgeColors[achievement.badge_type], mb: 1, fontSize: iconSize }}>
          {badgeIcons[achievement.badge_type]}
        </Box>
        <Typography variant={size === "small" ? "caption" : "body2"} fontWeight="bold">
          {achievement.title}
        </Typography>
        {size !== "small" && (
          <Chip
            label={`${achievement.progress}%`}
            size="small"
            sx={{ mt: 0.5, bgcolor: badgeColors[achievement.badge_type], color: "white" }}
          />
        )}
      </CardContent>
    </Card>
  );
}
