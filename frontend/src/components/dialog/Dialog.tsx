import type { ReactNode } from "react";

type Props = {
  headerTitle: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

const Dialog = ({ headerTitle, children, isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-100 bg-black/40 overflow-y-auto`}
      onClick={onClose}
    >
      <div className="min-h-screen flex items-start justify-center p-4">
        <div
          className="bg-brand-card rounded-xl border border-brand-border shadow-brand-lg w-full max-w-md max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-brand-border px-6 py-4 shrink-0">
            <h2 className="text-lg font-semibold text-brand-ink">
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
