import type { PathItem, Paths } from "@app-types/paths.types";

type FilterOpts = {
  can: (key?: string) => boolean;
  isSuperAdmin: boolean;
};

const matchesAudience = (item: PathItem, isSuperAdmin: boolean) => {
  if (item.audience === "platform") return isSuperAdmin;
  if (item.audience === "tenant") return !isSuperAdmin;
  return true;
};

export const canSee = (item: PathItem, can: FilterOpts["can"]) => {
  if (item.permission && !can(item.permission)) return false;
  if (item.anyPermission && !item.anyPermission.some((key) => can(key))) {
    return false;
  }
  return true;
};

export const filterPaths = (items: Paths, opts: FilterOpts): Paths => {
  return items.flatMap((item) => {
    if (!matchesAudience(item, opts.isSuperAdmin)) {
      return [];
    }

    if (item.children?.length) {
      const children = filterPaths(item.children, opts);
      if (children.length === 0) {
        return [];
      }
      return [{ ...item, children }];
    }

    if (!canSee(item, opts.can)) {
      return [];
    }

    return [item];
  });
};

export const flattenPaths = (items: PathItem[]): PathItem[] => {
  const result: PathItem[] = [];
  items.forEach((item) => {
    if (item.link) {
      result.push(item);
    }
    if (item.children) {
      result.push(...flattenPaths(item.children));
    }
  });
  return result;
};
