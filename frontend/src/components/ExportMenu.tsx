import { useState, type MouseEvent } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import toast from "react-hot-toast";
import usePermissions from "@hooks/use-permissions";
import downloadFile from "@utils/download-file";

type ExportFormat = "xlsx" | "pdf";

const PAGINATION_KEYS = [
  "page",
  "limit",
  "c_page",
  "c_limit",
  "p_page",
  "p_limit",
  "e_page",
  "e_limit",
  "i_page",
  "i_limit",
  "s_page",
  "s_limit",
  "r_page",
  "r_limit",
  "b_page",
  "b_limit",
  "gc_page",
  "gc_limit",
  "gs_page",
  "gs_limit",
];

const FORMATS: { format: ExportFormat; label: string; icon: typeof FileText }[] =
  [
    { format: "xlsx", label: "Excel (.xlsx)", icon: FileSpreadsheet },
    { format: "pdf", label: "PDF", icon: FileText },
  ];

type Props = {
  permission: string;
  endpoint: string;
  filter: object;
  filename: string;
  disabled?: boolean;
  disabledReason?: string;
};

const ExportMenu = ({
  permission,
  endpoint,
  filter,
  filename,
  disabled = false,
  disabledReason,
}: Props) => {
  const { can } = usePermissions();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState<ExportFormat | null>(null);

  if (!can(permission)) return null;

  const onOpen = (event: MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const onClose = () => setAnchorEl(null);

  const onExport = async (format: ExportFormat) => {
    onClose();
    setLoading(format);
    const params: Record<string, unknown> = { ...filter, format };
    PAGINATION_KEYS.forEach((key) => delete params[key]);
    try {
      await downloadFile(endpoint, params, `${filename}.${format}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setLoading(null);
    }
  };

  const button = (
    <span>
      <Button
        variant="outlined"
        onClick={onOpen}
        disabled={disabled || loading !== null}
        startIcon={
          loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <Download className="h-4 w-4" />
          )
        }
      >
        Export
      </Button>
    </span>
  );

  return (
    <>
      {disabled && disabledReason ? (
        <Tooltip title={disabledReason} arrow>
          {button}
        </Tooltip>
      ) : (
        button
      )}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {FORMATS.map(({ format, label, icon: Icon }) => (
          <MenuItem key={format} onClick={() => onExport(format)}>
            <ListItemIcon>
              <Icon className="h-4 w-4" />
            </ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ExportMenu;
