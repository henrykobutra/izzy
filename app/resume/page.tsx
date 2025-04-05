'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getResumeForCurrentUser } from '@/lib/actions/get-resume';
import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/ui/footer';
import { useResumeUpload } from '@/lib/hooks/useResumeUpload';
import { PageSkeleton } from '@/components/resume/page-skeleton';
import { UploadForm } from '@/components/resume/upload-form';
import { ResumeDetails } from '@/components/resume/resume-details';
import { InfoCard } from '@/components/resume/info-card';
import { isCheckingDb } from '@/components/resume/types';

export default function ResumePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasCheckedResume = useRef(false);
  
  const {
    resumeUploaded,
    setResumeUploaded,
    uploadState,
    setUploadState,
    dragActive,
    setDragActive,
    resumeParsed,
    setResumeParsed,
    fileName,
    setFileName,
    errorMessage,
    resumeText,
    setResumeText,
    handleFileUpload,
    handleTextSubmit
  } = useResumeUpload();
  
  // Check for existing resume on mount - only run once
  useEffect(() => {
    const fetchExistingResume = async () => {
      // Skip if already authenticated, already fetched, or still loading
      if (hasCheckedResume.current || loading) {
        return;
      }

      // If not authenticated, redirect to sign-in
      if (!user) {
        router.push('/sign-in');
        return;
      }
      
      // Mark that we've attempted to fetch, so we don't try again
      hasCheckedResume.current = true;
      
      try {
        setUploadState('checking-db');
        const result = await getResumeForCurrentUser();
        
        if (result.success) {
          // Set resume data from database
          setFileName(`Resume from ${new Date(result.data.created_at).toLocaleDateString()}`);
          
          // Construct ResumeParserResponse from the stored data
          const parsedData = {
            parsed_skills: result.data.parsed_skills,
            experience: result.data.experience,
            education: result.data.education,
            projects: result.data.projects || []
          };
          
          setResumeParsed(parsedData);
          setResumeUploaded(true);
          setUploadState('success');
        } else {
          // No resume found or other error
          if (result.error === 'No resume found') {
            console.log("No resume found for user, showing upload screen");
          } else {
            console.error("Error fetching resume:", result.error);
          }
          // Reset to idle state to allow new upload
          setUploadState('idle');
        }
      } catch (error) {
        console.error("Error fetching existing resume:", error);
        setUploadState('idle');
      }
    };

    // Only run if we have a user and we haven't checked for resume yet
    if (user && !hasCheckedResume.current && !loading) {
      fetchExistingResume();
    }
    
    // No need to include uploadState or resumeUploaded in dependencies
    // as we only want this to run once after authentication
  }, [user, loading, router, setFileName, setResumeParsed, setResumeUploaded, setUploadState]);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/resume" />
      
      <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Page header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Resume Management</h1>
            <p className="text-muted-foreground">
              Upload and manage your resume for personalized interview preparation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main content section */}
            <div className="md:col-span-2">
              {isCheckingDb(uploadState) ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Looking for existing resume</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 flex justify-center">
                    <div className="flex flex-col items-center gap-4 py-8">
                      <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary/10">
                        <Loader2 className="h-12 w-12 text-primary/70 animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">
                          Please wait while we check for your existing resume...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : !resumeUploaded ? (
                <UploadForm 
                  uploadState={uploadState}
                  dragActive={dragActive}
                  resumeText={resumeText}
                  errorMessage={errorMessage}
                  handleFileUpload={handleFileUpload}
                  handleTextSubmit={handleTextSubmit}
                  setResumeText={setResumeText}
                  setDragActive={setDragActive}
                  setUploadState={setUploadState}
                  setResumeUploaded={setResumeUploaded}
                />
              ) : (
                <ResumeDetails 
                  fileName={fileName}
                  resumeParsed={resumeParsed}
                  uploadState={uploadState}
                  setUploadState={setUploadState}
                  setResumeUploaded={setResumeUploaded}
                  setResumeParsed={setResumeParsed}
                  setFileName={setFileName}
                  setResumeText={setResumeText}
                />
              )}
            </div>

            {/* Info card */}
            <div className="md:col-span-1">
              <InfoCard uploadState={uploadState} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Helper component for checking db state
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';