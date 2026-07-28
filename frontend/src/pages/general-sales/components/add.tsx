import { Dialog, DialogContent } from "@components/dialog";
import type { GeneralSalesFormValues } from "@app-types/general-sales.types";
import GeneralSalesForm from "./form";
import useAddGeneralSales from "../hooks/use-add-general-sales";

const defaultValues: GeneralSalesFormValues = {
  season_id: null,
  purpose: "",
  amount: "",
  narration: "",
  date: "",
};

type Props = {
  isShow: boolean;
  onClose: () => void;
  refetch: () => void;
};

const AddGeneralSales = ({ isShow, onClose, refetch }: Props) => {
  const { clearError, errors, onSubmit } = useAddGeneralSales(() => {
    refetch();
    onClose();
  });

  const handleClose = () => {
    onClose();
    clearError();
  };

  return (
    <Dialog
      isOpen={isShow}
      headerTitle="Add General Sales"
      onClose={handleClose}
    >
      <DialogContent>
        <GeneralSalesForm
          onSubmit={onSubmit}
          onCancel={handleClose}
          apiError={errors}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddGeneralSales;
