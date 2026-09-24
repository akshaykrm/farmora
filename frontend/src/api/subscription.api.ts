import type {
  NewSubscriptionRequest,
  EditSubscriptionPayload,
  EditSubscriptionRequest,
  Subscription,
} from "@app-types/subscription.types";
import type { ListResponse } from "@app-types/response.types";
import fetcher from "@utils/fetcher";

const subscription = {
  fetchAll: (filter?: {
    page?: number;
    limit?: number;
    user_id?: number;
  }): Promise<ListResponse<Subscription>> => {
    return fetcher("subscriptions", null, { method: "GET", filter });
  },
  fetchById: async (id: number): Promise<EditSubscriptionRequest> => {
    const data = await fetcher(`subscriptions/${id}`);
    return {
      id: data.id,
      package_id: data.package_id || data.package?.id,
      referral_partner_id: data.user?.referral_partner_id ?? null,
    };
  },
  create: async (payload: NewSubscriptionRequest) =>
    await fetcher("subscriptions/subscribe", JSON.stringify(payload), {
      method: "POST",
    }),
  renew: async (payload: NewSubscriptionRequest) =>
    await fetcher("subscriptions/renew", JSON.stringify(payload), {
      method: "POST",
    }),
  updateById: async (id: number, updateData: EditSubscriptionRequest) => {
    const payload: EditSubscriptionPayload = {
      package_id: updateData.package_id,
      referral_partner_id: updateData.referral_partner_id,
    };
    return await fetcher(`subscriptions/${id}`, JSON.stringify(payload), {
      method: "PUT",
    });
  },
};

export default subscription;
