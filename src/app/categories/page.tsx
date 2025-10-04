"use client";
import * as React from "react";
import { Card, CardContent, Stack, Typography, Chip, Grid, Box, IconButton, Fade, CircularProgress, Divider, Avatar, Badge, Tooltip, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SavingsIcon from "@mui/icons-material/Savings";
import CategoryIcon from "@mui/icons-material/Category";
import CategoryForm from "@components/CategoryForm";
import { useAppStore } from "@lib/store";
import { Category } from "@lib/types";
import { CATEGORY_TYPES, FADE_TIMEOUT, LOADING_DELAY } from "@lib/constants";

export default function CategoriesPage() {
  const { categories, deleteCategory } = useAppStore();
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), LOADING_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const mainCategories = categories.filter(c => !c.parent_id);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parent_id === parentId);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const typeIcons = {
    income: <TrendingUpIcon />,
    expense: <TrendingDownIcon />,
    savings: <SavingsIcon />
  };

  const typeColors = {
    income: 'success.main',
    expense: 'error.main',
    savings: 'info.main'
  };

  return (
    <Fade in timeout={FADE_TIMEOUT}>
    <Stack spacing={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <CategoryIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">Categories</Typography>
            <Typography variant="body2" color="text.secondary">
              {categories.length} total categories
            </Typography>
          </Box>
        </Box>
        <CategoryForm />
      </Box>

      <Grid container spacing={3}>
        {CATEGORY_TYPES.map(type => {
          const typeCategories = mainCategories.filter(c => c.type === type);
          return (
          <Grid item xs={12} md={4} key={type}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: typeColors[type as keyof typeof typeColors], width: 40, height: 40 }}>
                      {typeIcons[type as keyof typeof typeIcons]}
                    </Avatar>
                    <Typography variant="h6" textTransform="capitalize">{type}</Typography>
                  </Box>
                  <Badge badgeContent={typeCategories.length} color="primary" />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  {typeCategories.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">No categories yet</Typography>
                    </Paper>
                  ) : (
                    typeCategories.map(cat => (
                      <Paper key={cat.id} variant="outlined" sx={{ p: 1.5 }}>
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip 
                              label={cat.name}
                              color="primary" 
                              size="small"
                            />
                            <Chip 
                              label={cat.currency || "THB"}
                              size="small"
                              variant="outlined"
                            />
                            <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                              <CategoryForm editCategory={cat} />
                              <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => deleteCategory(cat.id)} color="error">
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Stack>
                          {getSubcategories(cat.id).length > 0 && (
                            <Box sx={{ pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                              <Stack spacing={0.5}>
                                {getSubcategories(cat.id).map(sub => (
                                  <Stack key={sub.id} direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                                    <Chip 
                                      label={sub.name}
                                      size="small" 
                                      variant="outlined" 
                                    />
                                    <Chip 
                                      label={sub.currency || "THB"}
                                      size="small"
                                      variant="outlined"
                                    />
                                    <CategoryForm editCategory={sub} />
                                    <Tooltip title="Delete">
                                      <IconButton size="small" onClick={() => deleteCategory(sub.id)} color="error">
                                        <DeleteIcon fontSize="inherit" />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      </Paper>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )})}
      </Grid>
    </Stack>
    </Fade>
  );
}
