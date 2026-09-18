import type { ListResponse } from "./response.types";

export type Subscription = {
  id: number;
  user_id: number;
  package_id: number;
  valid_from: string;
  valid_to: string;
  status: string;
  user?: {
    id: number;
    name: string;
    username: string;
  };
  package?: {
    id: number;
    name: string;
    price: number;
    duration: number;
  };
};

export type NewSubscriptionRequest = {
  package_id: number;
  user_id?: number;
};

export type EditSubscriptionRequest = Partial<NewSubscriptionRequest> & {
  id: number;
};

export type EditSubscriptionPayload = Omit<EditSubscriptionRequest, "id">;

export type SubscriptionsListResponse = ListResponse<Subscription>;
