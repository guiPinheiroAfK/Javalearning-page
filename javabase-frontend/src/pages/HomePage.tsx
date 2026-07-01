import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTopics } from "@/hooks/useTopics";
import { useProgress } from "@/hooks/useProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryMeta";
import { CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_TRACK, TRACK_LABELS, TRACK_ORDER } from "@/types";
import { cn } from "@/lib/utils";

export function HomePage() {
  const { topics, loading } = useTopics();
  const { completedSlugs } = useProgress();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <section className="text-center">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" />
          Java 21 + Spring Boot 3.4 + React
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Domine Java do Zero ao Spring Boot
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Fundamentos na prática — cada conceito com código real, exemplos executáveis e quiz pra fixar.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/topicos/variaveis-tipos-primitivos">
            <Button size="lg">
              Começar pelos Fundamentos <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline">
              Ver meu progresso
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-16">
        {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {TRACK_ORDER.map((track) => {
          const categoriesInTrack = CATEGORY_ORDER.filter((category) => CATEGORY_TRACK[category] === track);
          const hasAnyItems = categoriesInTrack.some((category) => (topics?.[category]?.length ?? 0) > 0);
          if (!hasAnyItems) {
            return null;
          }

          return (
            <div key={track} className="mb-10 last:mb-0">
              <h2 className="mb-4 text-lg font-semibold text-foreground">{TRACK_LABELS[track]}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoriesInTrack.map((category) => {
                  const items = topics?.[category];
                  if (!items || items.length === 0) {
                    return null;
                  }
                  const Icon = CATEGORY_ICONS[category];
                  const completedCount = items.filter((t) => completedSlugs.has(t.slug)).length;

                  return (
                    <Link key={category} to={`/topicos/${items[0].slug}`}>
                      <Card className="h-full transition-colors hover:border-primary/50">
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <Icon className={cn("size-5 shrink-0", CATEGORY_COLORS[category])} />
                            <span className="font-medium text-foreground">{CATEGORY_LABELS[category]}</span>
                            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                              {items.length} tópicos
                            </span>
                          </div>
                          <ProgressBar completed={completedCount} total={items.length} />
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-16 rounded-xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
        <h2 className="mb-2 text-lg font-semibold text-foreground">🔁 Meta-learning</h2>
        <p className="text-muted-foreground">
          Este site usa as mesmas tecnologias que ensina. O{" "}
          <code className="rounded bg-code-bg px-1.5 py-0.5 text-primary">@Cacheable</code> que você vai
          estudar? Ele está no código deste servidor. Veja o{" "}
          <Link to="/codigo-fonte/TopicService" className="text-primary underline underline-offset-2">
            código-fonte real
          </Link>{" "}
          rodando por trás desta página.
        </p>
      </section>
    </div>
  );
}
