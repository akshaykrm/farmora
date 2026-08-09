import ItemPage from "./page";
import api from "./api";

export { api as itemsApi };

export const itemTypes = [
  { label: "Regular", value: "regular" },
  { label: "Chick", value: "chick" },
  // { label: "Medicine", value: "medicine" },
  { label: "FINISHER", value: "FINISHER" },
  { label: "STARTER", value: "STARTER" },
  { label: "PRE STARTER", value: "PRE STARTER" },
  { label: "Integration", value: "integration" },
  { label: "Working", value: "working" },
];

export default ItemPage;
