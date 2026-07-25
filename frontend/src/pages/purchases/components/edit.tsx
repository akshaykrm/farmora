import { Dialog, DialogContent } from "@components/dialog";
import PurchaseForm from "./form";
import useGetPurchaseById from "../hooks/use-get-purchase-by-id";
import Ternary from "@components/ternary";
import useEditPurchase from "../hooks/use-edit-purchase";

type Props = {
  selectedId: number | null;
  onClose: () => void;
  refetch: (override?: Record<string, string | number | null>) => void;
};

const EditItem = ({ selectedId, onClose, refetch }: Props) => {
  const isShow = selectedId !== null;

  const { dataLoaded, selectedData } = useGetPurchaseById(selectedId);

  const { clearError, errors, onSubmit } = useEditPurchase(selectedId, {
    onSuccess: () => {
      handleClose();
      refetch();
    },
  });

  const handleClose = () => {
    onClose();
    clearError();
  };

  return (
    <Dialog isOpen={isShow} headerTitle="Edit Purchase" onClose={handleClose}>
      <DialogContent>
        <Ternary
          when={dataLoaded}
          then={
            <PurchaseForm
              onSubmit={onSubmit}
              defaultValues={selectedData}
              apiError={errors}
              onCancel={handleClose}
            />
          }
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditItem;
