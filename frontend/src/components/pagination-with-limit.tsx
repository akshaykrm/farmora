import { DEFAULT_PAGE_LIMIT } from "@config";
import { Box, MenuItem, Pagination, Select, Typography } from "@mui/material";

type PaginationProps = {
  totalPages: number;
  page: number;
  limit?: number;
  limits?: number[];
  onChange: (v: { page?: number; limit?: number }) => void;
};

function LimitSelect({
  limit,
  limits,
  onChange,
}: {
  limit: number;
  limits: number[];
  onChange: (limit: number) => void;
}) {
  return (
    <Box className="flex items-center gap-2">
      <Typography variant="body2">Rows per page:</Typography>
      <Select
        size="small"
        variant="standard"
        disableUnderline
        sx={{ fontSize: "0.875rem", "& .MuiSelect-select": { py: 0 } }}
        value={limit}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {limits.map((l) => (
          <MenuItem key={l} value={l}>
            {l}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}

function PaginationWithLimit(props: PaginationProps) {
  const { onChange, page, totalPages } = props;
  if (totalPages < 2) {
    return null;
  }
  const limits = props.limits ?? [10, 25, 50];
  const limit = props.limit ?? limits[0];

  return (
    <Box className="flex items-center justify-end gap-4 mt-4">
      <LimitSelect
        limit={limit}
        limits={limits}
        onChange={(l) => onChange({ limit: l, page: 1 })}
      />
      <Pagination
        count={totalPages}
        size="small"
        page={page}
        onChange={(_, p) => onChange({ page: p })}
      />
    </Box>
  );
}

export default PaginationWithLimit;
