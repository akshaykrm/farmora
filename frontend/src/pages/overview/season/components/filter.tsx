import { Button } from "@mui/material";
import SelectList from "@components/select-list";
import type { SeasonOverviewFilterRequest } from "../types";
import { useForm } from "react-hook-form";
import useGetSeasonNames from "@hooks/use-get-season-names";
import { useEffect } from "react";
import type { Filter } from "@utils/filters";

type Props = {
  onFilter: (v: Filter) => void;
  defaultValues: Filter;
};

const FilterSeasonOverview = ({ onFilter, defaultValues }: Props) => {
  const methods = useForm<SeasonOverviewFilterRequest>({
    defaultValues: {
      season_id: (defaultValues.season_id as number | null) ?? null,
    },
  });

  const {
    watch,
    formState: { errors },
    setValue,
    handleSubmit,
    getValues,
  } = methods;
  const seasonId = watch("season_id");

  const seasonNames = useGetSeasonNames();

  const handleFilter = handleSubmit((inputData) => {
    onFilter(inputData);
  });

  useEffect(() => {
    document.addEventListener("seasonOverview:season-closed", () => {
      const values = getValues();
      onFilter(values);
    });
  }, []);

  return (
    <div className="flex items-center justify-between w-full bg-brand-card rounded-lg shadow-sm border border-brand-border p-6 mb-6">
      <div className="w-[50%]">
        <SelectList
          options={seasonNames.data}
          value={seasonId}
          onChange={(val) => {
            setValue("season_id", val);
          }}
          label="Season *"
          name="season_id"
          error={Boolean(errors.season_id)}
          helperText={errors.season_id?.message}
        />
      </div>
      <div>
        <Button variant="contained" onClick={handleFilter} disabled={!seasonId}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterSeasonOverview;
