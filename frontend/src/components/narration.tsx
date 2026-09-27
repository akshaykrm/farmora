type Props = {
  value: string;
};

export function ClipText(props: Props) {
  const { value } = props;

  return (
    <span className="block max-w-40 truncate cursor-pointer">
      {value || "-"}
    </span>
  );
}
