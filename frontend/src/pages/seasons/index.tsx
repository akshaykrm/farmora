import PageTitle from "@components/PageTitle";
import { useState } from "react";
import AddSeason from "./components/add";
import EditSeason from "./components/edit";
import SeasonTable from "./components/table";
import { Button } from "@mui/material";

const SeasonsPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

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
        <SeasonTable onEdit={(id) => setSelectedId(id)} />
      </div>
      <AddSeason isShow={isOpen} onClose={onClose} />
      <EditSeason selectedId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
};

export default SeasonsPage;
