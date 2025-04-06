"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building,
  Trash2,
  PlayCircle,
  BarChart2,
  BookOpen,
  Clock,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    parsed_requirements?: {
      technical?: string[];
      soft?: string[];
      experience?: string[];
    } | null;
  } | null;
  status: "planned" | "in_progress" | "completed";
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
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  );
  const [isHovered, setIsHovered] = useState(false);
  const isDeleting = deletingSessionId === session.id;

  // Calculate completed questions
  const getCompletedQuestionsCount = (): number => {
    return session.questions.filter(
      (q) =>
        q.answers &&
        q.answers.length > 0 &&
        q.answers.some((a) => a.evaluations && a.evaluations.length > 0)
    ).length;
  };
  const completedQuestions = getCompletedQuestionsCount();
  const totalQuestions = session.questions.length;

  // Extract skills from this session
  const sessionSkills = new Set<string>();
  session.questions.forEach((q) => {
    if (q.related_skill) sessionSkills.add(q.related_skill);
  });

  // This section previously calculated strengths and improvements
  // We've removed it as part of the clean-up since they weren't being used

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "planned":
        return {
          bg: "bg-slate-100",
          text: "text-slate-700",
          dot: "bg-slate-500",
        };
      case "completed":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          dot: "bg-green-500",
        };
      case "in_progress":
        return {
          bg: "bg-amber-100",
          text: "text-amber-700",
          dot: "bg-amber-500",
        };
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-700",
          dot: "bg-slate-500",
        };
    }
  };

  const statusStyles = getStatusStyles(session.status);

  // Handle delete interview - now just calls the provided onDelete callback
  const handleDeleteSession = async () => {
    setDeletingSessionId(session.id);
    try {
      // Call the onDelete function from the parent component
      await onDelete(session.id);
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("An error occurred while deleting the interview");
    } finally {
      setDeletingSessionId(null);
    }
  };

  return (
    <div
      className={`w-full rounded-xl border border-gray-100 bg-white p-5 transition-all duration-200 ${
        isHovered ? "shadow-lg translate-y-[-2px]" : "shadow-sm"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg tracking-tight">
                {session.job_posting?.title || "Interview Session"}
              </h3>
              <Badge
                className={`${statusStyles.bg} ${statusStyles.text} font-medium px-2.5 py-0.5 text-xs flex items-center gap-1.5 border-0`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}
                ></span>
                <span>
                  {session.status === "in_progress"
                    ? "Incomplete"
                    : session.status === "planned"
                    ? "Planned"
                    : session.status}
                </span>
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              {session.job_posting?.company && (
                <div className="flex items-center text-gray-500 text-sm">
                  <Building className="h-3.5 w-3.5 mr-1.5" />
                  <span>{session.job_posting.company}</span>
                </div>
              )}
              <div className="flex items-center text-gray-400 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                <span>{new Date(session.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => router.push(`/interviews/strategy/${session.id}`)}
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-medium">View Strategy</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => router.push(`/interviews/session/${session.id}`)}
            >
              <PlayCircle className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-medium">Continue Practice</span>
            </Button>
            {session.status === "completed" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => router.push(`/interviews/results/${session.id}`)}
              >
                <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs font-medium">View Feedback</span>
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Interview Session</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this interview session? This
                    action cannot be undone and will permanently remove all
                    related data, including questions, answers, and evaluations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSession}
                    disabled={isDeleting}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete Interview"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Mobile actions */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/interviews/strategy/${session.id}`)
                  }
                >
                  <BookOpen className="h-3.5 w-3.5 mr-2" />
                  <span>View Strategy</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/interviews/session/${session.id}`)
                  }
                >
                  <PlayCircle className="h-3.5 w-3.5 mr-2" />
                  <span>Continue Practice</span>
                </DropdownMenuItem>
                {session.status === "completed" && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push(`/interviews/results/${session.id}`)}
                  >
                    <BarChart2 className="h-3.5 w-3.5 mr-2" />
                    <span>View Feedback</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="cursor-pointer text-red-500 focus:text-red-500"
                  onClick={handleDeleteSession}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress indicator */}
        {session.status === "in_progress" && (
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${(completedQuestions / totalQuestions) * 100}%`,
              }}
            />
          </div>
        )}
      </div>

    </div>
  );
}
