import Button from "../ui/Button";

export function SecurityOption({
  title,
  description,
  actionText,
  onClick,
}: {
  title: string;
  description: string;
  actionText: string;
  onClick: () => void;
}) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-text-muted">{description}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onClick}>
        {actionText}
      </Button>
    </div>
  );
}
