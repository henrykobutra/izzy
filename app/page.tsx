import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Clock,
  Award,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 flex h-20 items-center">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6" />
            <span className="font-bold text-xl">Izzy</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              How It Works
            </Link>
          </nav>
          <div className="flex items-center">
            <Button size="sm" asChild>
              <Link href="/get-started">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-10 md:pb-12 md:pt-24 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              Ace Your Next Interview with{" "}
              <span className="text-primary">Izzy</span>
            </h1>
            <div className="flex items-center justify-center">
              <span className="bg-primary/10 text-primary px-3 py-1 text-sm rounded-full font-medium">
                Research Preview
              </span>
              <span className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 text-sm rounded-full font-medium">
                Free for a limited time
              </span>
            </div>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Your personal AI interview coach that helps you prepare, practice,
              and perfect your interview skills for any role.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button size="lg" className="h-12 px-8 group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8">
                Learn More
              </Button>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="container space-y-6 py-8 md:py-12 lg:py-24"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
              Why Choose Izzy
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Izzy is designed to give you the edge in your interview
              preparation
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Personalized Practice
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tailored interview questions based on your industry, role, and
                  experience level.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Real-time Feedback
                </CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get instant analysis on your responses with actionable
                  suggestions for improvement.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expert Techniques
                </CardTitle>
                <Award className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Learn proven strategies and frameworks to structure compelling
                  answers.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mx-auto text-center md:max-w-[58rem]">
            <Button className="mt-4 group">
              Explore All Features
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </section>
        <section
          id="how-it-works"
          className="container space-y-6 bg-slate-50 dark:bg-slate-900 py-8 md:py-12 lg:py-24 rounded-xl"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
              How Izzy Works
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Three simple steps to interview success
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative flex flex-col items-center space-y-2 border rounded-md p-6 bg-background">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-primary text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-bold">Set Your Goals</h3>
              <p className="text-center text-muted-foreground">
                Tell Izzy about your target role, industry, and experience
                level. No signup required.
              </p>
            </div>
            <div className="relative flex flex-col items-center space-y-2 border rounded-md p-6 bg-background">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-primary text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-bold">Practice Interviews</h3>
              <p className="text-center text-muted-foreground">
                Engage in realistic interview simulations with Izzy&apos;s AI.
              </p>
            </div>
            <div className="relative flex flex-col items-center space-y-2 border rounded-md p-6 bg-background">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-primary text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-bold">Improve & Succeed</h3>
              <p className="text-center text-muted-foreground">
                Review feedback, refine your answers, and build confidence.
              </p>
            </div>
          </div>
          <div className="mx-auto text-center md:max-w-[58rem]">
            <Button size="lg" className="mt-8 h-12 px-8 group">
              Get Started - No Signup Required
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </section>
        <section
          id="testimonials"
          className="container space-y-6 py-8 md:py-12 lg:py-24"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
              Success Stories
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              See how Izzy has helped others land their dream jobs
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem]">
            <Card>
              <CardHeader>
                <CardTitle>Alex T.</CardTitle>
                <CardDescription>Software Engineer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  &quot;After practicing with Izzy for just a week, I felt so much
                  more confident in my technical interviews. I landed a job at a
                  top tech company that I never thought was possible!&quot;
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Jamie L.</CardTitle>
                <CardDescription>Marketing Manager</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  &quot;Izzy helped me structure my responses using the STAR method,
                  which made a huge difference in how I communicated my
                  experience. I received three job offers after using Izzy!&quot;
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Izzy</span>
            </Link>
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © 2025 Izzy AI. All rights reserved.{" "}
              <span className="text-primary font-medium">
                Research Preview - Free for a limited time
              </span>
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:underline underline-offset-4"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:underline underline-offset-4"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:underline underline-offset-4"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
