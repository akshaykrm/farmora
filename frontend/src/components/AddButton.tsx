import { Plus } from "lucide-react";
import Button from "@mui/material/Button";

type Props = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

const AddButton = ({ label, onClick, disabled = false }: Props) => {
  return (
    <Button
      variant="contained"
      startIcon={<Plus className="h-4 w-4" />}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
};

export default AddButton;
