import PageTitle from "@components/PageTitle";
import { useState } from "react";
import AddInvestor from "./components/AddInvestor";
import InvestorManagementTable from "./components/InvestorManagementTable";
import EditInvestor from "./components/EditInvestor";
import { Button } from "@mui/material";
import useGetInvestors from "./hooks/useGetInvestors";
import InvestorManagementFilter from "./components/InvestorManagementFilter";
import type { InvestorFilterRequest } from "./types";

const InvestorManagementPage = () => {
  const { handleFetchAllInvestors, investorList } = useGetInvestors();
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const onFilter = (filter: InvestorFilterRequest) => {
    const params: Record<string, string> = {};
    if (filter.search) params.search = filter.search;
    if (filter.start_date) params.start_date = filter.start_date;
    if (filter.end_date) params.end_date = filter.end_date;
    handleFetchAllInvestors(params);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Investors" />
        <Button variant="contained" onClick={onOpen}>
          Add Investor
        </Button>
      </div>
      <InvestorManagementFilter onFilter={onFilter} />
      <div className="mt-4">
        <InvestorManagementTable
          onEdit={(id) => setSelectedId(id)}
          data={investorList}
        />
      </div>
      <AddInvestor
        isShow={isOpen}
        onClose={onClose}
        refetch={() => handleFetchAllInvestors()}
      />
      <EditInvestor
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        refetch={() => handleFetchAllInvestors()}
      />
    </>
  );
};

export default InvestorManagementPage;
