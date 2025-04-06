"use client";

import Link from "next/link";
import { format } from "date-fns";
import { FileText, ArrowRight } from "lucide-react";
import { InterviewSession } from "@/lib/hooks/useInterviewSessions";

interface InterviewItemProps {
  session: InterviewSession;
}

export function InterviewItem({ session }: InterviewItemProps) {
  const jobTitle = session.title || "Interview Session";
  const company = session.strategy?.job_analysis?.company || "";

  return (
    <Link
      href={`/interviews/session/${session.id}`}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-gray-500" />
        <div>
          <h3 className="font-medium">{jobTitle}</h3>
          {company && <p className="text-sm text-gray-500">{company}</p>}
          <p className="text-sm text-gray-500">
            {format(session.date, "MMM d, yyyy")}
          </p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-gray-400" />
    </Link>
  );
}
