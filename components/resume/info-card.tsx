'use client';

import { FileText, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadState, isCheckingDb } from './types';

interface InfoCardProps {
  uploadState: UploadState;
}

export function InfoCard({ uploadState }: InfoCardProps) {
  return (
    <Card className="h-full">
      {isCheckingDb(uploadState) ? (
        <CardSkeletonContent />
      ) : (
        <CardActualContent />
      )}
    </Card>
  );
}

function CardSkeletonContent() {
  return (
    <>
      <CardHeader>
        <Skeleton className="h-6 w-36" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-2 mt-4">
          <div className="flex items-start gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </CardContent>
    </>
  );
}

function CardActualContent() {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" />
            Parser Agent
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Our Parser agent analyzes your resume to extract key information:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <div className="rounded-full bg-primary/10 p-1 mt-0.5">
              <FileText className="h-3 w-3 text-primary" />
            </div>
            <span>Technical and soft skills</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="rounded-full bg-primary/10 p-1 mt-0.5">
              <FileText className="h-3 w-3 text-primary" />
            </div>
            <span>Work experience and duration</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="rounded-full bg-primary/10 p-1 mt-0.5">
              <FileText className="h-3 w-3 text-primary" />
            </div>
            <span>Education and certifications</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="rounded-full bg-primary/10 p-1 mt-0.5">
              <FileText className="h-3 w-3 text-primary" />
            </div>
            <span>Project highlights and achievements</span>
          </li>
        </ul>

        <div className="pt-4">
          <p className="text-sm font-medium">What happens next?</p>
          <p className="text-sm text-muted-foreground mt-1">
            After uploading your resume, you&apos;ll be prompted to enter a job description. 
            Our Strategist agent will then map your skills to the job requirements and 
            create a personalized interview strategy.
          </p>
        </div>
      </CardContent>
    </>
  );
}