import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHighlighter } from "@/lib/highlighter";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = "java", className }: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHtml(null);
    getHighlighter()
      .then((highlighter) =>
        highlighter.codeToHtml(code, {
          lang: language,
          themes: { light: "github-light", dark: "github-dark" },
        }),
      )
      .then((result) => {
        if (!cancelled) {
          setHtml(result);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={cn("group relative overflow-hidden rounded-lg border border-border bg-code-bg", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="absolute right-2 top-2 z-10 size-7 bg-card/80 opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Copiar código"
      >
        {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
      </Button>

      {html ? (
        <div
          className="overflow-x-auto text-sm [&_pre]:!bg-transparent [&_pre]:p-4"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto p-4 text-sm text-muted-foreground">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
