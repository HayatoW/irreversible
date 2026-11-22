import "../../src/App.css";
import type { ReactNode } from "react";

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <nav
          aria-label="Main"
          className="mx-auto flex max-w-3xl items-center justify-between gap-6 px-6 py-5"
        >
          <a className="font-artemis text-lg font-semibold hover:underline" href="/">
            Irreversible
          </a>
          <a className="font-artemis hover:underline" href="/posts">
            Posts
          </a>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:py-16">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-3xl gap-6 px-6 py-5 text-sm text-muted-foreground">
          <a className="hover:underline" href="https://github.com/HayatoW">
            GitHub
          </a>
          <a className="hover:underline" href="https://x.com/nabecmdctrl">
            X
          </a>
        </div>
      </footer>
    </div>
  );
}
