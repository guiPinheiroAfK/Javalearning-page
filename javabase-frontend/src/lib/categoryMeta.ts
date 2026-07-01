import {
  AlertTriangle,
  BookOpen,
  Boxes,
  Database,
  Globe,
  Layers,
  Leaf,
  ShieldAlert,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/types";

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  FUNDAMENTOS: BookOpen,
  OOP: Boxes,
  ARMADILHAS: AlertTriangle,
  COLLECTIONS: Layers,
  EXCEPTIONS: ShieldAlert,
  JAVA_MODERNO: Sparkles,
  ECOSSISTEMA: Wrench,
  SPRING_BOOT: Leaf,
  HTTP_REST: Globe,
  SQL: Database,
};

export const CATEGORY_COLORS: Record<Category, string> = {
  FUNDAMENTOS: "text-blue-400",
  OOP: "text-purple-400",
  ARMADILHAS: "text-red-400",
  COLLECTIONS: "text-amber-400",
  EXCEPTIONS: "text-orange-400",
  JAVA_MODERNO: "text-pink-400",
  ECOSSISTEMA: "text-teal-400",
  SPRING_BOOT: "text-green-400",
  HTTP_REST: "text-cyan-400",
  SQL: "text-indigo-400",
};
