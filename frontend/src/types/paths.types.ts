import type { LucideIcon } from "lucide-react";

export type PathItem = {
  pathname: string;
  link?: string;
  children?: PathItem[];
  icon?: LucideIcon;
};

export type Paths = PathItem[];
