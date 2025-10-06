"use client";
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid } from "@mui/material";
import { useAppStore } from "../lib/store";
import { Challenge, ChallengeType } from "../lib/types";

interface ChallengeFormProps {
  open: boolean;
  onClose: () => void;
  challenge?: Challenge;
}

const challengeTypes: { value: ChallengeType; label: string; description: string }[] = [
  { value: "monthly_savings", label: "Monthly Savings", description: "Save a specific amount this month" },
  { value: "expense_reduction", label: "Expense Reduction", description: "Reduce expenses by a certain amount" },
  { value: "budget_adherence", label: "Budget Adherence", description: "Stay within budget for the entire month" },
  { value: "no_spend_days", label: "No Spend Days", description: "Have X number of days with no expenses" },
  { value: "category_limit", label: "Category Limit", description: "Limit spending in a specific category" },
  { value: "streak_challenge", label: "Streak Challenge", description: "Maintain a habit for X consecutive days" }
];

export default function ChallengeForm({ open, onClose, challenge }: ChallengeFormProps) {
  const { addChallenge, updateChallenge } = useAppStore();
  
  const [formData, setFormData] = useState({
    title: challenge?.title || "",
    description: challenge?.description || "",
    challenge_type: challenge?.challenge_type || "monthly_savings" as ChallengeType,
    target_amount: challenge?.target_amount || 0,
    target_days: challenge?.target_days || 0,
    start_date: challenge?.start_date || new Date().toISOString().split('T')[0],
    end_date: challenge?.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reward_points: challenge?.reward_points || 100
  });

  const selectedType = challengeTypes.find(t => t.value === formData.challenge_type);
  const needsAmount = ["monthly_savings", "expense_reduction", "category_limit"].includes(formData.challenge_type);
  const needsDays = ["no_spend_days", "streak_challenge"].includes(formData.challenge_type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const challengeData = {
      ...formData,
      target_amount: needsAmount ? formData.target_amount : undefined,
      target_days: needsDays ? formData.target_days : undefined
    };
    
    if (challenge) {
      await updateChallenge({ ...challenge, ...challengeData });
    } else {
      await addChallenge(challengeData);
    }
    
    onClose();
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {challenge ? "Edit Challenge" : "Create New Challenge"}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Challenge Title"
                value={formData.title}
                onChange={handleChange("title")}
                fullWidth
                required
                placeholder="e.g., Save $500 this month"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={handleChange("description")}
                fullWidth
                multiline
                rows={2}
                placeholder="Describe your challenge goals and motivation"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                select
                label="Challenge Type"
                value={formData.challenge_type}
                onChange={handleChange("challenge_type")}
                fullWidth
                required
                helperText={selectedType?.description}
              >
                {challengeTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            {needsAmount && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Target Amount"
                  type="number"
                  value={formData.target_amount}
                  onChange={handleChange("target_amount")}
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            )}
            
            {needsDays && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Target Days"
                  type="number"
                  value={formData.target_days}
                  onChange={handleChange("target_days")}
                  fullWidth
                  required
                  inputProps={{ min: 1, max: 365 }}
                />
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                value={formData.start_date}
                onChange={handleChange("start_date")}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
                type="date"
                value={formData.end_date}
                onChange={handleChange("end_date")}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Reward Points"
                type="number"
                value={formData.reward_points}
                onChange={handleChange("reward_points")}
                fullWidth
                inputProps={{ min: 0, max: 1000 }}
                helperText="Points earned when challenge is completed"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {challenge ? "Update" : "Create"} Challenge
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}