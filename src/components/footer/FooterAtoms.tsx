import { activeViewAtom } from "@/state/ui/view";
import { timeFormat } from "d3-time-format";
import { useAtomValue } from "jotai";

export const FooterRowCount = ({
  rowCount,
}: {
  rowCount?: number | string | null;
}) => {
  const activeView = useAtomValue(activeViewAtom);
  if (activeView.view !== "dashboard" || !rowCount) return null;

  const count = typeof rowCount === "number" ? rowCount : Number(rowCount);
  return <span className="text-gray-300">Rows: {count}</span>;
};

export const UploadDate = ({ date }: { date: string | null | undefined }) => {
  const activeView = useAtomValue(activeViewAtom);
  if (activeView.view !== "dashboard" || !date) return null;

  const formatLocalTime = timeFormat("%B %d, %Y %I:%M %p");
  const localDate = new Date(date); // automatically parses UTC and converts to local time
  const formattedDate = formatLocalTime(localDate);

  return <span className="text-gray-300">Upload Date: {formattedDate}</span>;
};
