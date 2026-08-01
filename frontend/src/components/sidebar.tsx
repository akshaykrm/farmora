import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link, useLocation } from "react-router";
import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { paths } from "../paths";
import type { PathItem } from "../types/paths.types";

export const SIDEBAR_WIDTH = 256;
export const SIDEBAR_COLLAPSED_WIDTH = 76;

type Props = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

const hasChildren = (item: PathItem) =>
  Boolean(item.children && item.children.length > 0);

const itemBaseClasses =
  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors";
const activeClasses = "bg-brand-primary-soft text-brand-primary-strong font-medium";
const normalClasses =
  "text-brand-ink-soft hover:bg-brand-card-soft hover:text-brand-ink";

const Sidebar = ({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileClose,
}: Props) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [flyout, setFlyout] = useState<{ item: PathItem; top: number } | null>(
    null,
  );
  const railRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const isActive = (link: string) => location.pathname === link;
  const isParentActive = (item: PathItem) =>
    Boolean(item.children?.some((child) => isActive(child.link ?? "")));

  const scheduleClose = () => {
    if (closeTimer.current) return;
    closeTimer.current = window.setTimeout(() => {
      setFlyout(null);
      closeTimer.current = null;
    }, 150);
  };

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // Auto-expand parent if a child route is active
  useEffect(() => {
    paths.forEach((item) => {
      if (!item.children?.length) return;
      const hasActiveChild = item.children.some(
        (child) => child.link === location.pathname,
      );
      if (hasActiveChild) {
        setOpenMenus((prev) => ({ ...prev, [item.pathname]: true }));
      }
    });
  }, [location.pathname]);

  // Close collapsed flyout on route change
  useEffect(() => {
    setFlyout(null);
  }, [location.pathname]);

  // Close flyout when clicking outside the rail / flyout
  useEffect(() => {
    if (!flyout) return;
    const onMouseDown = (e: globalThis.MouseEvent) => {
      const target = e.target as Node;
      if (railRef.current?.contains(target)) return;
      if (flyoutRef.current?.contains(target)) return;
      setFlyout(null);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [flyout]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const handleMenuClick = (pathname: string) => {
    setOpenMenus((prev) => ({ ...prev, [pathname]: !prev[pathname] }));
  };

  const getFlyoutTop = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return Math.min(Math.max(8, rect.top), window.innerHeight - 220);
  };

  const handleFlyoutToggle = (item: PathItem, e: MouseEvent<HTMLButtonElement>) => {
    cancelClose();
    if (flyout?.item.pathname === item.pathname) {
      setFlyout(null);
      return;
    }
    setFlyout({ item, top: getFlyoutTop(e) });
  };

  const handleFlyoutHover = (item: PathItem, e: MouseEvent<HTMLButtonElement>) => {
    if (flyout?.item.pathname === item.pathname) return;
    cancelClose();
    setFlyout({ item, top: getFlyoutTop(e) });
  };

  const renderBrand = (full: boolean, withClose = false) => (
    <div className="flex h-16 shrink-0 items-center border-b border-brand-border px-4">
      <Link
        to="/dashboard"
        onClick={withClose ? onMobileClose : undefined}
        className={`flex min-w-0 items-center gap-3 ${
          full ? "" : "w-full justify-center"
        }`}
      >
        <img
          src="/logo-mark.svg"
          alt="Farmora"
          className="h-8 w-8 shrink-0"
        />
        {full && (
          <span className="text-lg font-semibold whitespace-nowrap text-brand-ink">
            Farmora
          </span>
        )}
      </Link>
      {withClose && (
        <button
          type="button"
          onClick={onMobileClose}
          title="Close menu"
          className="ml-auto rounded-md p-1.5 text-brand-ink-soft transition-colors hover:bg-brand-card-soft hover:text-brand-ink"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  const renderFullLeaf = (item: PathItem) => {
    const Icon = item.icon;
    const active = isActive(item.link ?? "");
    return (
      <li key={item.link}>
        <Link
          to={item.link!}
          className={`${itemBaseClasses} ${active ? activeClasses : normalClasses}`}
        >
          {Icon && <Icon className="h-5 w-5 shrink-0" />}
          <span className="flex-1 truncate">{item.pathname}</span>
        </Link>
      </li>
    );
  };

  const renderFullParent = (item: PathItem) => {
    const open = Boolean(openMenus[item.pathname]);
    const Icon = item.icon;
    const active = isParentActive(item);
    return (
      <li key={item.pathname}>
        <button
          type="button"
          onClick={() => handleMenuClick(item.pathname)}
          className={`${itemBaseClasses} ${active ? activeClasses : normalClasses}`}
        >
          {Icon && <Icon className="h-5 w-5 shrink-0" />}
          <span className="flex-1 truncate text-left">{item.pathname}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
        {open && (
          <ul className="mt-0.5 ml-4 space-y-0.5 border-l border-brand-border pl-2">
            {item.children?.map((child) => renderFullLeaf(child))}
          </ul>
        )}
      </li>
    );
  };

  const renderFullItem = (item: PathItem) =>
    hasChildren(item) ? renderFullParent(item) : renderFullLeaf(item);

  const renderCollapsedLeaf = (item: PathItem) => {
    const Icon = item.icon;
    const active = isActive(item.link ?? "");
    return (
      <li key={item.link} className="flex justify-center">
        <Link
          to={item.link!}
          title={item.pathname}
          className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors ${
            active
              ? "bg-brand-primary-soft text-brand-accent"
              : "text-brand-ink-soft hover:bg-brand-card-soft hover:text-brand-ink"
          }`}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </Link>
      </li>
    );
  };

  const renderCollapsedParent = (item: PathItem) => {
    const Icon = item.icon;
    const active = isParentActive(item);
    return (
      <li key={item.pathname} className="flex justify-center">
        <button
          type="button"
          title={item.pathname}
          onClick={(e) => handleFlyoutToggle(item, e)}
          onMouseEnter={(e) => handleFlyoutHover(item, e)}
          className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors ${
            active
              ? "bg-brand-primary-soft text-brand-accent"
              : "text-brand-ink-soft hover:bg-brand-card-soft hover:text-brand-ink"
          }`}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </button>
      </li>
    );
  };

  const renderCollapsedItem = (item: PathItem) =>
    hasChildren(item) ? renderCollapsedParent(item) : renderCollapsedLeaf(item);

  return (
    <>
      {/* Desktop rail */}
      <aside
        className="fixed inset-y-0 left-0 z-20 hidden lg:block"
        style={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      >
        <div
          ref={railRef}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="flex h-full flex-col border-r border-brand-border bg-brand-card transition-[width] duration-300 ease-in-out"
          style={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
        >
          {renderBrand(!collapsed)}
          <nav
            className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4"
            onScroll={() => setFlyout(null)}
          >
            <ul className={collapsed ? "space-y-2" : "space-y-1"}>
              {paths.map((item) =>
                collapsed ? renderCollapsedItem(item) : renderFullItem(item),
              )}
            </ul>
          </nav>
        </div>

        {/* Collapse / expand toggle */}
        <button
          type="button"
          onClick={onToggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute top-4 right-0 z-10 hidden h-8 w-8 translate-x-1/2 items-center justify-center rounded-md border border-brand-border bg-brand-card text-brand-ink-soft shadow-brand-sm transition-colors hover:bg-brand-card-soft hover:text-brand-ink lg:flex"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>

        {/* Collapsed flyout */}
        {flyout && collapsed && (
          <div
            ref={flyoutRef}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="fixed z-30"
            style={{
              left: SIDEBAR_COLLAPSED_WIDTH + 8,
              top: flyout.top,
              width: 224,
              maxHeight: "calc(100vh - 16px)",
            }}
          >
            <div className="overflow-y-auto rounded-lg border border-brand-border bg-brand-card p-2 shadow-brand-lg">
              <p className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-brand-ink-muted">
                {flyout.item.pathname}
              </p>
              <ul className="space-y-0.5">
                {(flyout.item.children ?? []).map((child) =>
                  renderFullLeaf(child),
                )}
              </ul>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onMobileClose}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-brand-card shadow-brand-lg">
            {renderBrand(true, true)}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
              <ul className="space-y-1">
                {paths.map((item) => renderFullItem(item))}
              </ul>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
