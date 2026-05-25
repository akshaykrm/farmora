import type {
	EditBatchRequest,
	EditBatchPayload,
	NewBatchRequest,
} from "@app-types/batch.types";
import type { ItemName } from "@pages/items/types";
import fetcher from "@utils/fetcher";
import fetcherV2, { type FetcherReturnType } from "@utils/fetcherV2";

type Opts = {
	status: "active" | "inactive";
};
const batches = {
	fetchAll: () => fetcher("batches"),
	getNames: () => fetcher("batches/names"),
	getBySeasonId: async (
		seasonId: number,
		opts?: Opts,
	): Promise<FetcherReturnType<ItemName[]>> => {
		const params = { season_id: seasonId };
		const searchParms = new URLSearchParams(params);
		const res = await fetcherV2<ItemName[]>("batches/names?" + searchParms);
		return res;
	},
	fetchById: (id: number) => fetcher(`batches/${id}`),
	create: async (payload: NewBatchRequest) =>
		await fetcher("batches", JSON.stringify(payload), { method: "POST" }),
	updateById: async (id: number, updateData: EditBatchRequest) => {
		const payload: EditBatchPayload = {
			name: updateData.name,
			farm_id: updateData.farm_id,
			season_id: updateData.season_id,
			status: updateData.status,
		};
		return await fetcher(`batches/${id}`, JSON.stringify(payload), {
			method: "PUT",
		});
	},
};

export default batches;
