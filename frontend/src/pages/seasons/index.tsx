import PageTitle from "@components/PageTitle";
import { useState } from "react";
import AddSeason from "./components/add";
import EditSeason from "./components/edit";
import SeasonTable from "./components/table";
import { Box, Button, Pagination } from "@mui/material";
import useGetSeasons from "./hooks/use-get-seasons";
import useSeasonFilter from "./hooks/use-season-filter";

const SeasonsPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { filter, updateQueryParams } = useSeasonFilter();

  const { seasonsList, refetch } = useGetSeasons(filter);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Seasons" />
        <Button variant="contained" onClick={onOpen}>
          Add Season
        </Button>
      </div>
      <div>
        <SeasonTable onEdit={(id) => setSelectedId(id)} seasons={seasonsList.records} />
      </div>
      <Box className="flex justify-end mt-6">
        <Pagination
          count={seasonsList.totalPages}
          size="small"
          defaultPage={1}
          onChange={(_, page) => {
            updateQueryParams({ page });
          }}
          page={filter.page}
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
