import { Pin } from "lucide-react";

interface KeyPointsProps {
  points: string[];
}

export function KeyPoints({ points }: KeyPointsProps) {
  if (points.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-border bg-muted/40 p-4">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Pin className="size-4 text-primary" />
        Pontos-chave
      </h3>
      <ul className="space-y-1.5">
        {points.map((point, index) => (
          <li key={index} className="flex gap-2 text-sm text-muted-foreground">
            <span className="text-primary">•</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
