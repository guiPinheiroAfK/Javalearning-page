import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompletionBadgeProps {
  className?: string;
}

export function CompletionBadge({ className }: CompletionBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-success/15 text-success",
        className,
      )}
      title="Concluído"
    >
      <Check className="size-3" strokeWidth={3} />
    </span>
  );
}
