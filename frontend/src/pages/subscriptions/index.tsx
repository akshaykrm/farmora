import PageHeader from "@components/PageHeader";
import { useState } from "react";
import AddSubscription from "./components/add";
import SubscriptionTable from "./components/table";
import EditSubscription from "./components/edit";
import { Button } from "@mui/material";

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
          <Button variant="contained" onClick={onOpen}>
            Add Subscription
          </Button>
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
