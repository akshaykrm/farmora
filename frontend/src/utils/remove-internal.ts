import type { ItemName } from "@pages/items/types";

export const removeInternal = (dataList: ItemName[]) => {
  if (!dataList) {
    return [];
  }

  return dataList.filter(
    ({ type }) =>
      type.toLowerCase() !== "integration" && type.toLowerCase() != "working",
  );
};

export function swapNameWithTypeAndRemoveType(dataList: ItemName[]) {
  if (!dataList) {
    return [];
  }

  return dataList.map((item) => {
    return {
      id: item.id,
      name: item.type,
    };
  });
}
