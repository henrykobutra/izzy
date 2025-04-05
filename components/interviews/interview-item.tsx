'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ExternalLink,
  BarChart,
  Trash2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

import { InterviewSession } from '@/lib/hooks/useInterviewSessions';
import { deleteInterviewClient } from '@/lib/actions/interview-client';

// Helper function to format the date
function formatInterviewDate(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

// Helper to get status badge display
function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge variant="success" className="ml-2">Completed</Badge>;
    case 'in_progress':
      return <Badge variant="warning" className="ml-2">In Progress</Badge>;
    case 'planned':
      return <Badge variant="secondary" className="ml-2">Planned</Badge>;
    default:
      return null;
  }
}

interface InterviewItemProps {
  session: InterviewSession;
  onDelete?: () => void;
}

export function InterviewItem({ session, onDelete }: InterviewItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete interview
  const handleDelete = async () => {
    if (!session.jobPostingId) {
      console.error("Job posting ID not found");
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteInterviewClient(session.jobPostingId);
      if (result.success) {
        // Call the parent's onDelete callback to refresh the list
        if (onDelete) {
          onDelete();
        }
      } else {
        console.error("Failed to delete interview:", result.error);
        alert("Failed to delete interview. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      alert("An error occurred while deleting the interview.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card key={session.id} className="overflow-hidden bg-gradient-to-r from-background to-background via-muted/5 border">
      <div className="relative">
        {/* Top Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-1">
          <div className={`h-full ${
            session.status === 'completed' ? 'bg-green-500' : 
            session.status === 'in_progress' ? 'bg-amber-500' : 
            'bg-blue-500'
          }`}></div>
        </div>
        
        <div className="p-4 pt-5 md:p-6 md:pt-7">
          {/* Header Section */}
          <div className="flex flex-wrap items-start justify-between mb-4 gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {getStatusBadge(session.status)}
                <span className="text-xs text-muted-foreground">
                  {formatInterviewDate(session.date)}
                </span>
              </div>
              <h3 className="text-lg font-medium">{session.title}</h3>
            </div>
            
            {session.score !== undefined && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                <BarChart className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {session.score.toFixed(1)}/5.0
                </span>
              </div>
            )}
          </div>
          
          {/* Strategy Content */}
          {session.strategy ? (
            <div className="space-y-4">
              {/* Main Details Grid */}
              <div className="grid grid-cols-12 gap-4">
                {/* Left Column - Focus Areas */}
                <div className="col-span-12 md:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Focus Areas</h4>
                    {session.strategy.interview_strategy?.focus_areas && 
                     session.strategy.interview_strategy.focus_areas.length > 3 && (
                      <span className="text-xs text-primary">
                        +{session.strategy.interview_strategy.focus_areas.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  {session.strategy.interview_strategy?.focus_areas && 
                  session.strategy.interview_strategy.focus_areas.length > 0 ? (
                    <div className="space-y-2">
                      {session.strategy.interview_strategy.focus_areas.slice(0, 3).map((area, index) => (
                        <div key={index} 
                          className={`relative pl-2 pr-3 py-2 rounded-md overflow-hidden
                            ${index === 0 ? 'bg-primary/5 border-l-2 border-primary' : 
                             index === 1 ? 'bg-muted/80 border-l border-muted-foreground/30' : 
                             'bg-muted/50 border-l border-muted-foreground/20'}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-xs font-medium">{area.name}</h5>
                            <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                              {area.weight}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {area.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No focus areas defined.
                    </p>
                  )}
                </div>

                {/* Right Column - Skills & Requirements */}
                <div className="col-span-12 md:col-span-7">
                  <div className="space-y-3">
                    {/* Required Skills */}
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Key Skills</h4>
                      {session.strategy.job_analysis?.required_skills && 
                      session.strategy.job_analysis.required_skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {session.strategy.job_analysis.required_skills.slice(0, 5).map((skill, index) => (
                            <span key={index} className="bg-muted/60 rounded-full px-2 py-1 text-xs inline-flex items-center">
                              {typeof skill === 'string' ? skill : skill.skill}
                              {(typeof skill !== 'string' && skill.importance === 'high') && (
                                <span className="w-1.5 h-1.5 bg-primary rounded-full ml-1.5"></span>
                              )}
                            </span>
                          ))}
                          {session.strategy.job_analysis.required_skills.length > 5 && (
                            <span className="text-xs text-muted-foreground flex items-center">
                              +{session.strategy.job_analysis.required_skills.length - 5} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No required skills specified</p>
                      )}
                    </div>
                    
                    {/* Experience Level */}
                    {session.strategy.job_analysis?.experience_requirements && (
                      <div className="flex gap-6">
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Level</h4>
                          <p className="text-sm">
                            {session.strategy.job_analysis.experience_requirements.level || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Experience</h4>
                          <p className="text-sm">
                            {session.strategy.job_analysis.experience_requirements.min_years} years min.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Recommendation */}
                    {session.strategy.interview_strategy?.recommended_preparation && 
                     session.strategy.interview_strategy.recommended_preparation.length > 0 && (
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Prep Tips</h4>
                        <div className="border-l-2 border-primary/30 pl-3 text-xs text-muted-foreground">
                          {session.strategy.interview_strategy.recommended_preparation[0]}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Footer with Button */}
              <div className="flex justify-between items-center pt-2 mt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  {session.strategy.recommended_questions ? 
                    `${session.strategy.recommended_questions.length} questions` : 
                    'Questions prepared'}
                </div>
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <Trash2 className="h-3.5 w-3.5" />
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
                          onClick={handleDelete}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete Interview"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button size="sm" className="gap-1.5" asChild>
                    <Link href={`/interviews/strategy/${session.id}`}>
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>View Strategy</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>Strategy details will be available once the interview is prepared.</p>
              <div className="flex justify-center gap-2 mt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Interview Session</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this interview session? This action cannot be undone
                        and will permanently remove all related data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete Interview"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <Button size="sm" className="gap-1.5" asChild>
                  <Link href={`/interviews/strategy/${session.id}`}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View Strategy</span>
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}