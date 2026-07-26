import { Dialog, DialogContent } from "@components/dialog";
import FarmForm from "./form";
import dayjs from "dayjs";

import type { SeasonFormValues } from "../types";
import useAddSeason from "../hooks/use-add-season";

const defaultValues: SeasonFormValues = {
  name: "",
  status: 1,
  from_date: dayjs().toISOString(),
  to_date: dayjs().add(6, "months").toISOString(),
};

type Props = {
  isShow: boolean;
  onClose: () => void;
  refetch: () => void;
};

const AddSeason = ({ isShow, onClose, refetch }: Props) => {
  const { onSubmit, clearError, errors } = useAddSeason({
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
    <Dialog isOpen={isShow} headerTitle="Add New Season" onClose={onClose}>
      <DialogContent>
        <FarmForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          apiError={errors}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddSeason;
