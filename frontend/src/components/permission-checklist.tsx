import { Checkbox, InputAdornment, TextField } from "@mui/material";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Permission } from "@api/roles.api";
import {
  buildPermissionTree,
  filterPermissionTree,
  modulePermissionIds,
  permissionIds,
  selectionState,
  type ModuleNode,
  type PermissionNode,
  type SubmenuNode,
} from "@utils/permission-tree";

type Props = {
  permissions: Permission[];
  value: number[];
  onChange: (ids: number[]) => void;
};

const toggleSet = (current: Set<string>, key: string) => {
  const next = new Set(current);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  return next;
};

const PermissionChecklist = ({ permissions, value, onChange }: Props) => {
  const [query, setQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );
  const [expandedSubmenus, setExpandedSubmenus] = useState<Set<string>>(
    new Set(),
  );

  const selected = useMemo(() => new Set(value), [value]);
  const tree = useMemo(
    () => buildPermissionTree(permissions as PermissionNode[]),
    [permissions],
  );
  const visibleTree = useMemo(
    () => filterPermissionTree(tree, query),
    [tree, query],
  );
  const isSearching = query.trim().length > 0;

  const setIds = (ids: number[], shouldSelect: boolean) => {
    const next = new Set(value);
    ids.forEach((id) => {
      if (shouldSelect) {
        next.add(id);
      } else {
        next.delete(id);
      }
    });
    onChange([...next]);
  };

  const toggleIds = (ids: number[]) => {
    const state = selectionState(ids, selected);
    setIds(ids, !state.checked);
  };

  const togglePermission = (id: number) => {
    if (selected.has(id)) {
      onChange(value.filter((item) => item !== id));
      return;
    }
    onChange([...value, id]);
  };

  const isModuleOpen = (name: string) =>
    isSearching || expandedModules.has(name);
  const isSubmenuOpen = (moduleName: string, submenuName: string) =>
    isSearching || expandedSubmenus.has(`${moduleName}:${submenuName}`);

  const renderActions = (items: PermissionNode[]) => (
    <ul className="ml-8 space-y-0.5">
      {items.map((permission) => (
        <li key={permission.id}>
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-brand-card-soft">
            <Checkbox
              size="small"
              checked={selected.has(permission.id)}
              onChange={() => togglePermission(permission.id)}
              sx={{ p: 0.25 }}
            />
            <span className="text-sm text-brand-ink">
              {permission.actionLabel || permission.description}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );

  const renderSubmenu = (module: ModuleNode, submenu: SubmenuNode) => {
    const ids = permissionIds(submenu.permissions);
    const state = selectionState(ids, selected);
    const open = isSubmenuOpen(module.name, submenu.name);
    const key = `${module.name}:${submenu.name}`;

    return (
      <div key={key} className="ml-6">
        <div className="flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-brand-card-soft">
          <Checkbox
            size="small"
            checked={state.checked}
            indeterminate={state.indeterminate}
            onChange={() => toggleIds(ids)}
            sx={{ p: 0.25 }}
            inputProps={{ "aria-label": `Select all ${submenu.name}` }}
          />
          <button
            type="button"
            onClick={() => setExpandedSubmenus((prev) => toggleSet(prev, key))}
            className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
          >
            <span className="truncate text-sm font-medium text-brand-ink">
              {submenu.name}
            </span>
            <span className="text-xs text-brand-ink-muted">
              {state.selectedCount}/{state.total}
            </span>
            {open ? (
              <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-brand-ink-muted" />
            ) : (
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-brand-ink-muted" />
            )}
          </button>
        </div>
        {open && renderActions(submenu.permissions)}
      </div>
    );
  };

  const renderModule = (module: ModuleNode) => {
    const ids = modulePermissionIds(module);
    const state = selectionState(ids, selected);
    const open = isModuleOpen(module.name);

    return (
      <div key={module.name} className="border-b border-brand-border py-1 last:border-b-0">
        <div className="flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-brand-card-soft">
          <Checkbox
            size="small"
            checked={state.checked}
            indeterminate={state.indeterminate}
            onChange={() => toggleIds(ids)}
            sx={{ p: 0.25 }}
            inputProps={{ "aria-label": `Select all ${module.name}` }}
          />
          <button
            type="button"
            onClick={() =>
              setExpandedModules((prev) => toggleSet(prev, module.name))
            }
            className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
          >
            <span className="truncate text-sm font-semibold text-brand-ink">
              {module.name}
            </span>
            <span className="text-xs text-brand-ink-muted">
              {state.selectedCount}/{state.total}
            </span>
            {open ? (
              <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-brand-ink-muted" />
            ) : (
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-brand-ink-muted" />
            )}
          </button>
        </div>
        {open && (
          <div className="mt-1 space-y-1 pb-2">
            {module.permissions.length > 0 && renderActions(module.permissions)}
            {module.submenus.map((submenu) => renderSubmenu(module, submenu))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-md border border-brand-border">
      <div className="border-b border-brand-border p-2">
        <TextField
          size="small"
          fullWidth
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search permissions"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="h-4 w-4 text-brand-ink-muted" />
                </InputAdornment>
              ),
            },
          }}
        />
      </div>
      <div className="max-h-80 overflow-y-auto px-2 py-1">
        {visibleTree.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-brand-ink-muted">
            {permissions.length === 0
              ? "Loading permissions…"
              : "No permissions match your search"}
          </p>
        ) : (
          visibleTree.map(renderModule)
        )}
      </div>
    </div>
  );
};

export default PermissionChecklist;
