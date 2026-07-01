import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

// Bundle "fine-grained": só carrega o motor wasm + o tema claro/escuro + a linguagem Java,
// em vez do bundle completo do shiki (que empacota centenas de linguagens que nunca usamos aqui).
let highlighterPromise: Promise<HighlighterCore> | null = null;

export function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [import("shiki/themes/github-dark.mjs"), import("shiki/themes/github-light.mjs")],
      langs: [import("shiki/langs/java.mjs")],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    });
  }
  return highlighterPromise;
}
