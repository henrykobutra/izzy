'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Upload,
  FileText, 
  MessageSquare, 
  BarChart4, 
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/dashboard" />
        
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading your dashboard...</p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Empty state dashboard
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/dashboard" />
      
      <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Dashboard header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h1>
            <p className="text-muted-foreground">
              Your personal interview preparation hub
            </p>
          </div>

          {/* Dashboard tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            
            {/* Overview tab - primary empty state */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Get Started card */}
                <Card className="md:col-span-3 border-2 border-dashed">
                  <CardHeader className="text-center pb-2">
                    <CardTitle>Welcome to Your Interview Prep Squad</CardTitle>
                    <CardDescription>
                      Get started with our multi-agent interview preparation system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-center py-8">
                      <div className="flex flex-col items-center gap-6 max-w-md text-center">
                        <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary/10">
                          <Image
                            src="/file.svg"
                            alt="Empty state"
                            width={48}
                            height={48}
                            className="opacity-70"
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold">Begin Your Interview Prep Journey</h3>
                          <p className="text-muted-foreground">
                            Upload your resume and a job description to get personalized interview coaching from our AI squad.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-center pt-2 pb-6">
                    <Button asChild>
                      <Link href="/resume" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Your Resume
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Feature cards */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Resume Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Upload your resume and let our Parser agent extract key skills and qualifications.
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href="/resume" className="justify-between">
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-amber-500" />
                      Mock Interviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Practice with tailored interview questions based on your resume and target job.
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href="/interviews" className="justify-between">
                        Start Practice
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart4 className="h-5 w-5 text-green-500" />
                      Performance Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Review feedback and track your improvement over time with detailed metrics.
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href="/history" className="justify-between">
                        View History
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            {/* Recent Activity tab */}
            <TabsContent value="recent" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your interview preparation history
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-10 gap-4">
                  <div className="flex items-center justify-center h-20 w-20 rounded-full bg-muted">
                    <Clock className="h-10 w-10 text-muted-foreground/60" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-medium">No activity yet</h3>
                    <p className="text-muted-foreground max-w-md">
                      Your recent interview sessions and resume uploads will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Statistics tab */}
            <TabsContent value="stats" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Statistics</CardTitle>
                  <CardDescription>
                    Track your interview preparation progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-10 gap-4">
                  <div className="flex items-center justify-center h-20 w-20 rounded-full bg-muted">
                    <BarChart4 className="h-10 w-10 text-muted-foreground/60" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-medium">No statistics available</h3>
                    <p className="text-muted-foreground max-w-md">
                      Complete mock interviews to see performance metrics and improvement over time.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}