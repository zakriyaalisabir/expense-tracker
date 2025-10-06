"use client";
import * as React from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, MenuItem, ToggleButtonGroup, ToggleButton, Slide, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CategoryIcon from "@mui/icons-material/Category";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SavingsIcon from "@mui/icons-material/Savings";
import { TransitionProps } from "@mui/material/transitions";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
import { useAppStore, uid } from "@lib/store";
import { Category, CategoryType, CurrencyCode } from "@lib/types";
import { CATEGORY_TYPES } from "@lib/constants";
import { getAllCurrencies } from "@lib/utils/currency";

type Props = {
  editCategory?: Category;
  onClose?: () => void;
  autoOpen?: boolean;
};

export default function CategoryForm({ editCategory, onClose, autoOpen = false }: Props) {
  const { categories, addCategory, updateCategory, settings } = useAppStore();
  const allCurrencies = getAllCurrencies(settings);
  const [open, setOpen] = React.useState(autoOpen && !editCategory);
  const [type, setType] = React.useState<CategoryType>(editCategory?.type || "expense");
  const [name, setName] = React.useState(editCategory?.name || "");
  const [parentId, setParentId] = React.useState(editCategory?.parent_id || "");
  const [currency, setCurrency] = React.useState<CurrencyCode>(editCategory?.currency || "THB");

  const parentCategories = categories.filter(c => c.type === type && !c.parent_id && c.id !== editCategory?.id);

  React.useEffect(() => {
    if (editCategory) {
      setType(editCategory.type);
      setName(editCategory.name);
      setParentId(editCategory.parent_id || "");
      setCurrency(editCategory.currency || "THB");
      if (autoOpen) {
        setOpen(true);
      }
    }
  }, [editCategory, autoOpen]);

  React.useEffect(() => {
    if (autoOpen && !editCategory) {
      setOpen(true);
    }
  }, [autoOpen, editCategory]);

  async function submit() {
    if (!name.trim()) return;
    const data = {
      name: name.trim(),
      type,
      parent_id: parentId || undefined,
      currency
    };
    if (editCategory) {
      await updateCategory({ ...data, id: editCategory.id, user_id: editCategory.user_id });
    } else {
      await addCategory(data);
      setName("");
      setParentId("");
      setCurrency("THB");
      setType("expense");
    }
    setOpen(false);
    onClose?.();
  }

  return (
    <>
      {editCategory ? (
        <IconButton size="small" onClick={() => setOpen(true)} color="primary">
          <EditIcon fontSize="small" />
        </IconButton>
      ) : (
        <>
          <Button variant="contained" onClick={() => setOpen(true)} startIcon={<CategoryIcon />} size="small" fullWidth sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            Add Category
          </Button>
          <Button variant="contained" onClick={() => setOpen(true)} fullWidth sx={{ display: { xs: 'inline-flex', sm: 'none' }, minWidth: 'auto', px: 1 }}>
            <CategoryIcon fontSize="small" />
          </Button>
        </>
      )}
      <Dialog open={open} onClose={() => { setOpen(false); onClose?.(); }} fullWidth maxWidth="sm" TransitionComponent={Transition}>
        <DialogTitle>{editCategory ? "Edit" : "New"} Category</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <ToggleButtonGroup exclusive value={type} onChange={(_, v) => v && setType(v)} disabled={!!editCategory}>
              {CATEGORY_TYPES.map(t => {
                const icon = t === "income" ? <TrendingUpIcon fontSize="small" /> : t === "savings" ? <SavingsIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />;
                return (
                  <ToggleButton key={t} value={t}>
                    {icon}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>
            <TextField label="Category Name" value={name} onChange={e => setName(e.target.value)} />
            <TextField select label="Currency" value={currency} onChange={e => setCurrency(e.target.value as CurrencyCode)}>
              {allCurrencies.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            {parentCategories.length > 0 && (
              <TextField select label="Parent Category (Optional)" value={parentId} onChange={e => setParentId(e.target.value)}>
                <MenuItem value="">None (Main Category)</MenuItem>
                {parentCategories.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); onClose?.(); }}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!name.trim()}>{editCategory ? "Update" : "Save"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
