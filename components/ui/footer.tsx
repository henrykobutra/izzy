import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full border-t py-8">
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Izzy AI Logo"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 Izzy AI. All rights reserved.
          </p>
        </div>
        <div className="flex gap-6">
          <Link
            href="/about"
            className="text-sm text-muted-foreground hover:underline"
          >
            About
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground hover:underline"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:underline"
          >
            Privacy
          </Link>
          <Link
            href="https://github.com/henrykobutra/izzy"
            className="text-sm text-muted-foreground hover:underline"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
