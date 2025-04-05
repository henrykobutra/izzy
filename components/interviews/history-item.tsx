'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowUpRight,
  Building,
  CheckCircle,
  MessageSquare,
  Search,
  Trash2,
  TrendingUp
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface InterviewQuestion {
  id: string;
  question_text: string;
  question_type: string;
  related_skill: string | null;
  answers: {
    id: string;
    answer_text: string;
    evaluations: {
      overall_score: number;
      clarity_score: number;
      relevance_score: number;
      feedback: string;
      improvement_suggestions: string | null;
    }[];
  }[];
}

export interface HistoryItemSession {
  id: string;
  created_at: string;
  job_posting: {
    id: string;
    title: string;
    company: string | null;
    parsed_requirements: {
      technical?: string[];
      soft?: string[];
      experience?: string[];
    } | null;
  };
  status: 'planned' | 'in_progress' | 'completed';
  strategy: {
    focus_areas?: string[];
    skill_mapping?: Record<string, string[]>;
  } | null;
  questions: InterviewQuestion[];
}

interface HistoryItemProps {
  session: HistoryItemSession;
  onDelete: (sessionId: string) => void;
}

export function HistoryItem({ session, onDelete }: HistoryItemProps) {
  const router = useRouter();
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [setSelectedSession] = useState<(session: HistoryItemSession | null) => void>(s => s);
  const isDeleting = deletingSessionId === session.id;

  // Calculate session metrics
  const getSessionAverageScore = (): number => {
    let totalScore = 0;
    let totalEvaluations = 0;
    
    session.questions.forEach(question => {
      question.answers.forEach(answer => {
        answer.evaluations.forEach(evaluation => {
          if (evaluation.overall_score) {
            totalScore += evaluation.overall_score;
            totalEvaluations++;
          }
        });
      });
    });
    
    return totalEvaluations > 0 ? totalScore / totalEvaluations : 0;
  };

  const sessionScore = getSessionAverageScore();
  const completedQuestions = session.questions.filter(q => 
    q.answers && q.answers.length > 0 && 
    q.answers.some(a => a.evaluations && a.evaluations.length > 0)
  ).length;
  const totalQuestions = session.questions.length;
  
  // Extract skills from this session
  const sessionSkills = new Set<string>();
  session.questions.forEach(q => {
    if (q.related_skill) sessionSkills.add(q.related_skill);
  });
  
  // Get strengths and improvements
  const getStrengths = (): string[] => {
    const strengths: string[] = [];
    
    session.questions.forEach(question => {
      question.answers.forEach(answer => {
        answer.evaluations.forEach(evaluation => {
          if (evaluation.feedback) {
            const feedbackLower = evaluation.feedback.toLowerCase();
            if (feedbackLower.includes('good') || feedbackLower.includes('great') || feedbackLower.includes('excellent')) {
              strengths.push(question.related_skill || 'Communication');
            }
          }
        });
      });
    });
    
    return Array.from(new Set(strengths));
  };

  const getImprovements = (): string[] => {
    const improvements: string[] = [];
    
    session.questions.forEach(question => {
      question.answers.forEach(answer => {
        answer.evaluations.forEach(evaluation => {
          if (evaluation.improvement_suggestions) {
            improvements.push(evaluation.improvement_suggestions);
          }
        });
      });
    });
    
    return Array.from(new Set(improvements));
  };

  const strengths = getStrengths();
  const improvements = getImprovements();

  // Open session details dialog
  const openSessionDetails = () => {
    setSelectedSession(session);
  };

  // Handle delete interview
  const handleDeleteSession = async () => {
    setDeletingSessionId(session.id);
    try {
      const { deleteInterviewClient } = await import('@/lib/actions/interview-client');
      
      if (!session.job_posting || !session.job_posting.id) {
        console.error("Missing job posting ID:", session);
        alert("Missing job posting ID. Cannot delete interview.");
        return;
      }
      
      console.log("Deleting job posting with ID:", session.job_posting.id);
      const result = await deleteInterviewClient(session.job_posting.id);
      
      if (result.success) {
        onDelete(session.id);
      } else {
        console.error("Failed to delete:", result.error);
        alert("Failed to delete interview");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    } finally {
      setDeletingSessionId(null);
    }
  };

  return (
    <Card key={session.id} className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">{session.job_posting?.title || 'Interview Session'}</h3>
                <Badge variant={session.status === 'completed' ? 'success' : session.status === 'in_progress' ? 'warning' : 'outline'}>
                  {session.status === 'completed' ? 'Completed' : session.status === 'in_progress' ? 'In Progress' : 'Planned'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                {session.job_posting?.company && (
                  <>
                    <Building className="h-3 w-3" />
                    <span>{session.job_posting.company}</span>
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                {new Date(session.created_at).toLocaleDateString()}
              </div>
              {session.status === 'completed' && (
                <div className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-medium",
                  sessionScore >= 4 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : 
                  sessionScore >= 3 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {sessionScore.toFixed(1)} / 5
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Questions Covered</p>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{completedQuestions} of {totalQuestions} questions</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Array.from(sessionSkills).slice(0, 3).map((skill) => (
                  <div key={skill} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    {skill}
                  </div>
                ))}
                {sessionSkills.size > 3 && (
                  <div className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                    +{sessionSkills.size - 3} more
                  </div>
                )}
              </div>
            </div>
            
            {session.status === 'completed' && (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Strengths</p>
                  <ul className="text-sm space-y-1">
                    {strengths.slice(0, 2).map((strength, idx) => (
                      <li key={`${strength}-${idx}`} className="flex items-center gap-1.5">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{strength}</span>
                      </li>
                    ))}
                    {strengths.length === 0 && (
                      <li className="text-muted-foreground">No strengths recorded</li>
                    )}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Areas to Improve</p>
                  <ul className="text-sm space-y-1">
                    {improvements.slice(0, 2).map((improvement, idx) => (
                      <li key={`${improvement}-${idx}`} className="flex items-center gap-1.5 line-clamp-1">
                        <TrendingUp className="h-3 w-3 text-amber-500 shrink-0" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                    {improvements.length === 0 && (
                      <li className="text-muted-foreground">No improvements suggested</li>
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 p-4 sm:p-6 sm:border-l bg-muted/10 sm:w-[140px]">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-full gap-1" onClick={openSessionDetails}>
                <Search className="h-3 w-3" />
                <span>Details</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{session.job_posting?.title || 'Interview Session'}</DialogTitle>
                <DialogDescription>
                  {session.job_posting?.company && `at ${session.job_posting.company} • `}
                  {new Date(session.created_at).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 space-y-4">
                {session.questions.length > 0 ? (
                  session.questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">Q{index + 1}: {question.question_text}</div>
                        {question.question_type && (
                          <Badge variant="outline">{question.question_type}</Badge>
                        )}
                      </div>
                      
                      {question.answers && question.answers.length > 0 ? (
                        <div className="mt-2 space-y-3">
                          <div className="bg-muted/30 p-3 rounded text-sm">
                            {question.answers[0].answer_text}
                          </div>
                          
                          {question.answers[0].evaluations && question.answers[0].evaluations.length > 0 && (
                            <div className="mt-2">
                              <div className="text-sm font-medium mb-1">Feedback:</div>
                              <div className="text-sm">{question.answers[0].evaluations[0].feedback}</div>
                              
                              {question.answers[0].evaluations[0].improvement_suggestions && (
                                <div className="mt-2">
                                  <div className="text-sm font-medium mb-1">To improve:</div>
                                  <div className="text-sm text-amber-600 dark:text-amber-400">
                                    {question.answers[0].evaluations[0].improvement_suggestions}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex gap-2 mt-3">
                                <Badge variant="success">
                                  Score: {question.answers[0].evaluations[0].overall_score}/5
                                </Badge>
                                <Badge variant="outline">
                                  Clarity: {question.answers[0].evaluations[0].clarity_score}/5
                                </Badge>
                                <Badge variant="outline">
                                  Relevance: {question.answers[0].evaluations[0].relevance_score}/5
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground mt-2">
                          No answer recorded
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No questions available for this session
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <div className="w-full flex gap-2 flex-col">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full gap-1">
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Interview Session</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this interview session? This action cannot be undone
                    and will permanently remove all related data, including questions, answers, and evaluations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteSession}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Interview"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button size="sm" variant="outline" className="w-full gap-1" onClick={() => router.push(`/interviews/strategy/${session.id}`)}>
              <ArrowUpRight className="h-3 w-3" />
              <span>{session.status === 'completed' ? 'Retry' : 'Continue'}</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}