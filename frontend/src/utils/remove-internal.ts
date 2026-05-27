import type { ItemName } from "@pages/items/types"

export const removeInternal = (dataList: ItemName[]) => {
	if (!dataList) {
		return []
	}
  
	return dataList.filter(({ name }) => (name.toLowerCase() !== "integration") && (name.toLowerCase() != "working"))
}
