import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavBarProps {
  activePath?: string;
}

export function NavBar({ activePath = "/" }: NavBarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between py-4">
        <Link href="/" className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6" />
          <span className="font-bold text-xl">Izzy</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/about"
            className={cn(
              "text-sm font-medium text-muted-foreground hover:text-foreground",
              activePath === "/about" && "text-foreground"
            )}
          >
            About
          </Link>
          {activePath !== "/terms" && activePath !== "/privacy" && (
            <Link
              href={activePath === "/" ? "#how-it-works" : "/#how-it-works"}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              How It Works
            </Link>
          )}
          {(activePath === "/terms" || activePath === "/privacy") && (
            <>
              <Link
                href="/terms"
                className={cn(
                  "text-sm font-medium text-muted-foreground hover:text-foreground",
                  activePath === "/terms" && "text-foreground"
                )}
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className={cn(
                  "text-sm font-medium text-muted-foreground hover:text-foreground",
                  activePath === "/privacy" && "text-foreground"
                )}
              >
                Privacy
              </Link>
            </>
          )}
          <Button size="sm" asChild>
            <Link href="/get-started">Get Started</Link>
          </Button>
        </nav>
        <Button size="sm" className="md:hidden" asChild>
          <Link href="/get-started">Get Started</Link>
        </Button>
      </div>
    </header>
  );
}