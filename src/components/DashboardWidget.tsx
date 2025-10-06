"use client";
import { Card, CardContent, CardHeader, IconButton, Box } from "@mui/material";
import { Visibility, VisibilityOff, DragIndicator } from "@mui/icons-material";
import { DashboardWidget as WidgetType, WidgetType as WidgetTypeEnum } from "../lib/types";
import { useAppStore } from "../lib/store";
// import { useDrag, useDrop } from "react-dnd";

// Import widget components
import AchievementBadge from "./AchievementBadge";
import ChallengeCard from "./ChallengeCard";
import FinancialHealthScore from "./FinancialHealthScore";
import StreakTracker from "./StreakTracker";
import DebtTracker from "./DebtTracker";
import InvestmentPortfolio from "./InvestmentPortfolio";
import NetWorthCalculator from "./NetWorthCalculator";

interface DashboardWidgetProps {
  widget: WidgetType;
  onMove?: (dragIndex: number, hoverIndex: number) => void;
  index?: number;
}

const widgetTitles: Record<WidgetTypeEnum, string> = {
  balance_summary: "Balance Summary",
  monthly_spending: "Monthly Spending",
  budget_progress: "Budget Progress",
  goal_progress: "Goal Progress",
  recent_transactions: "Recent Transactions",
  spending_by_category: "Spending by Category",
  financial_health: "Financial Health",
  achievements: "Achievements",
  challenges: "Challenges",
  streaks: "Streaks",
  net_worth: "Net Worth",
  investment_summary: "Investment Summary"
};

export default function DashboardWidget({ widget, onMove, index }: DashboardWidgetProps) {
  const { 
    toggleWidgetVisibility, 
    achievements, 
    challenges, 
    healthScores, 
    streaks, 
    debts, 
    investments, 
    assets, 
    accounts 
  } = useAppStore();

  // Drag and drop temporarily disabled
  const isDragging = false;

  const handleToggleVisibility = async () => {
    await toggleWidgetVisibility(widget.id);
  };

  const renderWidgetContent = () => {
    switch (widget.widget_type) {
      case 'achievements':
        return (
          <Box display="flex" flexWrap="wrap" gap={1}>
            {achievements.slice(0, 6).map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} size="small" />
            ))}
          </Box>
        );
      
      case 'challenges':
        return (
          <Box>
            {challenges.slice(0, 2).map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </Box>
        );
      
      case 'financial_health':
        const latestHealthScore = healthScores[healthScores.length - 1];
        return latestHealthScore ? (
          <FinancialHealthScore healthScore={latestHealthScore} />
        ) : (
          <Box p={2}>No health score data available</Box>
        );
      
      case 'streaks':
        return <StreakTracker streaks={streaks} />;
      
      case 'net_worth':
        return (
          <NetWorthCalculator 
            accounts={accounts}
            assets={assets}
            debts={debts}
            investments={investments}
          />
        );
      
      case 'investment_summary':
        return <InvestmentPortfolio investments={investments} />;
      
      default:
        return (
          <Box p={2}>
            Widget content for {widget.widget_type} not implemented yet
          </Box>
        );
    }
  };

  return (
    <div>
      <Card 
        sx={{ 
          opacity: widget.is_visible ? 1 : 0.5,
          cursor: isDragging ? 'grabbing' : 'grab',
          gridColumn: `span ${widget.width}`,
          gridRow: `span ${widget.height}`,
          minHeight: 200
        }}
      >
        <CardHeader
          title={widgetTitles[widget.widget_type]}
          action={
            <Box>
              <IconButton size="small" sx={{ cursor: 'grab' }}>
                <DragIndicator />
              </IconButton>
              <IconButton size="small" onClick={handleToggleVisibility}>
                {widget.is_visible ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Box>
          }
          sx={{ pb: 1 }}
        />
        {widget.is_visible && (
          <CardContent sx={{ pt: 0 }}>
            {renderWidgetContent()}
          </CardContent>
        )}
      </Card>
    </div>
  );
}