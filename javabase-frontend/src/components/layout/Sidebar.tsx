import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useTopics } from "@/hooks/useTopics";
import { useProgress } from "@/hooks/useProgress";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryMeta";
import { CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_TRACK, TRACK_LABELS, TRACK_ORDER } from "@/types";
import { CompletionBadge } from "@/components/progress/CompletionBadge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { topics, loading } = useTopics();
  const { completedSlugs, stats } = useProgress();
  const { slug: activeSlug } = useParams<{ slug: string }>();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  function toggleCategory(category: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  const percent = stats?.percentComplete ?? 0;

  const content = (
    <>
      <div className="border-b border-border p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progresso geral</span>
          <span className="font-medium text-foreground">{Math.round(percent)}%</span>
        </div>
        <Progress value={percent} />
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {loading && <div className="p-2 text-sm text-muted-foreground">Carregando...</div>}
        {TRACK_ORDER.map((track) => {
          const categoriesInTrack = CATEGORY_ORDER.filter((category) => CATEGORY_TRACK[category] === track);
          const hasAnyItems = categoriesInTrack.some((category) => (topics?.[category]?.length ?? 0) > 0);
          if (!hasAnyItems) {
            return null;
          }

          return (
            <div key={track} className="mb-3">
              <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                {TRACK_LABELS[track]}
              </p>

              {categoriesInTrack.map((category) => {
                const items = topics?.[category];
                if (!items || items.length === 0) {
                  return null;
                }

                const Icon = CATEGORY_ICONS[category];
                const isCollapsed = collapsedCategories.has(category);
                const completedCount = items.filter((t) => completedSlugs.has(t.slug)).length;

                return (
                  <div key={category} className="mb-1">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium text-foreground hover:bg-accent"
                    >
                      <Icon className={cn("size-4 shrink-0", CATEGORY_COLORS[category])} />
                      <span className="flex-1 truncate">{CATEGORY_LABELS[category]}</span>
                      <span className="text-xs text-muted-foreground">
                        {completedCount}/{items.length}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-3.5 shrink-0 text-muted-foreground transition-transform",
                          isCollapsed && "-rotate-90",
                        )}
                      />
                    </button>

                    {!isCollapsed && (
                      <ul className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3">
                        {items.map((topic) => {
                          const isActive = topic.slug === activeSlug;
                          const isCompleted = completedSlugs.has(topic.slug);
                          return (
                            <li key={topic.slug}>
                              <Link
                                to={`/topicos/${topic.slug}`}
                                onClick={onCloseMobile}
                                className={cn(
                                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                                  isActive
                                    ? "bg-primary/10 font-medium text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                )}
                              >
                                <span className="flex-1 truncate">{topic.title}</span>
                                {isCompleted && <CompletionBadge />}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-sidebar">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
