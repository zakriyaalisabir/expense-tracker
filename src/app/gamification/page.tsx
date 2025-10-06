"use client";
import { Container, Typography, Grid, Box, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import { useAppStore } from "../../lib/store";
import AchievementBadge from "../../components/AchievementBadge";
import ChallengeCard from "../../components/ChallengeCard";
import FinancialHealthScore from "../../components/FinancialHealthScore";
import StreakTracker from "../../components/StreakTracker";

export default function GamificationPage() {
  const [tabValue, setTabValue] = useState(0);
  const { achievements, challenges, healthScores, streaks } = useAppStore();

  const latestHealthScore = healthScores[healthScores.length - 1];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gamification & Motivation
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Track your financial habits, earn achievements, and stay motivated with challenges and streaks.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Achievements" />
          <Tab label="Challenges" />
          <Tab label="Streaks" />
          <Tab label="Health Score" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Your Achievements
          </Typography>
          {achievements.length > 0 ? (
            <Grid container spacing={2}>
              {achievements.map((achievement) => (
                <Grid item key={achievement.id}>
                  <AchievementBadge achievement={achievement} size="large" />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={8}>
              <Typography variant="body1" color="text.secondary">
                No achievements yet. Start tracking your expenses to earn your first badge! 🏆
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Active Challenges
          </Typography>
          {challenges.length > 0 ? (
            <Grid container spacing={2}>
              {challenges.map((challenge) => (
                <Grid item xs={12} md={6} key={challenge.id}>
                  <ChallengeCard challenge={challenge} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={8}>
              <Typography variant="body1" color="text.secondary">
                No active challenges. Create your first challenge to stay motivated! 💪
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <StreakTracker streaks={streaks} />
        </Box>
      )}

      {tabValue === 3 && (
        <Box>
          {latestHealthScore ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FinancialHealthScore healthScore={latestHealthScore} />
              </Grid>
            </Grid>
          ) : (
            <Box textAlign="center" py={8}>
              <Typography variant="body1" color="text.secondary">
                No health score data available. Add some transactions and budgets to calculate your financial health! 📊
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}