import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { paths } from "../paths";
import {
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Drawer,
  IconButton,
  Box,
} from "@mui/material";
import { ChevronDown, ChevronUp, Menu } from "lucide-react";
import type { PathItem } from "../types/paths.types";
import UserProfile from "./user-profile";

type Props = {
  children: ReactNode;
};

const DRAWER_WIDTH = 256;

const Layout = ({ children }: Props) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (pathname: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [pathname]: !prev[pathname],
    }));
  };

  // Auto-expand parent menu if child is active
  useEffect(() => {
    paths.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => child.link === location.pathname,
        );
        if (hasActiveChild) {
          setOpenMenus((prev) => ({ ...prev, [item.pathname]: true }));
        }
      }
    });
  }, [location.pathname]);

  const isActive = (link: string) => location.pathname === link;

  const renderMenuItem = (item: PathItem) => {
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <div key={item.pathname}>
          <ListItemButton
            onClick={() => handleMenuClick(item.pathname)}
            className="!px-3 !py-2 !rounded-md hover:!bg-gray-100"
          >
            <ListItemText
              primary={item.pathname}
              primaryTypographyProps={{
                className: "!text-sm !text-gray-700",
              }}
            />
            {openMenus[item.pathname] ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </ListItemButton>
          <Collapse in={openMenus[item.pathname]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => {
                const active = isActive(child.link!);
                return (
                  <Link
                    key={child.link}
                    to={child.link!}
                    className="no-underline"
                  >
                    <ListItemButton
                      className={`!pl-8 !py-2 !rounded-md hover:!bg-gray-100 ${
                        active ? "!bg-green-50" : ""
                      }`}
                    >
                      <ListItemText
                        primary={child.pathname}
                        primaryTypographyProps={{
                          className: `!text-sm ${
                            active
                              ? "!text-green-700 !font-medium"
                              : "!text-gray-700"
                          }`,
                        }}
                      />
                    </ListItemButton>
                  </Link>
                );
              })}
            </List>
          </Collapse>
        </div>
      );
    }

    const active = isActive(item.link!);
    return (
      <Link key={item.link} to={item.link!} className="no-underline">
        <ListItemButton
          className={`!px-3 !py-2 !rounded-md hover:!bg-gray-100 ${
            active ? "!bg-green-50" : ""
          }`}
        >
          <ListItemText
            primary={item.pathname}
            primaryTypographyProps={{
              className: `!text-sm ${
                active ? "!text-green-700 !font-medium" : "!text-gray-700"
              }`,
            }}
          />
        </ListItemButton>
      </Link>
    );
  };

  const drawerContent = (
    <Box>
      <Box className="p-4">
        <div className="text-lg font-semibold text-gray-900 mb-6">Farmora</div>
      </Box>
      <List component="nav" disablePadding className="px-4">
        {paths.map((item) => renderMenuItem(item))}
      </List>
    </Box>
  );

  return (
    <Box className="flex h-screen bg-gray-50">
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: "100%", lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { xs: 0, lg: `${DRAWER_WIDTH}px` },
        }}
        className="flex flex-col"
      >
        {/* Header */}
        <Box
          component="header"
          className="h-16 bg-white border-b border-gray-200"
          sx={{
            position: "fixed",
            top: 0,
            right: 0,
            left: { xs: 0, lg: `${DRAWER_WIDTH}px` },
            zIndex: (theme) => {
	    return theme.zIndex.drawer - 1},
          }}
        >
          <div className="px-6 h-full flex items-center justify-between">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { lg: "none" } }}
            >
              <Menu className="w-6 h-6" />
            </IconButton>
            <div className="flex-1 flex justify-end">
              <UserProfile />
            </div>
          </div>
        </Box>

        {/* Page content */}
        <Box className="mt-16 flex-1 overflow-y-auto p-6">{children}</Box>
      </Box>
    </Box>
  );
};

export default Layout;
