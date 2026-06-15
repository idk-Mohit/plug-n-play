import { timeFormat } from "d3-time-format";

export const FooterRowCount = ({
  rowCount,
}: {
  rowCount?: number | string | null;
}) => {
  if (rowCount == null || rowCount === "") return null;

  const count = typeof rowCount === "number" ? rowCount : Number(rowCount);
  if (Number.isNaN(count)) return null;

  return (
    <span className="text-muted-foreground">Rows: {count.toLocaleString()}</span>
  );
};

export const UploadDate = ({ date }: { date: string | null | undefined }) => {
  if (!date) return null;

  const formatLocalTime = timeFormat("%B %d, %Y %I:%M %p");
  const localDate = new Date(date);
  if (Number.isNaN(localDate.getTime())) return null;
  const formattedDate = formatLocalTime(localDate);

  return (
    <span className="text-muted-foreground">Upload Date: {formattedDate}</span>
  );
};
