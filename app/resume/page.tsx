'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  Search,
  FileUp,
  File, 
  Trash2,
  RefreshCw,
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
import { cn } from '@/lib/utils';

export default function ResumePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [dragActive, setDragActive] = useState(false);
  
  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  // Simulate resume upload functionality
  const handleUpload = () => {
    setUploadState('uploading');
    
    // Simulate API delay
    setTimeout(() => {
      setUploadState('processing');
      
      // Simulate processing delay
      setTimeout(() => {
        setUploadState('success');
        setResumeUploaded(true);
      }, 2000);
    }, 1500);
  };

  // File drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/resume" />
        
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
            {/* Upload section */}
            <div className="md:col-span-2">
              {!resumeUploaded ? (
                <Card className={cn(
                  "border-2 border-dashed",
                  dragActive && "border-primary bg-primary/5"
                )}>
                  <CardHeader className="text-center pb-2">
                    <CardTitle>Upload Your Resume</CardTitle>
                    <CardDescription>
                      Drag and drop your resume file or click to browse
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div 
                      className="flex flex-col items-center justify-center py-12 cursor-pointer"
                      onClick={() => uploadState === 'idle' && handleUpload()}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {uploadState === 'idle' && (
                        <div className="flex flex-col items-center gap-4">
                          <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary/10">
                            <FileUp className="h-12 w-12 text-primary/70" />
                          </div>
                          <div className="text-center space-y-2">
                            <h3 className="text-xl font-medium">Upload your resume</h3>
                            <p className="text-muted-foreground max-w-sm">
                              Support for PDF, DOCX, and TXT files up to 5MB
                            </p>
                          </div>
                        </div>
                      )}

                      {uploadState === 'uploading' && (
                        <div className="flex flex-col items-center gap-4">
                          <div className="flex items-center justify-center h-24 w-24">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-xl font-medium">Uploading...</h3>
                            <p className="text-muted-foreground">Please wait while we upload your file</p>
                          </div>
                        </div>
                      )}

                      {uploadState === 'processing' && (
                        <div className="flex flex-col items-center gap-4">
                          <div className="flex items-center justify-center h-24 w-24">
                            <RefreshCw className="h-12 w-12 animate-spin text-amber-500" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-xl font-medium">Processing your resume</h3>
                            <p className="text-muted-foreground">Our Parser agent is analyzing your skills and experience</p>
                          </div>
                        </div>
                      )}

                      {uploadState === 'success' && (
                        <div className="flex flex-col items-center gap-4">
                          <div className="flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30">
                            <FileText className="h-12 w-12 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-xl font-medium">Upload Complete!</h3>
                            <p className="text-muted-foreground">Your resume has been processed successfully</p>
                          </div>
                        </div>
                      )}

                      {uploadState === 'error' && (
                        <div className="flex flex-col items-center gap-4">
                          <div className="flex items-center justify-center h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/30">
                            <div className="text-red-600 dark:text-red-400">!</div>
                          </div>
                          <div className="text-center">
                            <h3 className="text-xl font-medium">Upload Failed</h3>
                            <p className="text-muted-foreground">Please try again or use a different file format</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-center pt-2 pb-6">
                    {uploadState === 'idle' && (
                      <Button onClick={handleUpload} className="gap-2">
                        <Upload className="h-4 w-4" />
                        Select File
                      </Button>
                    )}
                    {uploadState === 'success' && (
                      <Button onClick={() => setResumeUploaded(true)} variant="default" className="gap-2">
                        <Search className="h-4 w-4" />
                        View Details
                      </Button>
                    )}
                    {uploadState === 'error' && (
                      <Button onClick={() => setUploadState('idle')} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Resume Details</span>
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => setResumeUploaded(false)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only sm:not-sr-only">Remove</span>
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Parsed information from your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <File className="h-8 w-8 text-primary/70" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">resume-2025.pdf</p>
                        <p className="text-xs text-muted-foreground">Uploaded on {new Date().toLocaleDateString()}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Replace
                      </Button>
                    </div>

                    {/* Parsed skills section */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Identified Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {['JavaScript', 'React', 'TypeScript', 'Next.js', 'Node.js', 'UI/UX Design', 'Project Management', 'Communication'].map((skill) => (
                          <div key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Experience section */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Experience Summary</h3>
                      <div className="space-y-2">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium">Senior Developer at Example Corp</p>
                          <p className="text-xs text-muted-foreground">3 years experience</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium">Frontend Developer at Tech Innovators</p>
                          <p className="text-xs text-muted-foreground">2 years experience</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-4">
                    <p className="text-sm text-muted-foreground">
                      This information will be used by our AI agents to personalize your interview preparation.
                    </p>
                    <Button onClick={() => router.push('/interviews')} className="gap-2">
                      <FileText className="h-4 w-4" />
                      Continue to Interview Prep
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>

            {/* Info card */}
            <div className="md:col-span-1">
              <Card className="h-full">
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
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}