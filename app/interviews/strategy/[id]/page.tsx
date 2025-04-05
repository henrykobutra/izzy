'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Bot, 
  CheckCircle, 
  Clock, 
  BarChart4, 
  MessageSquare,
  Play,
  Loader2,
  AlertCircle
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

// Strategy types - same as in strategy-step.tsx
interface FocusArea {
  name: string;
  weight: number;
  description: string;
}

interface SkillRequirement {
  skill: string;
  importance: 'low' | 'medium' | 'high';
  context: string;
}

interface ExperienceRequirements {
  min_years: number;
  preferred_years: number;
  level: 'entry-level' | 'mid-level' | 'senior' | 'lead';
}

interface SkillMatch {
  job_skill: string;
  resume_skill: string;
  experience_years?: number;
  level?: string;
  confidence: number;
}

interface SkillGap {
  job_skill: string;
  missing_context: string;
  importance: 'low' | 'medium' | 'high';
  recommendation: string;
}

interface PartialMatch {
  job_skill: string;
  resume_skill: string;
  transferable: boolean;
  gap_description: string;
  confidence: number;
}

interface StrengthToHighlight {
  skill: string;
  context: string;
}

interface WeaknessToAddress {
  skill: string;
  suggestion: string;
}

interface InterviewQuestion {
  question_text: string;
  question_type: 'technical' | 'behavioral' | 'situational';
  related_skill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  focus_area: string;
}

interface Strategy {
  job_analysis?: {
    title: string;
    company?: string | null;
    required_skills?: SkillRequirement[];
    preferred_skills?: SkillRequirement[];
    experience_requirements?: ExperienceRequirements;
    level?: string;
    requirements?: string[]; // For backwards compatibility 
    skills_needed?: string[]; // For backwards compatibility
  };
  skills_mapping?: {
    strong_matches?: SkillMatch[];
    partial_matches?: PartialMatch[];
    gaps?: SkillGap[];
  };
  skills_match?: { // For backwards compatibility
    strong_matches?: { skill: string; experience?: string; }[];
    areas_to_highlight?: { skill: string; note?: string; }[];
    gaps?: { skill: string; mitigation?: string; }[];
  };
  interview_strategy?: {
    focus_areas?: FocusArea[];
    recommended_preparation?: string[];
    strengths_to_highlight?: StrengthToHighlight[];
    weaknesses_to_address?: WeaknessToAddress[];
  };
  interview_plan?: { // For backwards compatibility
    focus_areas?: FocusArea[];
    estimated_duration?: string;
    question_count?: number;
  };
  recommended_questions?: InterviewQuestion[];
}

