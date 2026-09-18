import type { Permission } from "@api/roles.api";

export type PermissionNode = Permission & {
  submenu?: string | null;
  action?: string;
  actionLabel?: string;
};

export type SubmenuNode = {
  name: string;
  permissions: PermissionNode[];
};

export type ModuleNode = {
  name: string;
  permissions: PermissionNode[];
  submenus: SubmenuNode[];
};

const ACTION_ORDER = ["read", "write", "edit", "delete"];

const actionIndex = (action?: string) => {
  const index = ACTION_ORDER.indexOf(action || "");
  return index === -1 ? ACTION_ORDER.length : index;
};

const sortActions = (permissions: PermissionNode[]) =>
  [...permissions].sort((a, b) => {
    if (a.action !== b.action) {
      return actionIndex(a.action) - actionIndex(b.action);
    }
    return a.key.localeCompare(b.key);
  });

export const permissionIds = (permissions: PermissionNode[]) =>
  permissions.map((permission) => permission.id);

export const modulePermissionIds = (module: ModuleNode) => [
  ...permissionIds(module.permissions),
  ...module.submenus.flatMap((submenu) => permissionIds(submenu.permissions)),
];

export const buildPermissionTree = (
  permissions: PermissionNode[],
): ModuleNode[] => {
  const modules = new Map<string, ModuleNode>();

  permissions.forEach((permission) => {
    const group = permission.group || "Other";
    if (!modules.has(group)) {
      modules.set(group, { name: group, permissions: [], submenus: [] });
    }
    const module = modules.get(group)!;
    if (permission.submenu) {
      let submenu = module.submenus.find(
        (item) => item.name === permission.submenu,
      );
      if (!submenu) {
        submenu = { name: permission.submenu, permissions: [] };
        module.submenus.push(submenu);
      }
      submenu.permissions.push(permission);
      return;
    }
    module.permissions.push(permission);
  });

  return [...modules.values()].map((module) => ({
    ...module,
    permissions: sortActions(module.permissions),
    submenus: module.submenus.map((submenu) => ({
      ...submenu,
      permissions: sortActions(submenu.permissions),
    })),
  }));
};

const matchesQuery = (permission: PermissionNode, query: string) => {
  const haystack = [
    permission.group,
    permission.submenu,
    permission.actionLabel,
    permission.action,
    permission.description,
    permission.key,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
};

export const filterPermissionTree = (
  modules: ModuleNode[],
  rawQuery: string,
): ModuleNode[] => {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return modules;

  return modules.flatMap((module) => {
    const moduleMatches = module.name.toLowerCase().includes(query);
    if (moduleMatches) return [module];

    const directPermissions = module.permissions.filter((permission) =>
      matchesQuery(permission, query),
    );
    const submenus = module.submenus.flatMap((submenu) => {
      if (submenu.name.toLowerCase().includes(query)) return [submenu];
      const permissions = submenu.permissions.filter((permission) =>
        matchesQuery(permission, query),
      );
      return permissions.length > 0 ? [{ ...submenu, permissions }] : [];
    });

    if (directPermissions.length === 0 && submenus.length === 0) {
      return [];
    }

    return [
      {
        ...module,
        permissions: directPermissions,
        submenus,
      },
    ];
  });
};

export const selectionState = (ids: number[], selected: Set<number>) => {
  const selectedCount = ids.filter((id) => selected.has(id)).length;
  return {
    checked: ids.length > 0 && selectedCount === ids.length,
    indeterminate: selectedCount > 0 && selectedCount < ids.length,
    selectedCount,
    total: ids.length,
  };
};
