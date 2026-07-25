export type ListResponse<T> = {
  data: T[];
  limit: number;
  page: number;
  count: number;
};
