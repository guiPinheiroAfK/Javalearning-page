import axios from "axios";
import type {
  ProgressOverview,
  ProgressStats,
  QuizResult,
  RelatedTopic,
  SourceCode,
  StackEntry,
  TopicDetail,
  TopicProgress,
  TopicSearchResult,
  TopicsGrouped,
} from "@/types";
import { getSessionId } from "@/lib/session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1",
});

export async function fetchTopicsGrouped(): Promise<TopicsGrouped> {
  const { data } = await api.get<TopicsGrouped>("/topics");
  return data;
}

export async function fetchTopicBySlug(slug: string): Promise<TopicDetail> {
  const { data } = await api.get<TopicDetail>(`/topics/${slug}`, {
    params: { sessionId: getSessionId() },
  });
  return data;
}

export async function searchTopics(query: string): Promise<TopicSearchResult[]> {
  const { data } = await api.get<TopicSearchResult[]>("/topics/search", {
    params: { q: query },
  });
  return data;
}

export async function fetchRelatedTopics(slug: string): Promise<RelatedTopic[]> {
  const { data } = await api.get<RelatedTopic[]>(`/topics/${slug}/related`);
  return data;
}

export async function markTopicComplete(topicSlug: string): Promise<TopicProgress> {
  const { data } = await api.post<TopicProgress>("/progress/complete", {
    sessionId: getSessionId(),
    topicSlug,
  });
  return data;
}

export async function submitQuiz(topicSlug: string, answers: number[]): Promise<QuizResult> {
  const { data } = await api.post<QuizResult>("/progress/quiz", {
    sessionId: getSessionId(),
    topicSlug,
    answers,
  });
  return data;
}

export async function fetchProgressOverview(): Promise<ProgressOverview> {
  const { data } = await api.get<ProgressOverview>(`/progress/${getSessionId()}`);
  return data;
}

export async function fetchProgressStats(): Promise<ProgressStats> {
  const { data } = await api.get<ProgressStats>(`/progress/${getSessionId()}/stats`);
  return data;
}

export async function fetchStack(): Promise<Record<string, StackEntry>> {
  const { data } = await api.get<Record<string, StackEntry>>("/meta/stack");
  return data;
}

export async function fetchSourceCode(className: string): Promise<SourceCode> {
  const { data } = await api.get<SourceCode>(`/meta/source/${className}`);
  return data;
}

export default api;
