import { Dialog, DialogContent } from "@components/dialog";
import GeneralSalesForm from "./form";
import useEditForm from "@hooks/use-edit-form";
import useGetById from "@hooks/use-get-by-id";
import generalSales from "@api/general-sales.api";
import type { EditGeneralSalesRequest } from "@app-types/general-sales.types";

type Props = {
  selectedId: number | null;
  onClose: () => void;
  refetch: () => void;
};

const defaultValues: EditGeneralSalesRequest = {
  id: 0,
  season_id: null,
  purpose: "",
  amount: "",
  narration: "",
};

const EditGeneralSales = ({ selectedId, onClose, refetch }: Props) => {
  const isShow = selectedId !== null;

  const handleClose = () => {
    onClose();
    methods.reset();
  };

  const query = useGetById<EditGeneralSalesRequest>(selectedId, {
    defaultValues,
    queryKey: "general-sales:get-by-id",
    queryFn: generalSales.fetchById,
  });

  const { methods, onSubmit } = useEditForm<EditGeneralSalesRequest>({
    defaultValues: query.data as EditGeneralSalesRequest,
    mutationKey: "general-sales:edit",
    mutationFn: generalSales.updateById,
    onSuccess: () => {
      handleClose();
      refetch();
    },
  });

  return (
    <Dialog
      isOpen={isShow}
      headerTitle="Edit General Sales"
      onClose={handleClose}
    >
      <DialogContent>
        <GeneralSalesForm methods={methods} onSubmit={onSubmit} onCancel={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default EditGeneralSales;
