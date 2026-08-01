import { Plus } from "lucide-react";
import Button from "@mui/material/Button";

type Props = {
  label: string;
  onClick: () => void;
};

const AddButton = ({ label, onClick }: Props) => {
  return (
    <Button variant="contained" startIcon={<Plus className="h-4 w-4" />} onClick={onClick}>
      {label}
    </Button>
  );
};

export default AddButton;
