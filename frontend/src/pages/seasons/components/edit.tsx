import { Dialog, DialogContent } from "@components/dialog";
import SeasonForm from "./form";
import useGetSeasonById from "../hooks/use-get-season-by-id";
import useEditSeason from "../hooks/use-edit-season";
import Ternary from "@components/ternary";

type Props = {
  selectedId: number | null;
  onClose: () => void;
  refetch: () => void;
};

const EditSeason = ({ selectedId, onClose, refetch }: Props) => {
  const isShow = selectedId !== null;

  const { dataLoaded, selectedData } = useGetSeasonById(selectedId);

  const { clearError, errors, onSubmit } = useEditSeason(selectedId, {
    onSuccess: () => {
      refetch();
      onClose();
    },
  });

  const handleClose = () => {
    onClose();
    clearError();
  };

  return (
    <Dialog isOpen={isShow} headerTitle="Edit Season" onClose={handleClose}>
      <DialogContent>
        <Ternary
          when={dataLoaded}
          then={
            <SeasonForm
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

export default EditSeason;
