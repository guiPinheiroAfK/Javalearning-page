export type Category =
  | "FUNDAMENTOS"
  | "OOP"
  | "ARMADILHAS"
  | "COLLECTIONS"
  | "EXCEPTIONS"
  | "JAVA_MODERNO"
  | "ECOSSISTEMA"
  | "SPRING_BOOT"
  | "HTTP_REST"
  | "SQL";

export type Difficulty = "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";

export interface TopicSummary {
  slug: string;
  title: string;
  category: Category;
  orderIndex: number;
  difficulty: Difficulty;
  completed: boolean;
}

export type TopicsGrouped = Partial<Record<Category, TopicSummary[]>>;

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  orderIndex: number;
}

export interface TopicDetail {
  slug: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  content: string;
  codeExample: string;
  codeExampleBad: string | null;
  keyPoints: string[];
  relatedTopicSlugs: string[];
  quizzes: QuizQuestion[];
  completed: boolean;
  quizScore: number | null;
}

export interface TopicSearchResult {
  slug: string;
  title: string;
  category: Category;
  snippet: string;
}

export interface RelatedTopic {
  slug: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
}

export interface TopicProgress {
  topicSlug: string;
  completed: boolean;
  completedAt: string | null;
}

export interface QuizQuestionResult {
  questionId: number;
  correct: boolean;
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  correct: number;
  results: QuizQuestionResult[];
}

export interface CompletedTopic {
  slug: string;
  title: string;
  completedAt: string;
  quizScore: number | null;
}

export interface ProgressOverview {
  totalTopics: number;
  completedTopics: number;
  averageQuizScore: number | null;
  completed: CompletedTopic[];
}

export interface CategoryStats {
  category: Category;
  completed: number;
  total: number;
}

export interface ProgressStats {
  byCategory: CategoryStats[];
  totalCompleted: number;
  totalTopics: number;
  percentComplete: number;
  streakDias: number;
}

export interface StackEntry {
  version: string;
  topicSlug: string;
}

export interface SourceCode {
  className: string;
  sourceCode: string;
}

export interface ApiError {
  code: string;
  message: string;
  timestamp: string;
  fields?: Record<string, string>;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  FUNDAMENTOS: "Fundamentos",
  OOP: "OOP",
  ARMADILHAS: "Armadilhas Clássicas",
  COLLECTIONS: "Collections",
  EXCEPTIONS: "Exceptions",
  JAVA_MODERNO: "Java Moderno",
  ECOSSISTEMA: "Ecossistema",
  SPRING_BOOT: "Spring Boot",
  HTTP_REST: "HTTP & REST",
  SQL: "SQL",
};

export const CATEGORY_ORDER: Category[] = [
  "FUNDAMENTOS",
  "OOP",
  "ARMADILHAS",
  "COLLECTIONS",
  "EXCEPTIONS",
  "JAVA_MODERNO",
  "ECOSSISTEMA",
  "SPRING_BOOT",
  "HTTP_REST",
  "SQL",
];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  INICIANTE: "Iniciante",
  INTERMEDIARIO: "Intermediário",
  AVANCADO: "Avançado",
};
