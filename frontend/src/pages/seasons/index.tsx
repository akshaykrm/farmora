import PageHeader from "@components/PageHeader";
import { useState } from "react";
import AddSeason from "./components/add";
import EditSeason from "./components/edit";
import SeasonTable from "./components/table";
import { Box, Button } from "@mui/material";
import useGetSeasons from "./hooks/use-get-seasons";
import useSeasonFilter from "./hooks/use-season-filter";
import PaginationWithLimit from "@components/pagination-with-limit";

const SeasonsPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { filter, updateQueryParams } = useSeasonFilter();

  const { seasonsList, refetch } = useGetSeasons(filter);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  return (
    <>
      <PageHeader
        title="Seasons"
        action={
          <Button variant="contained" onClick={onOpen}>
            Add Season
          </Button>
        }
      />
      <div>
        <SeasonTable onEdit={(id) => setSelectedId(id)} seasons={seasonsList.records} />
      </div>
      <Box className="flex justify-end mt-6">
        <PaginationWithLimit
          limit={filter.limit}
          totalPages={seasonsList.totalPages}
          page={filter.page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>
      <AddSeason
        isShow={isOpen}
        onClose={onClose}
        refetch={() => {
          updateQueryParams({ page: 1 });
        }}
      />
      <EditSeason
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        refetch={() => refetch()}
      />
    </>
  );
};

export default SeasonsPage;
