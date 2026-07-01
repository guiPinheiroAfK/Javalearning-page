import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfettiBurst } from "@/components/topic/ConfettiBurst";
import { useProgress } from "@/hooks/useProgress";
import type { QuizQuestion, QuizResult } from "@/types";
import { cn } from "@/lib/utils";

interface QuizSectionProps {
  topicSlug: string;
  quizzes: QuizQuestion[];
}

type Mode = "todas" | "sequencial";

export function QuizSection({ topicSlug, quizzes }: QuizSectionProps) {
  const { answerQuiz } = useProgress();
  const [mode, setMode] = useState<Mode>("todas");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (quizzes.length === 0) {
    return null;
  }

  const allAnswered = quizzes.every((q) => answers[q.id] !== undefined);
  const visibleQuizzes = mode === "todas" ? quizzes : [quizzes[currentIndex]];

  function selectAnswer(questionId: number, optionIndex: number) {
    if (result) {
      return; // trava a seleção depois de submeter
    }
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      // A ordem importa: o backend casa answers[i] com o quiz de orderIndex i.
      const orderedAnswers = quizzes.map((q) => answers[q.id] ?? -1);
      const response = await answerQuiz(topicSlug, orderedAnswers);
      setResult(response);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setAnswers({});
    setResult(null);
    setCurrentIndex(0);
  }

  return (
    <section className="relative mb-8">
      {result?.score === 100 && <ConfettiBurst />}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          📝 Quiz ({quizzes.length} pergunta{quizzes.length > 1 ? "s" : ""})
        </h3>
        {!result && (
          <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <TabsList>
              <TabsTrigger value="todas">Todas de uma vez</TabsTrigger>
              <TabsTrigger value="sequencial">Uma por vez</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      <div className="space-y-5">
        {visibleQuizzes.map((quiz) => {
          const questionResult = result?.results.find((r) => r.questionId === quiz.id);

          return (
            <div key={quiz.id} className="rounded-lg border border-border p-4">
              <p className="mb-3 text-sm font-medium text-foreground">{quiz.question}</p>
              <div className="space-y-2">
                {quiz.options.map((option, optionIndex) => {
                  const isSelected = answers[quiz.id] === optionIndex;
                  const isCorrectOption = !!questionResult && optionIndex === questionResult.correctIndex;
                  const isWrongSelected = !!questionResult && isSelected && !questionResult.correct;

                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      disabled={!!result}
                      onClick={() => selectAnswer(quiz.id, optionIndex)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                        !result && isSelected && "border-primary bg-primary/10",
                        !result && !isSelected && "border-border hover:bg-accent",
                        result && isCorrectOption && "border-success bg-success/10 text-success",
                        result && isWrongSelected && "border-destructive bg-destructive/10 text-destructive",
                        result && !isCorrectOption && !isWrongSelected && "border-border opacity-60",
                      )}
                    >
                      {result && isCorrectOption && <Check className="size-4 shrink-0" />}
                      {result && isWrongSelected && <X className="size-4 shrink-0" />}
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {questionResult && (
                <p className="mt-3 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                  {questionResult.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {mode === "sequencial" && !result && (
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
          >
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} / {quizzes.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex === quizzes.length - 1}
            onClick={() => setCurrentIndex((i) => i + 1)}
          >
            Próxima
          </Button>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        {!result ? (
          <Button disabled={!allAnswered || submitting} onClick={handleSubmit}>
            {submitting ? "Verificando..." : "Verificar Respostas"}
          </Button>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">
              Você acertou {result.correct}/{result.total} ({result.score}%)
            </p>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Tentar novamente
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
