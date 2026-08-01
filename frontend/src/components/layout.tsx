import type { ReactNode } from "react";
import { useState } from "react";
import { IconButton } from "@mui/material";
import { Menu } from "lucide-react";
import Sidebar from "./sidebar";
import ThemeToggle from "./ThemeToggle";
import UserProfile from "./user-profile";

type Props = {
  children: ReactNode;
};

const STORAGE_KEY = "farmora:sidebar-collapsed";

const getInitialCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const Layout = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const offsetClass = collapsed ? "lg:left-[76px]" : "lg:left-[256px]";
  const marginClass = collapsed ? "lg:ml-[76px]" : "lg:ml-[256px]";

  return (
    <div className="flex h-screen overflow-hidden bg-brand-canvas">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={handleToggleCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={`flex min-w-0 flex-1 flex-col transition-[margin-left] duration-300 ease-in-out ${marginClass}`}
      >
        <header
          className={`fixed top-0 right-0 z-10 flex h-16 items-center border-b border-brand-border bg-brand-card transition-[left] duration-300 ease-in-out ${offsetClass}`}
        >
          <div className="flex h-full w-full items-center px-6">
            <IconButton
              color="inherit"
              aria-label="open navigation"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { lg: "none" } }}
            >
              <Menu className="h-6 w-6" />
            </IconButton>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <UserProfile />
            </div>
          </div>
        </header>

        <main className="mt-16 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
