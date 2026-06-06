import PageTitle from "@components/PageTitle";
import { useState } from "react";
import AddSale from "./components/add";
import SalesTable from "./components/table";
import EditSale from "./components/edit";
import { Button } from "@mui/material";
import sales from "@api/sales.api";
import useGetPaginatedData from "@hooks/use-get-paginated-data";
import type { Sale } from "@app-types/sales.types";

const SalesPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const data = useGetPaginatedData<Sale[]>(sales.fetchAll);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Sales" />
        <Button variant="contained" onClick={onOpen}>
          Add Sale
        </Button>
      </div>

      <div>
        <SalesTable onEdit={(id) => setSelectedId(id)} data={data} />
      </div>
      <AddSale
        isShow={isOpen}
        onClose={onClose}
        refetch={() => data.handleFetch()}
      />
      <EditSale
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        refetch={() => data.handleFetch()}
      />
    </>
  );
};

export default SalesPage;
