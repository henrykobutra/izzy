import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Bot,
  Search,
  BarChart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NavBar } from "@/components/ui/nav-bar";
import { Footer } from "@/components/ui/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/" />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-3 max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your AI-powered <span className="text-primary">Interview Squad</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Four specialized AI agents working together to help you prepare, practice,
                  and perfect your interview skills.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                <Button asChild>
                  <Link href="/sign-in">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <div className="rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
                  Academic Project
                </div>
                <div className="rounded-full bg-green-100 px-4 py-1.5 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Free to Use
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Overview */}
        <section className="w-full py-12 md:py-24 bg-slate-50 dark:bg-slate-900/50">
          <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className="space-y-3 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Meet Your Interview Squad
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">
                  Four specialized agents working together to prepare you for interview success
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-6xl mx-auto">
                <Card className="border-l-4 border-l-blue-500 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-blue-500" />
                      Parser
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Analyzes your resume and job description to extract key skills and requirements.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-purple-500" />
                      Strategist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Maps your skills to job needs and plans personalized interview questions.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-amber-500" />
                      Interviewer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Conducts realistic mock interviews based on the strategic plan.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-green-500" />
                      Evaluator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Provides constructive feedback with scores and improvement suggestions.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="w-full py-12 md:py-24">
          <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className="space-y-3 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  How It Works
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">
                  Three simple steps to interview success
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 w-full max-w-5xl mx-auto">
                <div className="flex flex-col items-center space-y-4 p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    1
                  </div>
                  <h3 className="text-xl font-bold">Upload & Set Goals</h3>
                  <p className="text-center text-muted-foreground">
                    Share your resume and target job description. No signup required.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4 p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    2
                  </div>
                  <h3 className="text-xl font-bold">Practice Interviews</h3>
                  <p className="text-center text-muted-foreground">
                    Engage in realistic interview simulations with tailored questions.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4 p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    3
                  </div>
                  <h3 className="text-xl font-bold">Improve & Succeed</h3>
                  <p className="text-center text-muted-foreground">
                    Review feedback, refine your answers, and build confidence.
                  </p>
                </div>
              </div>
              <div className="pt-8">
                <Button size="lg" asChild>
                  <Link href="/sign-in">
                    Try It Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}