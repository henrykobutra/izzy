"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";

interface NavBarProps {
  activePath?: string;
}

export function NavBar({ activePath = "/" }: NavBarProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between py-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="Izzy Logo"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span className="font-bold text-xl text-primary">Izzy</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {!user ? (
            <>
              <Link
                href="/about"
                className={cn(
                  "text-sm font-medium text-muted-foreground hover:text-foreground",
                  activePath === "/about" && "text-foreground"
                )}
              >
                About
              </Link>
              {activePath !== "/terms" &&
                activePath !== "/privacy" &&
                activePath !== "/sign-in" && (
                  <Link
                    href={
                      activePath === "/" ? "#how-it-works" : "/#how-it-works"
                    }
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
                <Link href="/sign-in">Get Started</Link>
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  "text-sm font-medium text-muted-foreground hover:text-foreground",
                  activePath === "/dashboard" && "text-foreground"
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/resume"
                className={cn(
                  "text-sm font-medium text-muted-foreground hover:text-foreground",
                  activePath === "/resume" && "text-foreground"
                )}
              >
                My Resume
              </Link>
              <Link
                href="/interviews"
                className={cn(
                  "text-sm font-medium text-muted-foreground hover:text-foreground",
                  activePath === "/interviews" && "text-foreground"
                )}
              >
                Interview Prep
              </Link>
              <Link
                href="/history"
                className={cn(
                  "text-sm font-medium text-muted-foreground hover:text-foreground",
                  activePath === "/history" && "text-foreground"
                )}
              >
                History
              </Link>
              <div className="flex items-center gap-4 ml-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {user.email ? user.email.split("@")[0] : "Anonymous User"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">Sign Out</span>
                </Button>
              </div>
            </>
          )}
        </nav>

        {/* Mobile navigation */}
        {user ? (
          <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="gap-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign Out</span>
            </Button>
          </div>
        ) : (
          <Button size="sm" className="md:hidden" asChild>
            <Link href="/sign-in">Get Started</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
