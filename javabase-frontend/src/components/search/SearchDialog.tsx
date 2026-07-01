import { useEffect, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { searchTopics } from "@/lib/api";
import { CATEGORY_LABELS, type TopicSearchResult } from "@/types";
import { cn } from "@/lib/utils";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TopicSearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
    }
  }, [open]);

  // Debounce de 300ms: evita disparar uma request a cada tecla digitada
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      searchTopics(query.trim())
        .then((data) => {
          setResults(data);
          setActiveIndex(0);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  function goTo(slug: string) {
    onOpenChange(false);
    navigate(`/topicos/${slug}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      goTo(results[activeIndex].slug);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0" showClose={false}>
        <DialogTitle className="sr-only">Buscar tópicos</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por título ou conteúdo..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {loading && <p className="p-3 text-sm text-muted-foreground">Buscando...</p>}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="p-3 text-sm text-muted-foreground">Nenhum resultado para "{query}".</p>
          )}

          {!loading && query.trim().length < 2 && (
            <p className="p-3 text-sm text-muted-foreground">Digite ao menos 2 caracteres para buscar.</p>
          )}

          {results.map((result, index) => (
            <button
              key={result.slug}
              type="button"
              onClick={() => goTo(result.slug)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                "flex w-full flex-col gap-0.5 rounded-md px-3 py-2 text-left transition-colors",
                index === activeIndex ? "bg-accent" : "",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                {result.title}
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {CATEGORY_LABELS[result.category]}
                </span>
              </span>
              <span className="line-clamp-1 text-xs text-muted-foreground">{result.snippet}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
