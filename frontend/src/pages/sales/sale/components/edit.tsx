import { Dialog, DialogContent } from "@components/dialog";
import SaleForm from "./form";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import salesApi from "../api";
import type { EditSaleRequest } from "../types";

type Props = {
  selectedId: number | null;
  onClose: () => void;
  refetch: () => void;
};

const defaultValues: EditSaleRequest = {
  id: 0,
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

const EditSale = ({ selectedId, onClose, refetch }: Props) => {
  const isShow = selectedId !== null;

  const handleClose = () => {
    onClose();
    methods.reset();
  };

  const methods = useForm<EditSaleRequest>({
    defaultValues,
  });

  const { setError, reset } = methods;

  useEffect(() => {
    const handleGetById = async (selectedId: number) => {
      const res = await salesApi.fetchById(selectedId);
      const { data, error, status } = res;
      if (status === "success") {
        reset(data);
      }
      if (res.status === "validation_error") {
        error.forEach((error) => {
          setError(error.name, { message: error.message });
        });
      }
    };
    if (selectedId) {
      handleGetById(selectedId);
    }
  }, [selectedId]);

  const onSubmit = async (inputData: EditSaleRequest) => {
    const res = await salesApi.updateById(inputData.id, inputData);
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

  return (
    <Dialog isOpen={isShow} headerTitle="Edit Sale" onClose={handleClose}>
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

export default EditSale;
