import { Dialog, DialogContent } from "@components/dialog";
import subscription from "@api/subscription.api";
import type { NewSubscriptionRequest } from "@app-types/subscription.types";
import SubscriptionForm from "./form";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

type Props = {
  isShow: boolean;
  userId: number | null;
  packageId?: number | null;
  onClose: () => void;
};

const RenewSubscription = ({ isShow, userId, packageId, onClose }: Props) => {
  const methods = useForm<NewSubscriptionRequest>({
    defaultValues: {
      package_id: packageId || 0,
      user_id: userId || undefined,
    },
  });

  useEffect(() => {
    methods.reset({
      package_id: packageId || 0,
      user_id: userId || undefined,
    });
  }, [userId, packageId, methods]);

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  const onSubmit = async (payload: NewSubscriptionRequest) => {
    await subscription.renew({
      package_id: payload.package_id,
      user_id: userId || undefined,
    });
    handleClose();
  };

  return (
    <Dialog isOpen={isShow} headerTitle="Renew Subscription" onClose={handleClose}>
      <DialogContent>
        <SubscriptionForm
          methods={methods}
          onSubmit={onSubmit}
          onCancel={handleClose}
          showUserSelect={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RenewSubscription;
