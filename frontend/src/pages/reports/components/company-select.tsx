import { Building2 } from "lucide-react";
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
    <div className="mb-4 flex flex-col gap-2 rounded-xl border border-brand-border bg-brand-card p-4 shadow-xs md:flex-row md:items-center">
      <div className="flex items-center gap-2 text-sm font-medium text-brand-ink md:w-48">
        <Building2 className="h-4 w-4 text-brand-accent" />
        Company
      </div>
      <div className="w-full md:max-w-sm">
        <SelectList
          name="company_id"
          label={isLoading ? "Loading companies…" : "Select company *"}
          options={companies}
          value={value ? Number(value) : null}
          onChange={(id) => onChange(id ? String(id) : "")}
        />
      </div>
    </div>
  );
};

export default CompanySelect;
