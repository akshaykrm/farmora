import { Dialog, DialogContent } from "@components/dialog";
import itemReturn from "@api/item-return.api";
import type { EditItemReturnRequest } from "@app-types/item-return.types";
import ItemReturnForm from "./form";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { EditPurchaseRequest } from "@pages/purchases/types";

type Props = {
  selectedId: number | null;
  onClose: () => void;
  refetch: () => void;
};

const defaultValues: EditItemReturnRequest = {
  id: 0,
  return_type: "vendor",
  payment_type: "",
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

const EditItemReturn = ({ selectedId, onClose, refetch }: Props) => {
  const isShow = selectedId !== null;

  const methods = useForm<EditItemReturnRequest>({
    defaultValues,
  });

  useEffect(() => {
    const handleFetchById = async (id: number) => {
      const res = await itemReturn.fetchById(id);

      if (res.status === "success") {
        if (res.data) {
          const data = res.data;
          methods.reset({
            id: data.id,
            return_type: data.return_type,
            payment_type: data.payment_type,
            item_category_id: data.category?.id || data.item_category_id,
            date: data.date,
            from_batch: data.from_batch_data?.id || data.from_batch,
            to_batch: data.to_batch_data?.id || data.to_batch,
            to_vendor: data.to_vendor_data?.id || data.to_vendor,
            quantity: data.quantity,
            rate_per_bag: data.rate_per_bag,
            total_amount: data.total_amount,
            status: data.status,
          });
          return;
        }
      }
      methods.reset(defaultValues);
    };
    if (selectedId) {
      handleFetchById(selectedId);
    } else {
      methods.reset(defaultValues);
    }
    return () => methods.reset(defaultValues);
  }, [selectedId]);

  const onSubmit = async (inputData: EditPurchaseRequest) => {
    const res = await itemReturn.updateById(inputData.id, inputData);
    if (res.status === "success") {
      onClose();
      refetch();
      return;
    }
    if (res.status === "validation_error") {
      res.error.forEach((error) => {
        methods.setError(error.name, { message: error.message });
      });
    }
  };

  return (
    <Dialog isOpen={isShow} headerTitle="Edit Return" onClose={onClose}>
      <DialogContent>
        <ItemReturnForm
          methods={methods}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditItemReturn;
