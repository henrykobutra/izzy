'use client';

import { ResumeParserResponse } from '@/types/openai';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { File, Upload, FileText, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadState, isSuccess } from './types';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteCurrentResume } from '@/lib/actions/resume-parser';

interface ResumeDetailsProps {
  fileName: string;
  resumeParsed: ResumeParserResponse | null;
  uploadState: UploadState;
  setUploadState: (state: UploadState) => void;
  setResumeUploaded: (uploaded: boolean) => void;
  setResumeParsed: (parsedData: ResumeParserResponse | null) => void;
  setFileName: (name: string) => void;
  setResumeText: (text: string) => void;
}

export function ResumeDetails({
  fileName,
  resumeParsed,
  uploadState,
  setUploadState,
  setResumeUploaded,
  setResumeParsed,
  setFileName,
  setResumeText
}: ResumeDetailsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDeleteResume = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCurrentResume();
      if (result.success) {
        setDialogOpen(false);
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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Resume Details</span>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 rounded-md text-xs font-medium">
              <CheckCircle className="h-3 w-3" />
              Current
            </div>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                {errorMessage && (
                  <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 dark:bg-red-950/50 rounded-md">
                    {errorMessage}
                  </div>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <Button 
                    onClick={handleDeleteResume}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600 focus-visible:ring-red-600"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete & Replace
                      </>
                    )}
                  </Button>
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
          <ResumeContent resumeParsed={resumeParsed} />
        ) : (
          <ResumeContentSkeleton />
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
  );
}

interface ResumeContentProps {
  resumeParsed: ResumeParserResponse;
}

function ResumeContent({ resumeParsed }: ResumeContentProps) {
  return (
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
  );
}

function ResumeContentSkeleton() {
  return (
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
  );
}