import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SearchDialog } from "@/components/search/SearchDialog";

export function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Atalho global Cmd/Ctrl+K para abrir a busca, de qualquer página
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header onOpenSearch={() => setSearchOpen(true)} onToggleMobileNav={() => setMobileNavOpen((v) => !v)} />
      <div className="flex flex-1">
        <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={closeMobileNav} />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
