import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Award,
  MessageSquare,
  BookOpen,
  Code,
  Database,
  Brain,
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

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/about" />
      
      <main className="flex-1">
        {/* About Hero */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-3 max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  About Izzy AI
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  An adaptive multi-agent interview preparation system designed to help you succeed
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Project Background */}
        <section className="w-full py-12 md:py-24 bg-slate-50 dark:bg-slate-900/50">
          <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-2 md:gap-16 max-w-6xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold mb-6">Project Background</h2>
                <p className="text-muted-foreground mb-6">
                  Izzy AI was developed as an academic project for Houston Community College's 
                  ITAI 2376: Deep Learning course, under the guidance of Professor Patricia McManus.
                </p>
                <p className="text-muted-foreground">
                  The project addresses a common challenge: job interviews are high-stakes and nerve-wracking.
                  Generic preparation tools often provide random questions, ignoring your unique background
                  and the specific role requirements. Izzy solves this by creating a tailored, adaptive coach
                  that matches your skills to the job and helps you improve through practice.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Personalized Learning
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Adaptive coaching that focuses on your specific strengths and areas for improvement.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      AI-Powered
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Leverages advanced language models to provide realistic interview experiences.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Time-Efficient
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Practice whenever is convenient for you, without scheduling constraints.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Results-Focused
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Designed to help you improve measurably with each practice session.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-12 md:py-24">
          <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className="space-y-3 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Key Features
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">
                  Designed to give you the edge in your interview preparation
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mx-auto">
                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">
                      Personalized Practice
                    </CardTitle>
                    <MessageSquare className="ml-auto h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Tailored interview questions based on your resume and specific job requirements, 
                      ensuring you practice what's most relevant to your target role.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">
                      Real-time Feedback
                    </CardTitle>
                    <Clock className="ml-auto h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Get instant analysis on your responses with actionable
                      suggestions for improvement. Learn what works and what doesn't.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">
                      Progress Tracking
                    </CardTitle>
                    <Award className="ml-auto h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Monitor your improvement over multiple practice sessions 
                      with detailed analytics that show your growth over time.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="w-full py-12 md:py-24 bg-slate-50 dark:bg-slate-900/50">
          <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className="space-y-3 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Technology Stack
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">
                  Built with modern tools and technologies
                </p>
              </div>
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 w-full max-w-5xl mx-auto">
                <div className="flex flex-col items-center space-y-4">
                  <div className="rounded-full bg-primary/10 p-5">
                    <Code className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Frontend</h3>
                  <p className="text-center text-muted-foreground">
                    Next.js 14, TypeScript, Tailwind CSS, shadcn/ui components
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="rounded-full bg-primary/10 p-5">
                    <Database className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Backend</h3>
                  <p className="text-center text-muted-foreground">
                    Supabase for authentication, database, and storage
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="rounded-full bg-primary/10 p-5">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">AI Services</h3>
                  <p className="text-center text-muted-foreground">
                    OpenAI API for language processing, SerpAPI for web search capabilities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full py-12 md:py-24">
          <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-3 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Ready to Ace Your Next Interview?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Start practicing with Izzy today and build the confidence you need to succeed
                </p>
              </div>
              <div className="pt-4">
                <Button size="lg" asChild>
                  <Link href="/get-started">
                    Get Started
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