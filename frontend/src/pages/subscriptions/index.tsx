import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import { useState } from "react";
import AddSubscription from "./components/add";
import SubscriptionTable from "./components/table";
import EditSubscription from "./components/edit";

const SubscriptionsPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  return (
    <>
      <PageHeader
        title="Subscriptions"
        action={
          <AddButton label="Subscription" onClick={onOpen} />
        }
      />

      <div>
        <SubscriptionTable onEdit={(id) => setSelectedId(id)} />
      </div>
      <AddSubscription isShow={isOpen} onClose={onClose} />
      <EditSubscription
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
};

export default SubscriptionsPage;
