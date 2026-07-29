import { Dialog, DialogContent } from "@components/dialog";
import sales from "@api/sales.api";
import type { NewSaleRequest } from "@app-types/sales.types";
import SaleForm from "./form";
import { useForm } from "react-hook-form";
const defaultValues: NewSaleRequest = {
  season_id: null,
  batch_id: null,
  date: "",
  buyer_id: null,
  vehicle_no: "",
  weight: 0,
  bird_no: 0,
  payment_type: null,
  price: 0,
  narration: "",
};

type Props = {
  isShow: boolean;
  onClose: () => void;
  refetch: () => void;
};

const AddSale = ({ isShow, onClose, refetch }: Props) => {
  const methods = useForm<NewSaleRequest>({
    defaultValues,
  });

  const { setError } = methods;
  const onSubmit = async (inputData: NewSaleRequest) => {
    const res = await sales.create(inputData);
    if (res.status === "success") {
      handleClose();
      refetch();
    }
    if (res.status === "validation_error") {
      res.error.forEach((error) => {
        setError(error.name, { message: error.message });
      });
    }
  };

  const handleClose = () => {
    onClose();
    methods.reset();
  };

  return (
    <Dialog isOpen={isShow} headerTitle="Add New Sale" onClose={handleClose}>
      <DialogContent>
        <SaleForm
          methods={methods}
          onSubmit={onSubmit}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddSale;
