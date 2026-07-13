import { Button } from "@mui/material";
import SelectList from "@components/select-list";
import type { BatchOverviewFilterRequest } from "@app-types/batch-overview.types";
import { useForm } from "react-hook-form";
import batches from "@api/batches.api";
import type { BatchName } from "@app-types/batch.types";
import { useEffect, useState } from "react";
import useGetSeasonNameList from "@hooks/use-get-season-names";
import useGetBatchNameList from "@hooks/use-get-batch-names";

type Props = {
  onFilter: (v: BatchOverviewFilterRequest) => Promise<void>;
};

const defaultValues: BatchOverviewFilterRequest = {
  season_id: "",
  batch_id: "",
};

const FilterBatchOverview = ({ onFilter }: Props) => {
  const methods = useForm<BatchOverviewFilterRequest>({ defaultValues });

  const {
    formState: { errors },
    watch,
    setValue,
    handleSubmit,
    getValues,
  } = methods;

  const [seasonId, batchId] = watch(["season_id", "batch_id"]);
  const seasonsList = useGetSeasonNameList();
  const batchList = useGetBatchNameList({
    season_id: seasonId,
  });

  useEffect(() => {
    document.addEventListener("batchOverview:batch-closed", () => {
      const values = getValues();
      onFilter(values);
    });
  }, []);

  const handleFilter = handleSubmit(
    async (inputData: BatchOverviewFilterRequest) => {
      onFilter(inputData);
    },
  );

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <SelectList
          options={seasonsList.data}
          value={seasonId}
          onChange={(val) => {
            if (val) {
              setValue("season_id", val);
              setValue("batch_id", "");
            }
          }}
          label="Season *"
          name="season_id"
          error={Boolean(errors.season_id)}
          helperText={errors.season_id?.message}
        />

        <SelectList
          options={batchList.data}
          value={batchId}
          onChange={(val) => {
            setValue("batch_id", val ? val : "");
          }}
          label="Batch *"
          name="batch_id"
          error={Boolean(errors.batch_id)}
          helperText={errors.batch_id?.message}
          disabled={!seasonId}
        />
      </div>

      <div className="flex justify-end">
        <Button
          variant="contained"
          onClick={handleFilter}
          disabled={!seasonId || !batchId}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterBatchOverview;
