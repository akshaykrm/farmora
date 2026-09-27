import { Dialog, DialogContent } from "@components/dialog";
import subscription from "@api/subscription.api";
import type { EditSubscriptionRequest } from "@app-types/subscription.types";
import SubscriptionForm from "./form";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  selectedId: number | null;
  onClose: () => void;
};

const defaultValues: EditSubscriptionRequest = {
  id: 0,
  package_id: 0,
  referral_partner_id: null,
};

const EditSubscription = ({ selectedId, onClose }: Props) => {
  const isShow = selectedId !== null;
  const methods = useForm<EditSubscriptionRequest>({ defaultValues });
  const [referralLocked, setReferralLocked] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!selectedId) return;
      const data = await subscription.fetchById(selectedId);
      methods.reset(data);
      setReferralLocked(Boolean(data.referral_partner_id));
    };
    load();
  }, [selectedId, methods]);

  const onSubmit = async (payload: EditSubscriptionRequest) => {
    if (!selectedId) return;
    await subscription.updateById(selectedId, {
      ...payload,
      referral_partner_id: referralLocked
        ? undefined
        : payload.referral_partner_id || undefined,
    });
    onClose();
  };

  return (
    <Dialog isOpen={isShow} headerTitle="Edit Subscription" onClose={onClose}>
      <DialogContent>
        <SubscriptionForm
          methods={methods}
          onSubmit={onSubmit}
          onCancel={onClose}
          showReferralSelect
          referralLocked={referralLocked}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditSubscription;
