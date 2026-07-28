import { Dialog, DialogContent } from "@components/dialog";
import useAddForm from "@hooks/use-add-form";
import generalSales from "@api/general-sales.api";
import type { NewGeneralSalesRequest } from "@app-types/general-sales.types";
import GeneralSalesForm from "./form";

const defaultValues: NewGeneralSalesRequest = {
  season_id: null,
  purpose: "",
  amount: "",
  narration: "",
};

type Props = {
  isShow: boolean;
  onClose: () => void;
  refetch: () => void;
};

const AddGeneralSales = ({ isShow, onClose, refetch }: Props) => {
  const handleClose = () => {
    onClose();
    methods.reset();
  };

  const { methods, onSubmit } = useAddForm<NewGeneralSalesRequest>({
    defaultValues,
    mutationFn: generalSales.create,
    mutationKey: "general-sales:add",
    onSuccess: () => {
      handleClose();
      refetch();
    },
  });

  return (
    <Dialog
      isOpen={isShow}
      headerTitle="Add General Sales"
      onClose={handleClose}
    >
      <DialogContent>
        <GeneralSalesForm
          methods={methods}
          onSubmit={onSubmit}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddGeneralSales;