export default function StrategyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [strategy, setStrategy] = useState<Strategy>({});
  const [sessionData, setSessionData] = useState<{title: string, date: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (!authLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchStrategy() {
      if (!sessionId || !user) {
        return;
      }
      
      try {
        setLoading(true);
        // Fetch the latest strategy from the session using server action
        const { getInterviewStrategy } = await import('@/lib/actions/get-interview-strategy');
        const result = await getInterviewStrategy(sessionId);
        
        if (result.success && result.strategy) {
          setStrategy(result.strategy);
          
          // Fetch session metadata
          const supabase = (await import('@/lib/supabase')).createClient();
          const { data } = await supabase
            .from('interview_sessions')
            .select('created_at, title, job_postings(title, company)')
            .eq('id', sessionId)
            .single();
            
          if (data) {
            // Format session data
            // Define the type for job_postings
            interface JobPosting {
              title: string;
              company?: string;
            }
            
            // Handle job_postings safely
            let jobPosting: JobPosting | null = null;
            
            // First convert to unknown to safely cast
            if (data.job_postings) {
              // Handle possible array or object format
              if (Array.isArray(data.job_postings) && data.job_postings.length > 0) {
                jobPosting = {
                  title: data.job_postings[0].title,
                  company: data.job_postings[0].company
                };
              } else if (typeof data.job_postings === 'object') {
                jobPosting = data.job_postings as unknown as JobPosting;
              }
            }
            const title = data.title || 
              (jobPosting ? 
                (jobPosting.company ? 
                  `${jobPosting.title} at ${jobPosting.company}` : 
                  jobPosting.title) : 
                'Interview Session');
                
            setSessionData({
              title,
              date: new Date(data.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            });
          }
        } else {
          throw new Error(result.error || 'Failed to load strategy');
        }
      } catch (err) {
        console.error('Error fetching strategy:', err);
        setError(err instanceof Error ? err.message : 'Failed to load strategy data');
      } finally {
        setLoading(false);
      }
    }

    fetchStrategy();
  }, [sessionId, user]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/interviews" />
        
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

  // Process the strategy data to handle different formats
  // Normalize job analysis data
  const jobAnalysis = {
    title: strategy.job_analysis?.title || sessionData?.title || 'Role Analysis',
    company: strategy.job_analysis?.company,
    level: strategy.job_analysis?.experience_requirements?.level || 
           strategy.job_analysis?.level || 
           'Mid-Level',
    requirements: strategy.job_analysis?.required_skills?.map(r => r.skill) || 
                  strategy.job_analysis?.requirements || 
                  ['Technical skills', 'Communication', 'Problem solving'],
    skills_needed: strategy.job_analysis?.preferred_skills?.map(s => s.skill) || 
                   strategy.job_analysis?.skills_needed || 
                   ['Job-specific skills']
  };

  // Normalize skills match data
  const skillsMatch = {
    strong_matches: (strategy.skills_mapping?.strong_matches || []).map(match => ({
      skill: `${match.resume_skill} → ${match.job_skill}`,
      experience: match.experience_years ? `${match.experience_years} years` : undefined
    })),
    areas_to_highlight: (strategy.skills_mapping?.partial_matches || []).map(match => ({
      skill: match.resume_skill,
      note: match.gap_description
    })),
    gaps: (strategy.skills_mapping?.gaps || []).map(gap => ({
      skill: gap.job_skill,
      mitigation: gap.recommendation
    }))
  };

  // If we don't have the new format data, use the old format
  if (skillsMatch.strong_matches.length === 0 && strategy.skills_match) {
    skillsMatch.strong_matches = (strategy.skills_match.strong_matches || []).map(match => ({ 
      skill: match.skill, 
      experience: match.experience || undefined 
    }));
    skillsMatch.areas_to_highlight = (strategy.skills_match.areas_to_highlight || []).map(area => ({ 
      skill: area.skill, 
      note: area.note || '' 
    }));
    skillsMatch.gaps = (strategy.skills_match.gaps || []).map(gap => ({ 
      skill: gap.skill, 
      mitigation: gap.mitigation || '' 
    }));
  }

  // Normalize interview plan data
  const interviewPlan = {
    focus_areas: strategy.interview_strategy?.focus_areas || 
                 strategy.interview_plan?.focus_areas || [
                   { name: 'Technical Competency', weight: 40, description: 'Core technical skills' },
                   { name: 'Problem Solving', weight: 30, description: 'Analytical abilities' },
                   { name: 'Experience', weight: 20, description: 'Relevant background' },
                   { name: 'Culture Fit', weight: 10, description: 'Team compatibility' }
                 ],
    estimated_duration: strategy.interview_plan?.estimated_duration || '20-25 minutes',
    question_count: strategy.recommended_questions?.length || 
                    strategy.interview_plan?.question_count || 10
  };

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/interviews" />
      
      <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page header with back button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1" 
                  asChild
                >
                  <Link href="/interviews">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </Link>
                </Button>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Interview Strategy</h1>
              {sessionData && (
                <p className="text-muted-foreground">
                  {sessionData.title} <span className="text-sm">• {sessionData.date}</span>
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg font-medium">Loading strategy data...</p>
              </div>
            </div>
          ) : error ? (
            <Card className="border-red-200">
              <CardHeader>
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="h-5 w-5" />
                  <CardTitle>Strategy Error</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>There was a problem loading your strategy data. {error}</p>
                <Button onClick={() => router.push('/interviews')} variant="outline" className="mt-4">
                  Return to Interviews
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-purple-500" />
                      Interview Strategy
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full">
                        Strategist
                      </div>
                      {jobAnalysis.level && (
                        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                          {jobAnalysis.level}
                        </div>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    Your personalized interview plan for {jobAnalysis.title || 'this role'} 
                    {jobAnalysis.company ? ` at ${jobAnalysis.company}` : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Skills Match Analysis</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Card className="border-green-200 dark:border-green-900">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Strong Matches</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                          <ul className="space-y-1 text-sm">
                            {(skillsMatch.strong_matches || []).map((match, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>{match.skill} {match.experience ? `(${match.experience})` : ''}</span>
                              </li>
                            ))}
                            {!skillsMatch.strong_matches?.length && (
                              <li className="text-muted-foreground italic">No strong matches found</li>
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="border-amber-200 dark:border-amber-900">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Areas to Highlight</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                          <ul className="space-y-1 text-sm">
                            {(skillsMatch.areas_to_highlight || []).map((area, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-amber-500" />
                                <span>{area.skill} {area.note ? `(${area.note})` : ''}</span>
                              </li>
                            ))}
                            {!skillsMatch.areas_to_highlight?.length && (
                              <li className="text-muted-foreground italic">No areas found</li>
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Interview Focus Areas</h3>
                    <div className="space-y-2">
                      {(interviewPlan.focus_areas || []).map((area, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <p className="text-sm font-medium">{area.name} ({area.weight}%)</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {area.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Questions section */}
                  {strategy.recommended_questions && strategy.recommended_questions.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Recommended Questions</h3>
                      <div className="space-y-3">
                        {strategy.recommended_questions.map((question, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between mb-1">
                              <div className="flex items-center">
                                <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-medium rounded-full bg-primary/10 text-primary mr-2">
                                  {index + 1}
                                </span>
                                <span className="text-xs font-medium uppercase text-muted-foreground">
                                  {question.question_type}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  question.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  question.difficulty === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {question.difficulty}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm">{question.question_text}</p>
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                              <span>Related to: {question.related_skill}</span>
                              <span>Area: {question.focus_area}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="gap-2" asChild>
                    <Link href={`/interviews/session/${sessionId}`}>
                      <Play className="h-4 w-4" />
                      Start Practice Interview
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-amber-500" />
                        Interviewer Agent
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Ready to conduct your mock interview with questions based on the strategy.
                    </p>
                    
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm">Estimated duration: <span className="font-medium">{interviewPlan.estimated_duration || '20-25 minutes'}</span></p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {interviewPlan.question_count || 10} questions covering key focus areas
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {strategy.interview_strategy?.recommended_preparation && 
                  strategy.interview_strategy.recommended_preparation.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        Preparation Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {strategy.interview_strategy.recommended_preparation.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="min-w-4 pt-0.5">•</div>
                            <div>{tip}</div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      <div className="flex items-center gap-2">
                        <BarChart4 className="h-5 w-5 text-green-500" />
                        Evaluator Agent
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Will provide scoring and constructive feedback on your interview responses after completion.
                    </p>
                  </CardContent>
                </Card>

                {/* Gap analysis card */}
                {skillsMatch.gaps && skillsMatch.gaps.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        Skills to Develop
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs space-y-2 text-muted-foreground">
                        {skillsMatch.gaps.map((gap, index) => (
                          <li key={index} className="space-y-1">
                            <div className="font-medium text-sm">{gap.skill}</div>
                            {gap.mitigation && (
                              <div className="border-l-2 border-primary/30 pl-2 text-xs">{gap.mitigation}</div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}