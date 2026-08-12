import type { ListResponse } from "@app-types/response.types";
import type { ValidationError } from "@errors/api.error";

export type Season = {
  id: number;
  master_id: number;
  name: string;
  from_date?: string | null;
  to_date?: string | null;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type SeasonListResponse = ListResponse<Season>;

export type SeasonName = {
  id: number;
  name: string;
};

export type SeasonNameFilter = {
  status?: "active" | "closed" | null | undefined;
};

export type SeasonFormValues = {
  name: string;
  from_date: string;
  to_date: string;
  status: "active" | "inactive";
};

type UseSeasonReturn = {
  onSubmit: (inputData: SeasonFormValues) => void;
  errors: ValidationError[];
  clearError: () => void;
};

type Opts = {
  onSuccess: () => void;
};

export type UseAddSeason = (opts: Opts) => UseSeasonReturn;

export type UseEditSeason = (
  selectedId: number | null,
  opts: Opts,
) => UseSeasonReturn;
