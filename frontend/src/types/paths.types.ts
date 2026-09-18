import type { LucideIcon } from "lucide-react";

export type PathAudience = "tenant" | "platform";

export type PathItem = {
  pathname: string;
  link?: string;
  children?: PathItem[];
  icon?: LucideIcon;
  permission?: string;
  audience?: PathAudience;
};

export type Paths = PathItem[];
