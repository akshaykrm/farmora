import { Dialog, DialogContent } from "@components/dialog";
import useAddForm from "@hooks/use-add-form";
import type { NewSalesBookEntryRequest } from "@app-types/sales-book.types";
import SalesBookForm from "./form";
import salesBookApi from "../api";

const defaultValues: NewSalesBookEntryRequest = {
  date: "",
  buyer_id: null,
  amount: "",
  narration: "",
};

type Props = {
  isShow: boolean;
  onClose: () => void;
  refetch: () => void;
};

const AddSalesBookEntry = ({ isShow, onClose, refetch }: Props) => {
  const handleClose = () => {
    onClose();
    methods.reset();
  };

  const { methods, onSubmit } = useAddForm<NewSalesBookEntryRequest>({
    defaultValues,
    mutationFn: salesBookApi.create,
    mutationKey: "sales-book:add",
    onSuccess: () => {
      handleClose();
      refetch();
    },
  });

  return (
    <Dialog
      isOpen={isShow}
      headerTitle="Add Sales Book Entry"
      onClose={handleClose}
    >
      <DialogContent>
        <SalesBookForm
          methods={methods}
          onSubmit={onSubmit}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddSalesBookEntry;
