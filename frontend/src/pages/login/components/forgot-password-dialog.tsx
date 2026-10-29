import { Dialog, DialogContent } from "@components/dialog";
import { Button } from "@mui/material";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultUsername?: string;
  onReset: (username: string) => void;
};

const ForgotPasswordDialog = ({ isOpen, onClose }: Props) => (
  <Dialog isOpen={isOpen} headerTitle="Reset password" onClose={onClose}>
    <DialogContent>
      <p className="mb-5 text-sm text-brand-ink-soft">
        Contact your account owner or Super Admin to reset your password.
        Password changes require an authenticated administrator.
      </p>
      <Button onClick={onClose} variant="contained">
        Back to sign in
      </Button>
    </DialogContent>
  </Dialog>
);

export default ForgotPasswordDialog;
