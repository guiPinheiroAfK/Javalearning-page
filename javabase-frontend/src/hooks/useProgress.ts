import { useCallback, useEffect, useMemo, useReducer } from "react";
import { fetchProgressOverview, fetchProgressStats, markTopicComplete, submitQuiz } from "@/lib/api";
import type { ProgressOverview, ProgressStats, QuizResult } from "@/types";

// Estado compartilhado em módulo (não por instância do hook): Sidebar, HomePage, TopicPage
// e DashboardPage usam useProgress() ao mesmo tempo. Se cada um guardasse seu próprio
// useState, completar um tópico na TopicPage nunca atualizaria o checkmark no Sidebar
// (cada instância teria seu próprio reload isolado). Com o estado em módulo + um pub-sub
// simples, uma chamada a reload() em qualquer componente notifica todos os outros.
let overview: ProgressOverview | null = null;
let stats: ProgressStats | null = null;
let loading = true;
let initialized = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

async function reloadShared() {
  loading = true;
  notify();
  try {
    const [overviewData, statsData] = await Promise.all([fetchProgressOverview(), fetchProgressStats()]);
    overview = overviewData;
    stats = statsData;
  } finally {
    loading = false;
    notify();
  }
}

export function useProgress() {
  const [, forceRender] = useReducer((c: number) => c + 1, 0);

  useEffect(() => {
    listeners.add(forceRender);
    if (!initialized) {
      initialized = true;
      reloadShared();
    }
    return () => {
      listeners.delete(forceRender);
    };
  }, []);

  const completedSlugs = useMemo(() => new Set(overview?.completed.map((c) => c.slug) ?? []), [overview]);

  const complete = useCallback(async (topicSlug: string) => {
    await markTopicComplete(topicSlug);
    await reloadShared();
  }, []);

  const answerQuiz = useCallback(async (topicSlug: string, answers: number[]): Promise<QuizResult> => {
    const result = await submitQuiz(topicSlug, answers);
    await reloadShared();
    return result;
  }, []);

  return { overview, stats, loading, completedSlugs, complete, answerQuiz, reload: reloadShared };
}
