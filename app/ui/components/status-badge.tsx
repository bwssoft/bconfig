import { cn } from "@/app/lib/util";

interface Props {
  status: "success" | "neutral" | "error";
  label: string;
  iconClassname?: string;
}

export function StatusBadge(props: Props) {
  const { status, label, iconClassname } = props;
  return (
    <div className="flex items-center gap-1">
      <div className={cn(statuses[status], "flex-none rounded-full p-1")}>
        <div
          className={cn("h-1.5 w-1.5 rounded-full bg-current", iconClassname)}
        />
      </div>
      <div className={cn("hidden font-semibold sm:block", text[status])}>
        {label}
      </div>
    </div>
  );
}

const statuses = {
  neutral: "text-gray-500 bg-gray-800/20",
  success: "text-green-500 bg-green-800/20",
  error: "text-rose-500 bg-rose-800/20",
};

const text = {
  neutral: "text-gray-800",
  success: "text-green-800",
  error: "text-rose-800",
};
