import type { ReactNode } from "react";
import { useTheme } from "@mui/material";

type Props = {
  headerTitle: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

const Dialog = ({ headerTitle, children, isOpen, onClose }: Props) => {
  if (!isOpen) return null;

const theme = useTheme()
  return (
    <div
      className={`fixed inset-0 z-${theme.zIndex.drawer + 1} bg-black/50 overflow-y-auto`}
      onClick={onClose}
    >
      <div className="min-h-screen flex items-start justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-gray-200 px-6 py-4 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">
              {headerTitle}
            </h2>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
export default Dialog;
