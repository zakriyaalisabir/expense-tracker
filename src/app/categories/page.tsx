"use client";
import * as React from "react";
import { Card, CardContent, Stack, Typography, Chip, Grid, Box, IconButton, Fade, CircularProgress, Divider } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CategoryForm from "@components/CategoryForm";
import { useAppStore } from "@lib/store";
import { Category } from "@lib/types";

export default function CategoriesPage() {
  const { categories, deleteCategory } = useAppStore();
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
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

  return (
    <Fade in timeout={500}>
    <Stack spacing={3}>
      <Box>
        <CategoryForm />
      </Box>
      <Divider />
      <Grid container spacing={2}>
        {["income", "expense", "savings"].map(type => (
          <Grid item xs={12} md={4} key={type}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom textTransform="capitalize">{type}</Typography>
                <Stack spacing={1}>
                  {mainCategories.filter(c => c.type === type).map(cat => (
                    <Box key={cat.id}>
                      <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                        <Chip 
                          label={`${cat.name} (${cat.currency || "THB"})`} 
                          color="primary" 
                          sx={{ mb: 0.5 }} 
                        />
                        <CategoryForm editCategory={cat} />
                        <IconButton size="small" onClick={() => deleteCategory(cat.id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Box sx={{ ml: 2 }}>
                        {getSubcategories(cat.id).map(sub => (
                          <Stack key={sub.id} direction="row" spacing={0.5} alignItems="center" display="inline-flex" sx={{ mr: 1, mb: 0.5 }}>
                            <Chip 
                              label={`${sub.name} (${sub.currency || "THB"})`} 
                              size="small" 
                              variant="outlined" 
                            />
                            <CategoryForm editCategory={sub} />
                            <IconButton size="small" onClick={() => deleteCategory(sub.id)} color="error">
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          </Stack>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
    </Fade>
  );
}
