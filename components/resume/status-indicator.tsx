'use client';

import { FileText, Loader2, RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadState, isCheckingDb, isError, isProcessing, isSaving, isSuccess, isUploading } from './types';

interface StatusIndicatorProps {
  uploadState: UploadState;
  errorMessage: string;
  setUploadState: (state: UploadState) => void;
  setResumeUploaded: (uploaded: boolean) => void;
}

export function StatusIndicator({ 
  uploadState, 
  errorMessage, 
  setUploadState, 
  setResumeUploaded 
}: StatusIndicatorProps) {
  return (
    <>
      {isCheckingDb(uploadState) && (
        <div className="flex items-center gap-4">
          <div className="relative h-6 w-6">
            <Skeleton className="absolute inset-0 rounded-full" />
            <Loader2 className="h-6 w-6 animate-spin text-primary relative z-10 opacity-70" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-5 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="w-24 h-6 rounded-full" />
        </div>
      )}
      
      {isUploading(uploadState) && (
        <div className="flex items-center gap-4">
          <div className="relative h-6 w-6">
            <Skeleton className="absolute inset-0 rounded-full" />
            <Loader2 className="h-6 w-6 animate-spin text-primary relative z-10 opacity-70" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium">Extracting Text...</h3>
            <p className="text-sm text-muted-foreground">Please wait while we read your PDF file</p>
          </div>
          <Skeleton className="w-24 h-6 rounded-full" />
        </div>
      )}

      {isProcessing(uploadState) && (
        <div className="flex items-center gap-4">
          <div className="relative h-6 w-6">
            <Skeleton className="absolute inset-0 rounded-full bg-amber-200 dark:bg-amber-900/30" />
            <RefreshCw className="h-6 w-6 animate-spin text-amber-500 relative z-10" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium">Processing your resume</h3>
            <p className="text-sm text-muted-foreground">Our Parser agent is analyzing your skills and experience</p>
          </div>
          <div className="flex gap-1">
            <Skeleton className="w-2 h-2 rounded-full bg-amber-300 dark:bg-amber-700" />
            <Skeleton className="w-2 h-2 rounded-full bg-amber-400 dark:bg-amber-600" />
            <Skeleton className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-500" />
          </div>
        </div>
      )}
      
      {isSaving(uploadState) && (
        <div className="flex items-center gap-4">
          <div className="relative h-6 w-6">
            <Skeleton className="absolute inset-0 rounded-full bg-blue-200 dark:bg-blue-900/30" />
            <Save className="h-6 w-6 animate-pulse text-blue-500 relative z-10" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium">Saving your resume</h3>
            <p className="text-sm text-muted-foreground">Storing your resume data securely</p>
          </div>
          <Skeleton className="w-16 h-4 rounded-full" />
        </div>
      )}

      {isSuccess(uploadState) && (
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30">
            <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-base font-medium">Processing Complete!</h3>
            <p className="text-sm text-muted-foreground">Your resume has been analyzed successfully</p>
          </div>
          <Button onClick={() => setResumeUploaded(true)} variant="default" size="sm" className="ml-auto gap-2">
            <FileText className="h-4 w-4" />
            View Details
          </Button>
        </div>
      )}

      {isError(uploadState) && (
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30">
            <div className="text-red-600 dark:text-red-400 text-xl font-bold">!</div>
          </div>
          <div>
            <h3 className="text-base font-medium">Processing Failed</h3>
            <p className="text-sm text-muted-foreground">
              {errorMessage || "Please try again or use a different format"}
            </p>
          </div>
          <Button 
            onClick={() => setUploadState('idle')} 
            variant="outline" 
            size="sm" 
            className="ml-auto gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}
    </>
  );
}