import { useEffect, useState } from "react";
import { fetchTopicsGrouped } from "@/lib/api";
import type { TopicsGrouped } from "@/types";

// Cache em módulo: a listagem de tópicos raramente muda (o próprio backend já cacheia
// via @Cacheable("topics-list")) — evita refazer a request toda vez que o componente remonta.
let cachedTopics: TopicsGrouped | null = null;
let inFlightRequest: Promise<TopicsGrouped> | null = null;

export function useTopics() {
  const [topics, setTopics] = useState<TopicsGrouped | null>(cachedTopics);
  const [loading, setLoading] = useState(!cachedTopics);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedTopics) {
      return;
    }

    if (!inFlightRequest) {
      inFlightRequest = fetchTopicsGrouped();
    }

    inFlightRequest
      .then((data) => {
        cachedTopics = data;
        setTopics(data);
      })
      .catch(() => setError("Não foi possível carregar os tópicos."))
      .finally(() => setLoading(false));
  }, []);

  return { topics, loading, error };
}

export function invalidateTopicsCache() {
  cachedTopics = null;
  inFlightRequest = null;
}
