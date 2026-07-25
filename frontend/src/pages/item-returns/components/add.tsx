import { Dialog, DialogContent } from "@components/dialog";
import itemReturn from "@api/item-return.api";
import type { NewItemReturnRequest } from "@app-types/item-return.types";
import ItemReturnForm from "./form";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";

const defaultValues: NewItemReturnRequest = {
  return_type: "vendor",
  item_category_id: 0,
  date: dayjs().toISOString(),
  from_batch: 0,
  to_batch: null,
  to_vendor: null,
  quantity: 0,
  rate_per_bag: 0,
  total_amount: 0,
  status: "completed",
};

type Props = {
  isShow: boolean;
  onClose: () => void;
  refetch: (override: Record<string, string | number | null>) => void;
};

const AddItemReturn = ({ isShow, onClose, refetch }: Props) => {
  const handleClose = () => {
    onClose();
    methods.reset();
  };

  const methods = useForm({ defaultValues });

  const onSubmit = async (inputData: NewItemReturnRequest) => {
    const res = await itemReturn.create(inputData);
    if (res.status === "success") {
      handleClose();
      refetch({ page: 1 });
      return;
    }
    if (res.status === "validation_error") {
      res.error.forEach((error) => {
        methods.setError(error.name, { message: error.message });
      });
    }
  };

  return (
    <Dialog isOpen={isShow} headerTitle="Add New Return" onClose={handleClose}>
      <DialogContent>
        <ItemReturnForm
          methods={methods}
          onSubmit={onSubmit}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddItemReturn;
