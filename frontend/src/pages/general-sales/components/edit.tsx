import { Dialog, DialogContent } from "@components/dialog";
import GeneralSalesForm from "./form";
import Ternary from "@components/ternary";
import useGetGeneralSalesById from "../hooks/use-get-general-sales-by-id";
import useEditGeneralSale from "../hooks/use-edit-general-sales";

type Props = {
  selectedId: number | null;
  onClose: () => void;
  refetch: () => void;
};

function EditGeneralSales({ selectedId, onClose, refetch }: Props) {
  const isShow = selectedId !== null;

  const { dataLoaded, selectedData } = useGetGeneralSalesById(selectedId);
  const { errors, clearError, onSubmit } = useEditGeneralSale(
    selectedId,
    () => {
      onClose();
      refetch();
    },
  );

  const handleClose = () => {
    onClose();
    clearError();
  };

  return (
    <Dialog
      isOpen={isShow}
      headerTitle="Edit General Sales"
      onClose={handleClose}
    >
      <DialogContent>
        <Ternary
          when={dataLoaded}
          then={
            <GeneralSalesForm
              onSubmit={onSubmit}
              onCancel={handleClose}
              apiError={errors}
              defaultValues={selectedData}
            />
          }
        />
      </DialogContent>
    </Dialog>
  );
}

export default EditGeneralSales;
