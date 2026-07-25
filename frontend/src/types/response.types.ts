export type ListResponse<T> = {
  data: T[];
  totalPages: number;
  limit: number;
  page: number;
  count: number;
};
