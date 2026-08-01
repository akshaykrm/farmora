type Props = {
  id: string;
  name: string;
};

const Label = ({ id, name }: Props) => {
  return (
    <label className="mb-2 block text-sm font-bold text-brand-ink-soft" htmlFor={id}>
      {name}
    </label>
  );
};

export default Label;
