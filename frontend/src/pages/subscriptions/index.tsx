import PageTitle from "@components/PageTitle";
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
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Subscriptions" />
        <Button variant="contained" onClick={onOpen}>
          Add Subscription
        </Button>
      </div>

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
