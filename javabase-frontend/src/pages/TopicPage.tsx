import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchRelatedTopics, fetchTopicBySlug } from "@/lib/api";
import { useTopics } from "@/hooks/useTopics";
import { useProgress } from "@/hooks/useProgress";
import { TopicContent } from "@/components/topic/TopicContent";
import { CodeBlock } from "@/components/topic/CodeBlock";
import { CodeComparison } from "@/components/topic/CodeComparison";
import { KeyPoints } from "@/components/topic/KeyPoints";
import { QuizSection } from "@/components/topic/QuizSection";
import { RelatedTopics } from "@/components/topic/RelatedTopics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, CATEGORY_ORDER, DIFFICULTY_LABELS, type RelatedTopic, type TopicDetail } from "@/types";

export function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { topics } = useTopics();
  const { completedSlugs, complete } = useProgress();

  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [related, setRelated] = useState<RelatedTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!slug) {
      return;
    }
    setLoading(true);
    setTopic(null);
    Promise.all([fetchTopicBySlug(slug), fetchRelatedTopics(slug)])
      .then(([topicData, relatedData]) => {
        setTopic(topicData);
        setRelated(relatedData);
      })
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0 });
  }, [slug]);

  const flatList = CATEGORY_ORDER.flatMap((category) => topics?.[category] ?? []);
  const currentIndex = flatList.findIndex((t) => t.slug === slug);
  const previousTopic = currentIndex > 0 ? flatList[currentIndex - 1] : null;
  const nextTopic = currentIndex >= 0 && currentIndex < flatList.length - 1 ? flatList[currentIndex + 1] : null;

  const goPrevious = useCallback(() => {
    if (previousTopic) {
      navigate(`/topicos/${previousTopic.slug}`);
    }
  }, [previousTopic, navigate]);

  const goNext = useCallback(() => {
    if (nextTopic) {
      navigate(`/topicos/${nextTopic.slug}`);
    }
  }, [nextTopic, navigate]);

  // Keyboard shortcut ← → pra navegar entre tópicos — ignorado enquanto o usuário digita.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA"].includes(target.tagName)) {
        return;
      }
      if (event.key === "ArrowLeft") {
        goPrevious();
      } else if (event.key === "ArrowRight") {
        goNext();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrevious, goNext]);

  async function handleComplete() {
    if (!slug) {
      return;
    }
    setMarking(true);
    try {
      await complete(slug);
    } finally {
      setMarking(false);
    }
  }

  if (loading || !topic) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-sm text-muted-foreground">Carregando tópico...</div>
    );
  }

  const isCompleted = completedSlugs.has(topic.slug) || topic.completed;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{CATEGORY_LABELS[topic.category]}</span>
        <span>/</span>
        <span className="text-foreground">{topic.title}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{topic.title}</h1>
        <Badge variant="outline">{DIFFICULTY_LABELS[topic.difficulty]}</Badge>
      </div>

      <TopicContent content={topic.content} />

      <div className="my-6">
        <CodeBlock code={topic.codeExample} />
      </div>

      {topic.codeExampleBad && <CodeComparison wrongCode={topic.codeExampleBad} rightCode={topic.codeExample} />}

      <KeyPoints points={topic.keyPoints} />

      <QuizSection topicSlug={topic.slug} quizzes={topic.quizzes} />

      <div className="mb-8">
        <Button variant={isCompleted ? "outline" : "default"} onClick={handleComplete} disabled={marking || isCompleted}>
          <CheckCircle2 className="size-4" />
          {isCompleted ? "Concluído" : "Marcar como concluído"}
        </Button>
      </div>

      <RelatedTopics topics={related} />

      <div className="flex items-center justify-between border-t border-border pt-6">
        <Button variant="outline" onClick={goPrevious} disabled={!previousTopic}>
          <ChevronLeft className="size-4" /> Anterior
        </Button>
        <Button variant="outline" onClick={goNext} disabled={!nextTopic}>
          Próximo <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
