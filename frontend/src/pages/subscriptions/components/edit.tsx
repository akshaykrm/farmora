import { Dialog, DialogContent } from "@components/dialog";
import subscription from "@api/subscription.api";
import type { EditSubscriptionRequest } from "@app-types/subscription.types";
import SubscriptionForm from "./form";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type Props = {
  selectedId: number | null;
  onClose: () => void;
};

const defaultValues: EditSubscriptionRequest = {
  id: 0,
  package_id: 0,
};

const EditSubscription = ({ selectedId, onClose }: Props) => {
  const isShow = selectedId !== null;
  const methods = useForm<EditSubscriptionRequest>({ defaultValues });

  useEffect(() => {
    const load = async () => {
      if (!selectedId) return;
      const data = await subscription.fetchById(selectedId);
      methods.reset(data);
    };
    load();
  }, [selectedId, methods]);

  const onSubmit = async (payload: EditSubscriptionRequest) => {
    if (!selectedId) return;
    await subscription.updateById(selectedId, payload);
    onClose();
  };

  return (
    <Dialog isOpen={isShow} headerTitle="Edit Subscription" onClose={onClose}>
      <DialogContent>
        <SubscriptionForm
          methods={methods}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditSubscription;
