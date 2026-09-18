import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import { useState } from "react";
import AddSubscription from "./components/add";
import SubscriptionTable from "./components/table";
import EditSubscription from "./components/edit";
import RenewSubscription from "./components/renew";
import type { Subscription } from "@app-types/subscription.types";

const SubscriptionsPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [renewTarget, setRenewTarget] = useState<Subscription | null>(null);
  const [reload, setReload] = useState(0);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => {
    setOpenAdd(false);
    setReload((value) => value + 1);
  };

  return (
    <>
      <PageHeader
        title="Subscriptions"
        action={
          <AddButton label="Subscription" onClick={onOpen} />
        }
      />

      <div>
        <SubscriptionTable
          key={reload}
          onEdit={(id) => setSelectedId(id)}
          onRenew={setRenewTarget}
        />
      </div>
      <AddSubscription isShow={isOpen} onClose={onClose} />
      <EditSubscription
        selectedId={selectedId}
        onClose={() => {
          setSelectedId(null);
          setReload((value) => value + 1);
        }}
      />
      <RenewSubscription
        isShow={renewTarget !== null}
        userId={renewTarget?.user_id ?? null}
        packageId={renewTarget?.package_id ?? renewTarget?.package?.id ?? null}
        onClose={() => {
          setRenewTarget(null);
          setReload((value) => value + 1);
        }}
      />
    </>
  );
};

export default SubscriptionsPage;
