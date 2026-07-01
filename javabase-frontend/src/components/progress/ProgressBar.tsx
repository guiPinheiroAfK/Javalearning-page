import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  label?: string;
  completed: number;
  total: number;
}

export function ProgressBar({ label, completed, total }: ProgressBarProps) {
  const percent = total === 0 ? 0 : (completed / total) * 100;

  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-foreground">{label}</span>
          <span className="text-muted-foreground">
            {completed}/{total}
          </span>
        </div>
      )}
      <Progress value={percent} />
    </div>
  );
}
