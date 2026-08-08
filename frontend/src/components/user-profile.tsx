import { useState } from "react";
import { Popover } from "@mui/material";
import { User, LogOut, UserRound } from "lucide-react";
import { useAuth, useAuthDispatch } from "@store/authentication/context";
import { useNavigate } from "react-router";
import { clearSession } from "@utils/session";

const UserProfile = () => {
  const { user } = useAuth();
  const dispatch = useAuthDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate("/profile");
  };

  const handleLogout = () => {
    clearSession();
    dispatch({ type: "LOGOUT", payload: { token: null, user: null } });
    handleClose();
    navigate("/login");
  };

  const open = Boolean(anchorEl);

  if (!user) return null;

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 rounded-lg border-none bg-transparent px-3 py-2 transition-colors hover:bg-brand-card-soft cursor-pointer"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary-soft">
          <User className="h-4 w-4 text-brand-primary-strong" />
        </div>
        <span className="text-sm font-medium text-brand-ink">{user.name}</span>
      </button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            className: "mt-2 min-w-[240px] shadow-lg",
          },
        }}
      >
        <div className="p-4">
          <div className="mb-3 border-b border-brand-border pb-3">
            <p className="mb-1 text-sm font-semibold text-brand-ink">
              {user.name}
            </p>
            <p className="mb-1 text-xs text-brand-ink-soft">@{user.username}</p>
            <p className="text-xs capitalize text-brand-ink-muted">{user.role}</p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleProfile}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg border-none bg-transparent px-3 py-2 text-sm text-brand-ink transition-colors hover:bg-brand-card-soft"
            >
              <UserRound className="h-4 w-4" />
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg border-none bg-transparent px-3 py-2 text-sm text-brand-danger transition-colors hover:bg-brand-danger-soft"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </Popover>
    </>
  );
};

export default UserProfile;
