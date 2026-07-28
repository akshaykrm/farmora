import PageTitle from "@components/PageTitle";
import { useState } from "react";
import AddInvestor from "./components/AddInvestor";
import InvestorManagementTable from "./components/InvestorManagementTable";
import EditInvestor from "./components/EditInvestor";
import { Box, Button, Pagination } from "@mui/material";
import useGetInvestors from "./hooks/use-get-investors";
import useInvestorFilter from "./hooks/use-investor-filter";
import InvestorManagementFilter from "./components/InvestorManagementFilter";

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
        <Button variant="contained" onClick={onOpen}>
          Add Investor
        </Button>
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
        <Pagination
          count={investors.totalPages}
          size="small"
          defaultPage={1}
          onChange={(_, page) => {
            updateQueryParams({ page });
          }}
          page={filter.page}
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
