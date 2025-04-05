'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  Search,
  FileUp,
  File, 
  Trash2,
  RefreshCw,
  Loader2,
  Text,
  Save,
  CheckCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Define the upload state type to avoid TypeScript errors
type UploadState = 'idle' | 'checking-db' | 'uploading' | 'processing' | 'success' | 'saving' | 'error';

// Helper functions for type checking
const isCheckingDb = (state: UploadState): state is 'checking-db' => state === 'checking-db';
const isUploading = (state: UploadState): state is 'uploading' => state === 'uploading';
const isProcessing = (state: UploadState): state is 'processing' => state === 'processing';
const isSaving = (state: UploadState): state is 'saving' => state === 'saving';
const isSuccess = (state: UploadState): state is 'success' => state === 'success';
const isError = (state: UploadState): state is 'error' => state === 'error';
const isIdle = (state: UploadState): state is 'idle' => state === 'idle';
import { ResumeParserResponse } from '@/types/openai';
import { parseResume, saveResumeToSupabase, deleteCurrentResume } from '@/lib/actions/resume-parser';
import { getResumeForCurrentUser } from '@/lib/actions/get-resume';

import { useAuth } from '@/lib/hooks/useAuth';
import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [dragActive, setDragActive] = useState(false);
  const [resumeParsed, setResumeParsed] = useState<ResumeParserResponse | null>(null);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check for existing resume on mount - only run once when component mounts
  useEffect(() => {
    // Flag to track if we've already attempted to fetch the resume
    let hasFetched = false;
    
    const fetchExistingResume = async () => {
      // If not authenticated, redirect to sign-in
      if (!loading && !user) {
        router.push('/sign-in');
        return;
      }

      // Skip if already loaded or loading or if we've already fetched
      if (loading || hasFetched || resumeUploaded || uploadState !== 'idle') {
        return;
      }

      // Mark that we've attempted to fetch
      hasFetched = true;
      
      try {
        // Set a specific state for database checking
        setUploadState('checking-db');
        const result = await getResumeForCurrentUser();
        
        if (result.success) {
          // Set resume data from database
          setFileName(`Resume from ${new Date(result.data.created_at).toLocaleDateString()}`);
          
          // Construct ResumeParserResponse from the stored data
          const parsedData: ResumeParserResponse = {
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
          // Reset to idle state either way to allow new upload
          setUploadState('idle');
        }
      } catch (error) {
        console.error("Error fetching existing resume:", error);
        setUploadState('idle');
      }
    };

    // Only run this if we have a user and are not loading
    if (!loading && user) {
      fetchExistingResume();
    }
    
    // Run this only when user, loading, uploadState, or resumeUploaded changes
  }, [user, loading, router, uploadState, resumeUploaded]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setFileName(file.name);
    setUploadState('uploading');
    setErrorMessage("");
    
    try {
      // Extract text from PDF using PDF.js (client-side)
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;
      
      const typedArray = new Uint8Array(arrayBuffer);
      const pdf = await pdfjs.getDocument(typedArray).promise;
      let extractedText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        extractedText +=
          textContent.items.map((item) => 'str' in item ? item.str : '').join(" ") + "\n";
      }
      
      // Now process with server action
      setUploadState('processing');
      
      // Send extracted text to server action for OpenAI processing
      const result = await parseResume(extractedText);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to parse resume");
      }
      
      // Set the parsed resume data
      const parsedData = result.data || null;
      setResumeParsed(parsedData);
      
      // Save to Supabase
      if (parsedData) {
        setUploadState('saving');
        const saveResult = await saveResumeToSupabase(extractedText, parsedData);
        if (!saveResult.success) {
          throw new Error(saveResult.error || "Failed to save resume to database");
        }
      }
      
      setUploadState('success');
      setResumeUploaded(true);
      
    } catch (error) {
      console.error("Error processing resume:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to process resume");
      setUploadState('error');
    }
  };
  
  const handleTextSubmit = async () => {
    if (!resumeText.trim()) {
      setErrorMessage("Please enter your resume text");
      return;
    }
    
    setUploadState('processing');
    setErrorMessage("");
    
    try {
      // Send text directly to server action for OpenAI processing
      const result = await parseResume(resumeText);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to parse resume");
      }
      
      // Set the parsed resume data
      const parsedData = result.data || null;
      setResumeParsed(parsedData);
      
      // Save to Supabase
      if (parsedData) {
        setUploadState('saving');
        const saveResult = await saveResumeToSupabase(resumeText, parsedData);
        if (!saveResult.success) {
          throw new Error(saveResult.error || "Failed to save resume to database");
        }
      }
      
      setUploadState('success');
      setResumeUploaded(true);
      
    } catch (error) {
      console.error("Error processing resume:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to process resume");
      setUploadState('error');
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
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
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/resume" />
        
        <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-8">
            {/* Page header skeleton */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main content skeleton */}
              <div className="md:col-span-2">
                <Skeleton className="h-[600px] w-full rounded-lg" />
              </div>

              {/* Info card skeleton */}
              <div className="md:col-span-1">
                <Skeleton className="h-[400px] w-full rounded-lg" />
              </div>
            </div>
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
              {isCheckingDb(uploadState) ? (
                <Card>
                  <CardHeader className="text-center pb-2">
                    <Skeleton className="h-6 w-48 mx-auto" />
                    <Skeleton className="h-4 w-72 mx-auto mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Skeleton className="h-9 rounded-md" />
                        <Skeleton className="h-9 rounded-md" />
                      </div>
                      <Skeleton className="h-[300px] rounded-md mt-4" />
                    </div>
                  </CardContent>
                </Card>
              ) : !resumeUploaded ? (
                <Card>
                  <CardHeader className="text-center pb-2">
                    <CardTitle>Add Your Resume</CardTitle>
                    <CardDescription>
                      Our Parser Agent will analyze your resume for personalized interview preparation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                          <FileUp className="h-4 w-4" />
                          Upload PDF
                        </TabsTrigger>
                        <TabsTrigger value="paste" className="flex items-center gap-2">
                          <Text className="h-4 w-4" />
                          Paste Text
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="upload" className="mt-4">
                        <Card className={cn(
                          "border-2 border-dashed",
                          dragActive && "border-primary bg-primary/5"
                        )}>
                          <CardContent className="p-6">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf"
                              onChange={handleFileInputChange}
                              className="hidden"
                            />
                            <div 
                              className="flex flex-col items-center justify-center py-8 cursor-pointer"
                              onClick={() => isIdle(uploadState) && handleClickUpload()}
                              onDragEnter={handleDrag}
                              onDragLeave={handleDrag}
                              onDragOver={handleDrag}
                              onDrop={handleDrop}
                            >
                              {isIdle(uploadState) && (
                                <div className="flex flex-col items-center gap-4">
                                  <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary/10">
                                    <FileUp className="h-12 w-12 text-primary/70" />
                                  </div>
                                  <div className="text-center space-y-2">
                                    <h3 className="text-xl font-medium">Upload your resume</h3>
                                    <p className="text-muted-foreground max-w-sm">
                                      Support for PDF files up to 5MB
                                    </p>
                                  </div>
                                  <Button 
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent event bubbling
                                      handleClickUpload();
                                    }} 
                                    className="gap-2 mt-2"
                                  >
                                    <Upload className="h-4 w-4" />
                                    Select File
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="paste" className="mt-4">
                        <Card>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex flex-col gap-1.5">
                                <h3 className="text-base font-medium">Paste Your Resume Text</h3>
                                <p className="text-sm text-muted-foreground">
                                  Copy and paste the content of your resume below
                                </p>
                              </div>
                              
                              <Textarea 
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder="Paste your resume content here..."
                                className="min-h-[240px] max-h-[240px] overflow-y-auto"
                              />
                              
                              {isProcessing(uploadState) || isUploading(uploadState) || isSaving(uploadState) ? (
                                <div className="w-full relative">
                                  <Skeleton className="h-10 w-full rounded-md" />
                                  <Button 
                                    className="w-full gap-2 absolute inset-0 opacity-75 pointer-events-none"
                                  >
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  onClick={handleTextSubmit} 
                                  className="w-full gap-2"
                                  disabled={!resumeText.trim() || isProcessing(uploadState)}
                                >
                                  <Search className="h-4 w-4" />
                                  Analyze Resume
                                </Button>
                              )}
                              
                              {errorMessage && (
                                <p className="text-sm text-red-500">{errorMessage}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                    
                    {/* Processing and Status Indicators */}
                    {!isIdle(uploadState) && (
                      <div className="mt-6 p-4 bg-muted/40 rounded-lg">
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
                              <Search className="h-4 w-4" />
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Resume Details</span>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 rounded-md text-xs font-medium">
                          <CheckCircle className="h-3 w-3" />
                          Current
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="sr-only sm:not-sr-only">Replace</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Replace your resume?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete your current resume and allow you to upload a new one. 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={async () => {
                                  setIsDeleting(true);
                                  try {
                                    const result = await deleteCurrentResume();
                                    if (result.success) {
                                      setResumeUploaded(false);
                                      setResumeParsed(null);
                                      setUploadState('idle');
                                      setFileName("");
                                      setResumeText("");
                                    } else {
                                      setErrorMessage(result.error || "Failed to delete resume");
                                    }
                                  } catch (error) {
                                    console.error("Error deleting resume:", error);
                                    setErrorMessage("An error occurred while deleting your resume");
                                  } finally {
                                    setIsDeleting(false);
                                  }
                                }}
                                disabled={isDeleting}
                                className="bg-red-600 focus:ring-red-600"
                              >
                                {isDeleting ? "Deleting..." : "Delete & Replace"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Parsed information from your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <File className="h-8 w-8 text-primary/70" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileName || "resume.pdf"}</p>
                        <p className="text-xs text-muted-foreground">Uploaded on {new Date().toLocaleDateString()}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        setUploadState('idle');
                        setResumeUploaded(false);
                        setResumeParsed(null);
                      }}>
                        <Upload className="h-4 w-4 mr-2" />
                        Replace
                      </Button>
                    </div>

                    {isSuccess(uploadState) && resumeParsed ? (
                      <>
                        {/* Parsed skills section */}
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">Technical Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {resumeParsed.parsed_skills.technical.map((skill, idx) => (
                              <div key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                {skill.skill} {skill.level && `(${skill.level}${skill.years ? `, ${skill.years} yrs` : ''})`}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">Soft Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {resumeParsed.parsed_skills.soft.map((skill, idx) => (
                              <div key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm">
                                {skill.skill} {skill.context && `(${skill.context})`}
                              </div>
                            ))}
                          </div>
                        </div>

                        {resumeParsed.parsed_skills.certifications && resumeParsed.parsed_skills.certifications.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-lg font-medium">Certifications</h3>
                            <div className="flex flex-wrap gap-2">
                              {resumeParsed.parsed_skills.certifications.map((cert, idx) => (
                                <div key={idx} className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-sm">
                                  {cert.name} {cert.year && `(${cert.year})`}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Experience section */}
                        {resumeParsed.experience.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-lg font-medium">Experience Summary</h3>
                            <div className="space-y-2">
                              {resumeParsed.experience.map((exp, index) => (
                                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm font-medium">{exp.title} at {exp.company}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {exp.duration.years} year{exp.duration.years !== 1 ? 's' : ''} 
                                    {exp.duration.months > 0 ? `, ${exp.duration.months} month${exp.duration.months !== 1 ? 's' : ''}` : ''}
                                  </p>
                                  {exp.highlights.length > 0 && (
                                    <ul className="text-xs mt-2 list-disc list-inside space-y-1">
                                      {exp.highlights.map((highlight, i) => (
                                        <li key={i}>{highlight}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Education section */}
                        {resumeParsed.education.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-lg font-medium">Education</h3>
                            <div className="space-y-2">
                              {resumeParsed.education.map((edu, index) => (
                                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm font-medium">{edu.degree}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {edu.institution} {edu.year && `(${edu.year})`}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Projects section */}
                        {resumeParsed.projects && resumeParsed.projects.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-lg font-medium">Projects</h3>
                            <div className="space-y-2">
                              {resumeParsed.projects.map((project, index) => (
                                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm font-medium">{project.name}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
                                  {project.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {project.technologies.map((tech, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs rounded-full">
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Loading skeleton for resume details */}
                        <div className="space-y-8">
                          {/* Skills skeletons */}
                          <div className="space-y-3">
                            <Skeleton className="h-6 w-40" />
                            <div className="flex flex-wrap gap-2">
                              <Skeleton className="h-7 w-24 rounded-full" />
                              <Skeleton className="h-7 w-32 rounded-full" />
                              <Skeleton className="h-7 w-20 rounded-full" />
                              <Skeleton className="h-7 w-28 rounded-full" />
                              <Skeleton className="h-7 w-36 rounded-full" />
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <Skeleton className="h-6 w-36" />
                            <div className="flex flex-wrap gap-2">
                              <Skeleton className="h-7 w-28 rounded-full" />
                              <Skeleton className="h-7 w-20 rounded-full" />
                              <Skeleton className="h-7 w-32 rounded-full" />
                            </div>
                          </div>
                          
                          {/* Experience skeletons */}
                          <div className="space-y-3">
                            <Skeleton className="h-6 w-48" />
                            <div className="space-y-3">
                              <Skeleton className="h-24 w-full rounded-lg" />
                              <Skeleton className="h-24 w-full rounded-lg" />
                            </div>
                          </div>
                          
                          {/* Education skeleton */}
                          <div className="space-y-3">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                          </div>
                        </div>
                      </>
                    )}
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
              {isCheckingDb(uploadState) ? (
                <Card className="h-full">
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
                </Card>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}