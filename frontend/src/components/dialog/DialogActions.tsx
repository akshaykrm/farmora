import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const DialogActions = ({ children }: Props) => {
  return (
    <div className="flex justify-end gap-3 border-t border-brand-border px-6 py-4">
      {children}
    </div>
  );
};

export default DialogActions;
