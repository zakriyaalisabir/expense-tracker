"use client";
import { Card, CardContent, Typography, LinearProgress, Box, Chip, Button } from "@mui/material";
import { Challenge } from "../lib/types";
import { useAppStore } from "../lib/store";
import { format, differenceInDays } from "date-fns";

interface ChallengeCardProps {
  challenge: Challenge;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { completeChallenge } = useAppStore();
  
  const progress = challenge.target_amount 
    ? (challenge.current_progress / challenge.target_amount) * 100
    : challenge.target_days 
    ? (challenge.current_progress / challenge.target_days) * 100
    : 0;

  const daysLeft = differenceInDays(new Date(challenge.end_date), new Date());
  const isExpired = daysLeft < 0;
  const isCompleted = challenge.is_completed || progress >= 100;

  const handleComplete = async () => {
    if (!isCompleted && progress >= 100) {
      await completeChallenge(challenge.id);
    }
  };

  return (
    <Card sx={{ mb: 2, opacity: isExpired ? 0.6 : 1 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {challenge.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {challenge.description}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            {isCompleted && (
              <Chip label="Completed" color="success" size="small" />
            )}
            {isExpired && !isCompleted && (
              <Chip label="Expired" color="error" size="small" />
            )}
            {!isCompleted && !isExpired && (
              <Chip 
                label={`${daysLeft} days left`} 
                color="primary" 
                size="small" 
              />
            )}
          </Box>
        </Box>

        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">Progress</Typography>
            <Typography variant="body2">
              {challenge.target_amount 
                ? `${challenge.current_progress.toFixed(0)} / ${challenge.target_amount.toFixed(0)}`
                : `${challenge.current_progress} / ${challenge.target_days} days`
              }
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(progress, 100)} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {format(new Date(challenge.start_date), "MMM dd")} - {format(new Date(challenge.end_date), "MMM dd")}
          </Typography>
          
          {progress >= 100 && !isCompleted && (
            <Button 
              variant="contained" 
              color="success" 
              size="small"
              onClick={handleComplete}
            >
              Claim Reward ({challenge.reward_points} pts)
            </Button>
          )}
          
          {challenge.reward_points > 0 && (
            <Chip 
              label={`${challenge.reward_points} points`} 
              size="small" 
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}