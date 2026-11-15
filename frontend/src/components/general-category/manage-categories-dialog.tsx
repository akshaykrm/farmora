import generalCategory from "@api/general-category.api";
import type {
  GeneralCategory,
  GeneralCategoryKind,
} from "@app-types/general-category.types";
import { Dialog, DialogActions, DialogContent } from "@components/dialog";
import useGetGeneralCategories from "@hooks/use-get-general-categories";
import usePermissions from "@hooks/use-permissions";
import { Button, MenuItem, TextField } from "@mui/material";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

type Props = {
  kind: GeneralCategoryKind;
  isOpen: boolean;
  onClose: () => void;
};

const PERMISSION_PREFIX = {
  expense: "general_expense",
  sale: "general_sales",
} as const;

const ManageCategoriesDialog = ({ kind, isOpen, onClose }: Props) => {
  const { data: categories, refresh } = useGetGeneralCategories(kind);
  const { can } = usePermissions();
  const prefix = PERMISSION_PREFIX[kind];

  const [name, setName] = useState("");
  const [editing, setEditing] = useState<GeneralCategory | null>(null);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setStatus("active");
    setEditing(null);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const startEdit = (category: GeneralCategory) => {
    setEditing(category);
    setName(category.name);
    setStatus(category.status);
    setError("");
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    const payload = { name: trimmed, status };
    const res = editing
      ? await generalCategory.updateById(kind, editing.id, payload)
      : await generalCategory.create(kind, payload);

    if (res.status === "success") {
      reset();
      refresh();
    } else if (res.status === "validation_error") {
      setError(res.error?.[0]?.message ?? "Invalid category");
    } else if (res.status === "failed") {
      setError(typeof res.data === "string" ? res.data : "Failed to save");
    } else {
      setError("Network error");
    }
  };

  const handleDelete = async (category: GeneralCategory) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await generalCategory.deleteById(kind, category.id);
      if (editing?.id === category.id) reset();
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const canSave = editing ? can(`${prefix}:edit`) : can(`${prefix}:write`);

  return (
    <Dialog isOpen={isOpen} headerTitle="Manage Categories" onClose={handleClose}>
      <DialogContent>
        {canSave && (
          <div className="flex gap-2 items-start mb-4">
            <TextField
              label={editing ? "Rename category" : "New category"}
              size="small"
              fullWidth
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
              error={Boolean(error)}
              helperText={error}
            />
            {editing && (
              <TextField
                select
                size="small"
                label="Status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "active" | "inactive")
                }
                sx={{ minWidth: 110 }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            )}
            <Button variant="contained" onClick={handleSave}>
              {editing ? <Check className="w-4 h-4" /> : "Add"}
            </Button>
            {editing && (
              <Button variant="outlined" onClick={reset}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {categories.length === 0 ? (
          <p className="text-sm text-brand-ink-soft">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-brand-border">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between py-2"
              >
                <span className="text-brand-ink">
                  {category.name}
                  {category.status === "inactive" && (
                    <span className="ml-2 text-xs text-brand-ink-muted">
                      (inactive)
                    </span>
                  )}
                </span>
                <span className="flex gap-3">
                  {can(`${prefix}:edit`) && (
                    <Pencil
                      className="w-4 h-4 cursor-pointer text-brand-ink-muted hover:text-brand-ink-soft"
                      onClick={() => startEdit(category)}
                    />
                  )}
                  {can(`${prefix}:delete`) && (
                    <Trash2
                      className="w-4 h-4 cursor-pointer text-brand-ink-muted hover:text-red-500"
                      onClick={() => handleDelete(category)}
                    />
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageCategoriesDialog;
