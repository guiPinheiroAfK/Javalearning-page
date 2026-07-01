import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchSourceCode } from "@/lib/api";
import { CodeBlock } from "@/components/topic/CodeBlock";
import { cn } from "@/lib/utils";

const AVAILABLE_CLASSES = [
  { name: "TopicService", description: "@Cacheable, injeção de dependência" },
  { name: "TopicSnapshotCache", description: "cache dedicado — evita self-invocation" },
  { name: "ProgressService", description: "@Transactional, upsert de progresso" },
  { name: "MetaService", description: "leitura segura do próprio código-fonte" },
  { name: "TopicController", description: "@RestController, @GetMapping" },
  { name: "ProgressController", description: "@PostMapping, ResponseEntity" },
  { name: "MetaController", description: "os endpoints que servem esta página" },
  { name: "GlobalExceptionHandler", description: "@RestControllerAdvice" },
  { name: "CacheConfig", description: "Caffeine, TTL por cache" },
  { name: "SecurityConfig", description: "CORS, sem login" },
];

export function SourceCodePage() {
  const { className: paramClassName } = useParams<{ className: string }>();
  const navigate = useNavigate();
  const className = paramClassName ?? "TopicService";

  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSource(null);
    fetchSourceCode(className)
      .then((data) => setSource(data.sourceCode))
      .catch(() => setError("Não foi possível carregar esse arquivo. Ele pode não estar na whitelist do MetaService."))
      .finally(() => setLoading(false));
  }, [className]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-foreground">Código-fonte real</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Isso não é um exemplo isolado — é o{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 text-primary">.java</code> de verdade que compilou o
        backend que está servindo esta página agora (lido via <code className="rounded bg-code-bg px-1.5 py-0.5 text-primary">GET /api/v1/meta/source/{"{"}className{"}"}</code>).
      </p>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {AVAILABLE_CLASSES.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => navigate(`/codigo-fonte/${item.name}`)}
              className={cn(
                "block w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                item.name === className
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <span className="block">{item.name}</span>
              <span className="block text-xs opacity-70">{item.description}</span>
            </button>
          ))}
        </nav>

        <div>
          {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {source && (
            <div className="max-h-[70vh] overflow-y-auto rounded-lg border border-border">
              <CodeBlock code={source} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
