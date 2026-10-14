import SelectList from "@components/select-list";
import { useReportCompanies } from "../api";

type Props = {
  value?: string;
  onChange: (companyId: string) => void;
};

/** Super admin picks which company a company report runs for. */
const CompanySelect = ({ value, onChange }: Props) => {
  const { data: companies = [], isLoading } = useReportCompanies(true);
  return (
    <SelectList
      name="company_id"
      label={isLoading ? "Loading companies…" : "Company *"}
      options={companies}
      value={value ? Number(value) : null}
      onChange={(id) => onChange(id ? String(id) : "")}
    />
  );
};

export default CompanySelect;
