import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Flame, Target, Trophy } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useTopics } from "@/hooks/useTopics";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryMeta";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/types";
import { cn } from "@/lib/utils";

export function ProgressDashboard() {
  const { overview, stats, loading } = useProgress();
  const { topics } = useTopics();

  // "Próximos tópicos sugeridos": prioriza tópicos não concluídos da mesma categoria
  // do último tópico concluído — mantém o usuário numa trilha coerente.
  const suggestions = useMemo(() => {
    if (!topics || !overview) {
      return [];
    }

    const completedSlugs = new Set(overview.completed.map((c) => c.slug));
    const lastCompletedSlug = overview.completed[0]?.slug;
    const lastCategory = lastCompletedSlug
      ? CATEGORY_ORDER.find((category) => topics[category]?.some((t) => t.slug === lastCompletedSlug))
      : undefined;

    const all = CATEGORY_ORDER.flatMap((category) => topics[category] ?? []);
    const notCompleted = all.filter((t) => !completedSlugs.has(t.slug));

    if (lastCategory) {
      notCompleted.sort((a, b) => {
        if (a.category === lastCategory && b.category !== lastCategory) return -1;
        if (b.category === lastCategory && a.category !== lastCategory) return 1;
        return 0;
      });
    }

    return notCompleted.slice(0, 4);
  }, [topics, overview]);

  if (loading || !overview || !stats) {
    return <p className="p-6 text-sm text-muted-foreground">Carregando progresso...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Target className="size-8 shrink-0 text-primary" />
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {stats.totalCompleted}/{stats.totalTopics}
              </p>
              <p className="text-xs text-muted-foreground">{Math.round(stats.percentComplete)}% concluído</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Trophy className="size-8 shrink-0 text-primary" />
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {overview.averageQuizScore !== null ? `${Math.round(overview.averageQuizScore)}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Média nos quizzes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Flame className="size-8 shrink-0 text-primary" />
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.streakDias}</p>
              <p className="text-xs text-muted-foreground">dia{stats.streakDias === 1 ? "" : "s"} seguidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progresso por categoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* stats.byCategory vem de uma query SQL agregada (GROUP BY) sem ordem
              pedagógica garantida — reordena pela mesma sequência usada no Sidebar. */}
          {CATEGORY_ORDER.filter((category) => stats.byCategory.some((c) => c.category === category)).map(
            (category) => {
              const cat = stats.byCategory.find((c) => c.category === category)!;
              return (
                <ProgressBar
                  key={cat.category}
                  label={CATEGORY_LABELS[cat.category]}
                  completed={cat.completed}
                  total={cat.total}
                />
              );
            },
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Concluídos recentemente</CardTitle>
          </CardHeader>
          <CardContent>
            {overview.completed.length === 0 ? (
              <p className="text-sm text-muted-foreground">Você ainda não concluiu nenhum tópico.</p>
            ) : (
              <ul className="space-y-2">
                {overview.completed.slice(0, 6).map((topic) => (
                  <li key={topic.slug}>
                    <Link
                      to={`/topicos/${topic.slug}`}
                      className="flex items-center justify-between text-sm text-foreground hover:text-primary"
                    >
                      <span className="truncate">{topic.title}</span>
                      {topic.quizScore !== null && (
                        <span className="ml-2 shrink-0 text-xs text-muted-foreground">{topic.quizScore}%</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos tópicos sugeridos</CardTitle>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Você concluiu todos os tópicos disponíveis! 🎉</p>
            ) : (
              <ul className="space-y-2">
                {suggestions.map((topic) => {
                  const Icon = CATEGORY_ICONS[topic.category];
                  return (
                    <li key={topic.slug}>
                      <Link
                        to={`/topicos/${topic.slug}`}
                        className="flex items-center gap-2 text-sm text-foreground hover:text-primary"
                      >
                        <Icon className={cn("size-4 shrink-0", CATEGORY_COLORS[topic.category])} />
                        <span className="truncate">{topic.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
