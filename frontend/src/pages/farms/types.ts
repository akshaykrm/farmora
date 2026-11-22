import type { ListResponse } from "@app-types/response.types";

export type FarmFormValues = {
  name: string;
  place: string;
  capacity: string;
};

export type NewFarmRequest = {
  name: string;
  place: string;
  capacity: string;
};

export type FarmName = {
  id: number;
  name: string;
};

export type EditFarmRequest = Partial<NewFarmRequest> & {
  id: number;
};

export type EditFarmPayload = Partial<NewFarmRequest>;

export type Farm = {
  id: number;
  master_id: number;
  name: string;
  place: string;
  capacity: string;
  own: Boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type FarmsListResponse = ListResponse<Farm>;

export type FarmAllowance = {
  used: number;
  limit: number | null;
  remaining: number | null;
  can_create: boolean;
  package_name: string | null;
  subscription_active: boolean;
};
