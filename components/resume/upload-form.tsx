'use client';

import { useState, useRef } from 'react';
import { FileUp, Loader2, Search, Text, Upload, FileText, RefreshCw, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { UploadState, isIdle, isProcessing, isUploading, isSaving, isError, isSuccess } from './types';
import { cn } from '@/lib/utils';

interface UploadFormProps {
  uploadState: UploadState;
  dragActive: boolean;
  resumeText: string;
  errorMessage: string;
  handleFileUpload: (file: File) => Promise<void>;
  handleTextSubmit: () => Promise<void>;
  setResumeText: (text: string) => void;
  setDragActive: (active: boolean) => void;
  setUploadState: (state: UploadState) => void;
  setResumeUploaded: (uploaded: boolean) => void;
}

export function UploadForm({
  uploadState,
  dragActive,
  resumeText,
  errorMessage,
  handleFileUpload,
  handleTextSubmit,
  setResumeText,
  setDragActive,
  setUploadState,
  setResumeUploaded
}: UploadFormProps) {
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // If processing, show a dedicated processing card
  if (!isIdle(uploadState)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {isUploading(uploadState) && "Extracting Resume Text"}
            {isProcessing(uploadState) && "Analyzing Your Resume"}
            {isSaving(uploadState) && "Saving Your Resume"}
            {isSuccess(uploadState) && "Resume Processed Successfully"}
            {isError(uploadState) && "Resume Processing Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 space-y-6">
            {/* Processing animations for each state */}
            <div className="flex justify-center">
              {isUploading(uploadState) && (
                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary/10">
                  <Loader2 className="h-12 w-12 text-primary/70 animate-spin" />
                </div>
              )}
              {isProcessing(uploadState) && (
                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <RefreshCw className="h-12 w-12 text-amber-500 animate-spin" />
                </div>
              )}
              {isSaving(uploadState) && (
                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Save className="h-12 w-12 text-blue-500 animate-pulse" />
                </div>
              )}
              {isSuccess(uploadState) && (
                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30">
                  <FileText className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              )}
              {isError(uploadState) && (
                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/30">
                  <div className="text-red-600 dark:text-red-400 text-5xl font-bold">!</div>
                </div>
              )}
            </div>
            
            {/* Processing message */}
            <div className="text-center space-y-2">
              {isUploading(uploadState) && (
                <>
                  <h3 className="text-lg font-medium">Reading Your Document</h3>
                  <p className="text-muted-foreground">Please wait while we extract text from your PDF file</p>
                </>
              )}
              {isProcessing(uploadState) && (
                <>
                  <h3 className="text-lg font-medium">Resume Analysis in Progress</h3>
                  <p className="text-muted-foreground">
                    Our AI Parser is extracting skills, experience, and qualifications from your resume
                  </p>
                </>
              )}
              {isSaving(uploadState) && (
                <>
                  <h3 className="text-lg font-medium">Saving Your Data</h3>
                  <p className="text-muted-foreground">Securely storing your resume information for interview preparation</p>
                </>
              )}
              {isSuccess(uploadState) && (
                <>
                  <h3 className="text-lg font-medium">Resume Successfully Processed!</h3>
                  <p className="text-muted-foreground">Your resume has been analyzed and is ready for interview preparation</p>
                </>
              )}
              {isError(uploadState) && (
                <>
                  <h3 className="text-lg font-medium">Processing Failed</h3>
                  <p className="text-red-500">{errorMessage || "An error occurred while processing your resume"}</p>
                </>
              )}
            </div>
            
            {/* Progress indicators or buttons */}
            <div className="flex justify-center mt-6">
              {(isUploading(uploadState) || isProcessing(uploadState) || isSaving(uploadState)) && (
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "600ms" }} />
                </div>
              )}
              {isSuccess(uploadState) && (
                <Button onClick={() => setResumeUploaded(true)} className="gap-2">
                  <FileText className="h-4 w-4" />
                  View Resume Details
                </Button>
              )}
              {isError(uploadState) && (
                <Button onClick={() => setUploadState('idle')} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Regular upload form for idle state
  return (
    <Card>
      <CardContent className="pt-6">
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
                  onClick={handleClickUpload}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
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
                  
                  <Button 
                    onClick={handleTextSubmit} 
                    className="w-full gap-2"
                    disabled={!resumeText.trim()}
                  >
                    <Search className="h-4 w-4" />
                    Analyze Resume
                  </Button>
                  
                  {errorMessage && (
                    <p className="text-sm text-red-500">{errorMessage}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}