"use client";
import * as React from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, MenuItem, ToggleButtonGroup, ToggleButton, Slide, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { TransitionProps } from "@mui/material/transitions";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
import { useAppStore, uid } from "@lib/store";
import { Category, CategoryType, CurrencyCode } from "@lib/types";
import { CURRENCIES, CATEGORY_TYPES } from "@lib/constants";

type Props = { editCategory?: Category };

export default function CategoryForm({ editCategory }: Props) {
  const { categories, addCategory, updateCategory } = useAppStore();
  const [open, setOpen] = React.useState(false);
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
    }
  }, [editCategory]);

  function submit() {
    if (!name.trim()) return;
    const category: Category = {
      id: editCategory?.id || uid("cat"),
      name: name.trim(),
      type,
      parent_id: parentId || undefined,
      currency
    };
    editCategory ? updateCategory(category) : addCategory(category);
    if (!editCategory) {
      setName("");
      setParentId("");
      setCurrency("THB");
      setType("expense");
    }
    setOpen(false);
  }

  return (
    <>
      {editCategory ? (
        <IconButton size="small" onClick={() => setOpen(true)} color="primary">
          <EditIcon fontSize="small" />
        </IconButton>
      ) : (
        <Button variant="contained" onClick={() => setOpen(true)} startIcon={<AddIcon />}>
          Add Category
        </Button>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" TransitionComponent={Transition}>
        <DialogTitle>{editCategory ? "Edit" : "New"} Category</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <ToggleButtonGroup exclusive value={type} onChange={(_, v) => v && setType(v)} disabled={!!editCategory}>
              {CATEGORY_TYPES.map(t => (
                <ToggleButton key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</ToggleButton>
              ))}
            </ToggleButtonGroup>
            <TextField label="Category Name" value={name} onChange={e => setName(e.target.value)} />
            <TextField select label="Currency" value={currency} onChange={e => setCurrency(e.target.value as CurrencyCode)}>
              {CURRENCIES.map(c => (
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
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!name.trim()}>{editCategory ? "Save" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
