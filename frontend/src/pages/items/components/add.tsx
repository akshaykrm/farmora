import { Dialog, DialogContent } from "@components/dialog";
import ItemForm from "./form";
import { type DefaultValues } from "react-hook-form";
import useAddEmployee from "../hooks/use-add-items";
import type { ItemFormValues } from "../types";

const defaultValues: DefaultValues<ItemFormValues> = {
  name: "",
  vendor_id: "",
  base_price: "",
  type: "regular",
};

type Props = {
  isShow: boolean;
  refetch: () => void;
  onClose: () => void;
};

const AddItem = ({ isShow, onClose, refetch }: Props) => {
  const { onSubmit, clearError, errors } = useAddEmployee({
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
    <Dialog isOpen={isShow} headerTitle="Add New Item" onClose={handleClose}>
      <DialogContent>
        <p className="text-brand-ink-soft">Add new Item</p>
        <ItemForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          apiError={errors}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddItem;
