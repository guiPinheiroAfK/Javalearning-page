import { CodeBlock } from "@/components/topic/CodeBlock";

interface CodeComparisonProps {
  wrongCode: string;
  rightCode: string;
}

export function CodeComparison({ wrongCode, rightCode }: CodeComparisonProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-destructive">
          <span aria-hidden>❌</span> Errado
        </div>
        <CodeBlock code={wrongCode} />
      </div>
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-success">
          <span aria-hidden>✅</span> Certo
        </div>
        <CodeBlock code={rightCode} />
      </div>
    </div>
  );
}
