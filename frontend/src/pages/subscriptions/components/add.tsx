import { Dialog, DialogContent } from "@components/dialog";
import subscription from "@api/subscription.api";
import type { NewSubscriptionRequest } from "@app-types/subscription.types";
import SubscriptionForm from "./form";
import { useForm } from "react-hook-form";

const defaultValues: NewSubscriptionRequest = {
  package_id: 0,
  user_id: undefined,
};

type Props = {
  isShow: boolean;
  onClose: () => void;
};

const AddSubscription = ({ isShow, onClose }: Props) => {
  const methods = useForm<NewSubscriptionRequest>({ defaultValues });

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  const onSubmit = async (payload: NewSubscriptionRequest) => {
    await subscription.create(payload);
    handleClose();
  };

  return (
    <Dialog
      isOpen={isShow}
      headerTitle="Add New Subscription"
      onClose={handleClose}
    >
      <DialogContent>
        <SubscriptionForm
          methods={methods}
          onSubmit={onSubmit}
          onCancel={handleClose}
          showUserSelect
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddSubscription;
