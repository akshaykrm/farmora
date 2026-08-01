import { Card } from "@mui/material";

type Props = {
  label: string;
  value: number;
};

const PriceCard = (props: Props) => {
  const { label, value } = props;

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold capitalize text-brand-ink-soft">
          {label}
        </h3>

        <p
          className={`text-3xl font-bold tracking-tight tabular-nums ${
            value > 0 ? "text-brand-success" : "text-brand-danger"
          }`}
        >
          {value}
        </p>
      </div>
    </Card>
  );
};

export default PriceCard;
