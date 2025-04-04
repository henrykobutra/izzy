'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart4,
  Clock, 
  Calendar,
  CheckCircle,
  Search,
  ArrowUpRight,
  FileText,
  TrendingUp,
  Download,
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
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Interview history types
type InterviewHistory = {
  id: string;
  title: string;
  jobTitle: string;
  company?: string;
  date: Date;
  score: number;
  skills: string[];
  strengths: string[];
  improvements: string[];
};

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [interviewHistory, setInterviewHistory] = useState<InterviewHistory[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (!loading && !user) {
      router.push('/sign-in');
    }

    // Load interview history
    const loadInterviewHistory = async () => {
      setIsDataLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for interview history
      const mockHistory: InterviewHistory[] = [
        {
          id: '1',
          title: 'Frontend Developer Interview',
          jobTitle: 'Senior Frontend Developer',
          company: 'Tech Innovators Inc.',
          date: new Date(Date.now() - 86400000 * 2), // 2 days ago
          score: 4.2,
          skills: ['React', 'TypeScript', 'NextJS'],
          strengths: ['Technical knowledge', 'Problem solving'],
          improvements: ['Be more concise', 'Provide more examples']
        },
        {
          id: '2',
          title: 'UI Engineer Interview',
          jobTitle: 'UI Engineer',
          company: 'Design Systems Co.',
          date: new Date(Date.now() - 86400000 * 7), // 7 days ago
          score: 3.8,
          skills: ['CSS', 'React', 'UI/UX'],
          strengths: ['Design thinking', 'Component architecture'],
          improvements: ['Technical depth', 'Performance optimization']
        },
        {
          id: '3',
          title: 'Full Stack Developer Interview',
          jobTitle: 'Full Stack Developer',
          company: 'WebStack Solutions',
          date: new Date(Date.now() - 86400000 * 14), // 14 days ago
          score: 3.5,
          skills: ['React', 'Node.js', 'MongoDB'],
          strengths: ['Frontend skills', 'API design'],
          improvements: ['Database knowledge', 'System architecture']
        },
        {
          id: '4',
          title: 'Senior React Developer Interview',
          jobTitle: 'Senior React Developer',
          company: 'Product Innovations LLC',
          date: new Date(Date.now() - 86400000 * 21), // 21 days ago
          score: 4.5,
          skills: ['React', 'Redux', 'Performance'],
          strengths: ['State management', 'Component optimization', 'Technical leadership'],
          improvements: ['Explain team conflicts better']
        }
      ];
      
      setInterviewHistory(mockHistory);
      setIsDataLoading(false);
    };
    
    if (user) {
      loadInterviewHistory();
    }
  }, [user, loading, router]);

  // Filter history based on selected period
  const filteredHistory = interviewHistory.filter(interview => {
    const now = new Date();
    const interviewDate = new Date(interview.date);
    
    switch (selectedPeriod) {
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return interviewDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.setDate(now.getDate() - 30));
        return interviewDate >= monthAgo;
      case 'all':
      default:
        return true;
    }
  });

  // Calculate average score
  const averageScore = filteredHistory.length > 0
    ? Number((filteredHistory.reduce((sum, interview) => sum + interview.score, 0) / filteredHistory.length).toFixed(1))
    : 0;

  // Get trending skills (most frequent skills across interviews)
  const getTrendingSkills = () => {
    const skillCount: Record<string, number> = {};
    
    filteredHistory.forEach(interview => {
      interview.skills.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });
    
    return Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);
  };

  // Get common improvement areas
  const getCommonImprovements = () => {
    const improvementCount: Record<string, number> = {};
    
    filteredHistory.forEach(interview => {
      interview.improvements.forEach(improvement => {
        improvementCount[improvement] = (improvementCount[improvement] || 0) + 1;
      });
    });
    
    return Object.entries(improvementCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([improvement]) => improvement);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/history" />
        
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading your profile...</p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/history" />
      
      <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Interview History</h1>
              <p className="text-muted-foreground">
                Track your performance and progress over time
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Tabs 
                defaultValue="month" 
                value={selectedPeriod}
                onValueChange={(value) => setSelectedPeriod(value as 'week' | 'month' | 'all')}
                className="w-full sm:w-auto"
              >
                <TabsList>
                  <TabsTrigger value="week">This Week</TabsTrigger>
                  <TabsTrigger value="month">30 Days</TabsTrigger>
                  <TabsTrigger value="all">All Time</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {isDataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg font-medium">Loading interview history...</p>
              </div>
            </div>
          ) : interviewHistory.length === 0 ? (
            // Empty state
            <Card className="border-2 border-dashed">
              <CardHeader className="text-center pb-2">
                <CardTitle>No Interview History Yet</CardTitle>
                <CardDescription>
                  Complete your first mock interview to see your performance history
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-center py-8">
                  <div className="flex flex-col items-center gap-6 max-w-md text-center">
                    <div className="flex items-center justify-center h-24 w-24 rounded-full bg-muted">
                      <Clock className="h-12 w-12 text-muted-foreground/60" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Get Started with Interview Practice</h3>
                      <p className="text-muted-foreground">
                        After completing interviews, you&apos;ll see your scores, feedback, and progress over time in this dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-center pt-2 pb-6">
                <Button asChild>
                  <a href="/interviews" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule a Mock Interview
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            // History and performance data
            <>
              {/* Performance overview cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Interviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">{filteredHistory.length}</div>
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Average Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">{averageScore} <span className="text-sm font-normal text-muted-foreground">/ 5</span></div>
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                        <BarChart4 className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Top Skill
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {getTrendingSkills()[0] || 'N/A'}
                      </div>
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      To Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold truncate max-w-[150px]">
                        {getCommonImprovements()[0] || 'N/A'}
                      </div>
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Interview history */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Interviews</h2>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">Export</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  {filteredHistory.map((interview) => (
                    <Card key={interview.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex-1 p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div className="space-y-1">
                              <h3 className="text-lg font-medium">{interview.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {interview.jobTitle}{interview.company ? ` at ${interview.company}` : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-sm text-muted-foreground">
                                {interview.date.toLocaleDateString()}
                              </div>
                              <div className={cn(
                                "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                interview.score >= 4 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : 
                                interview.score >= 3 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              )}>
                                {interview.score} / 5
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Skills Assessed</p>
                              <div className="flex flex-wrap gap-1.5">
                                {interview.skills.map((skill) => (
                                  <div key={skill} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                    {skill}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Strengths</p>
                              <ul className="text-sm space-y-1">
                                {interview.strengths.map((strength) => (
                                  <li key={strength} className="flex items-center gap-1.5">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>{strength}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Areas to Improve</p>
                              <ul className="text-sm space-y-1">
                                {interview.improvements.map((improvement) => (
                                  <li key={improvement} className="flex items-center gap-1.5">
                                    <TrendingUp className="h-3 w-3 text-amber-500" />
                                    <span>{improvement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 p-4 sm:p-6 sm:border-l bg-muted/10 sm:w-[140px]">
                          <Button size="sm" variant="outline" className="w-full gap-1">
                            <Search className="h-3 w-3" />
                            <span>Details</span>
                          </Button>
                          <Button size="sm" variant="outline" className="w-full gap-1">
                            <ArrowUpRight className="h-3 w-3" />
                            <span>Practice</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Skills and progress analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Progress</CardTitle>
                    <CardDescription>
                      Track your improvement across key skills
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">React</p>
                          <p className="text-sm font-medium">4.3/5</p>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div className="h-full rounded-full bg-green-500" style={{ width: '86%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">TypeScript</p>
                          <p className="text-sm font-medium">4.0/5</p>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div className="h-full rounded-full bg-green-500" style={{ width: '80%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Next.js</p>
                          <p className="text-sm font-medium">3.7/5</p>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div className="h-full rounded-full bg-amber-500" style={{ width: '74%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">System Design</p>
                          <p className="text-sm font-medium">3.2/5</p>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div className="h-full rounded-full bg-amber-500" style={{ width: '64%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full gap-2">
                      <FileText className="h-4 w-4" />
                      View All Skills
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Common Feedback</CardTitle>
                    <CardDescription>
                      Frequently mentioned areas for improvement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm font-medium">Be more concise</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Mentioned in 75% of your interviews. Focus on keeping answers under 2 minutes and highlighting key points first.
                        </p>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm font-medium">Provide more examples</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Mentioned in 50% of your interviews. Use the STAR method to structure your examples with specific outcomes.
                        </p>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm font-medium">Technical depth</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Mentioned in 25% of your interviews. Demonstrate deeper understanding of technical concepts beyond surface-level explanations.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full gap-2" onClick={() => router.push('/interviews')}>
                      <Calendar className="h-4 w-4" />
                      Practice Areas to Improve
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}