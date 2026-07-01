import type { ReactNode } from "react";

interface TopicContentProps {
  content: string;
}

export function TopicContent({ content }: TopicContentProps) {
  const blocks = content.split("\n\n");

  return (
    <div className="prose-javabase">
      {blocks.map((block, index) => (
        <ContentBlock key={index} block={block} />
      ))}
    </div>
  );
}

function ContentBlock({ block }: { block: string }) {
  const trimmed = block.trim();

  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    const inner = trimmed.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "");
    return (
      <pre className="mb-4 overflow-x-auto rounded-lg border border-border bg-code-bg p-4 font-mono text-sm text-foreground">
        {inner}
      </pre>
    );
  }

  if (trimmed.startsWith("|")) {
    return <MarkdownTable text={trimmed} />;
  }

  return <p>{renderInline(trimmed)}</p>;
}

function MarkdownTable({ text }: { text: string }) {
  const lines = text.split("\n").filter(Boolean);
  const [headerLine, , ...rowLines] = lines;
  const headers = splitRow(headerLine);
  const rows = rowLines.map(splitRow);

  return (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="border-b border-border px-3 py-2 text-left font-semibold text-foreground">
                {renderInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border-b border-border px-3 py-2 text-muted-foreground">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function splitRow(line: string): string[] {
  return line
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell, index, arr) => !(cell === "" && (index === 0 || index === arr.length - 1)));
}

// Parser mínimo pra **negrito** e `código inline` — o conteúdo do JavaBase não usa
// nenhuma outra sintaxe Markdown, então não precisa de uma lib de parsing completa.
function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(<code key={key++}>{token.slice(1, -1)}</code>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
