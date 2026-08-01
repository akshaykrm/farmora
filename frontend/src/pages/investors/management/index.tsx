import PageTitle from "@components/PageTitle";
import AddButton from "@components/AddButton";
import { useState } from "react";
import AddInvestor from "./components/AddInvestor";
import InvestorManagementTable from "./components/InvestorManagementTable";
import EditInvestor from "./components/EditInvestor";
import { Box } from "@mui/material";
import useGetInvestors from "./hooks/use-get-investors";
import useInvestorFilter from "./hooks/use-investor-filter";
import InvestorManagementFilter from "./components/InvestorManagementFilter";
import PaginationWithLimit from "@components/pagination-with-limit";

const InvestorManagementPage = () => {
  const { filter, updateQueryParams } = useInvestorFilter();
  const { investors, refetch } = useGetInvestors(filter);
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Investors" />
        <AddButton label="Investor" onClick={onOpen} />
      </div>
      <InvestorManagementFilter
        defaultFilter={filter}
        onFilter={(f) => updateQueryParams(f)}
      />
      <div className="mt-4">
        <InvestorManagementTable
          onEdit={(id) => setSelectedId(id)}
          investors={investors.records}
        />
      </div>
      <Box className="flex justify-end mt-6">
        <PaginationWithLimit
          limit={filter.limit}
          totalPages={investors.totalPages}
          page={filter.page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>
      <AddInvestor
        isShow={isOpen}
        onClose={onClose}
        refetch={() => {
          updateQueryParams({ page: 1 });
        }}
      />
      <EditInvestor
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        refetch={() => refetch()}
      />
    </>
  );
};

export default InvestorManagementPage;
