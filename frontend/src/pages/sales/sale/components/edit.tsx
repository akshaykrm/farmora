import { Dialog, DialogContent } from "@components/dialog";
import useEditForm from "@hooks/use-edit-form";
import useGetById from "@hooks/use-get-by-id";
import sales from "@api/sales.api";
import type { EditSaleRequest } from "@app-types/sales.types";
import SaleForm from "./form";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

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

  // const query = useGetById<EditSaleRequest>(selectedId, {
  //   defaultValues,
  //   queryKey: "sale:get-by-id",
  //   queryFn: sales.fetchById,
  // });

  const methods = useForm<EditSaleRequest>({
    defaultValues,
  });

  // const { onSubmit } = useEditForm<EditSaleRequest>({
  //   defaultValues: query.data as EditSaleRequest,
  //   mutationKey: "sales:edit",
  //   mutationFn: sales.updateById,
  //   onSuccess: () => {
  //     handleClose();
  //     refetch();
  //   },
  // });

  const { setError, reset } = methods;

  useEffect(() => {
    const handleGetById = async (selectedId: number) => {
      const res = await sales.fetchById(selectedId);
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
    const res = await sales.updateById(inputData.id, inputData);
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
