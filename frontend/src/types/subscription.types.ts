export type Subscription = {
  id: number;
  user_id: number;
  package_id: number;
  valid_from: string;
  valid_to: string;
  kind?: "initial" | "renewal";
  status?: string;
  user?: {
    id: number;
    name: string;
    username: string;
    referral_partner_id?: number | null;
    referral_partner?: {
      id: number;
      name: string;
      code: string;
      status?: string;
    } | null;
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
  referral_partner_id?: number | null;
};

export type EditSubscriptionRequest = Partial<NewSubscriptionRequest> & {
  id: number;
};

export type EditSubscriptionPayload = Omit<EditSubscriptionRequest, "id">;

export type SubscriptionsListResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Subscription[];
};
