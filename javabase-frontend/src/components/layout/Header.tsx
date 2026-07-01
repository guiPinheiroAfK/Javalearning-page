import { Link } from "react-router-dom";
import { Code2, Menu, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/useDarkMode";

interface HeaderProps {
  onOpenSearch: () => void;
  onToggleMobileNav: () => void;
}

export function Header({ onOpenSearch, onToggleMobileNav }: HeaderProps) {
  const { isDark, toggle } = useDarkMode();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleMobileNav} aria-label="Abrir menu">
        <Menu className="size-4" />
      </Button>

      <Link to="/" className="flex shrink-0 items-center gap-2 font-semibold text-foreground">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          J
        </span>
        <span className="hidden sm:inline">JavaBase</span>
      </Link>

      <div className="flex flex-1 justify-center">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex w-full max-w-md items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Buscar tópicos...</span>
          <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] sm:inline">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Progresso
          </Button>
        </Link>
        <Link to="/codigo-fonte/TopicService" title="Veja o código-fonte real do backend">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Code2 className="size-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema claro/escuro">
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>
    </header>
  );
}
