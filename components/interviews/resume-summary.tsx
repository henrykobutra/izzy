'use client';

import { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  ChevronRight, 
  BookOpen, 
  Briefcase, 
  Code, 
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { ResumeData } from '@/components/resume/types';

interface ResumeSummaryProps {
  resumeData: ResumeData;
}

export function ResumeSummary({ resumeData }: ResumeSummaryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <>
      <div className="p-4 border rounded-lg bg-muted/30 flex items-start gap-3">
        <div className="mt-1">
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Resume processed</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 px-2" 
              onClick={() => setIsDialogOpen(true)}
            >
              View Details <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {resumeData.technical_skills_count + resumeData.soft_skills_count} skills identified and {resumeData.total_years_experience} {resumeData.total_years_experience === 1 ? 'year' : 'years'} of experience detected
          </p>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume Details</DialogTitle>
            <DialogDescription>
              Information extracted from your resume that will be used for the interview
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Technical Skills */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-primary" />
                <h3 className="text-lg font-medium">Technical Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {resumeData.full_resume.parsed_skills?.technical?.map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-primary/10">
                    {skill.skill} {skill.level && `(${skill.level}${skill.years ? `, ${skill.years} yrs` : ''})`}
                  </Badge>
                )) || null}
              </div>
            </div>
            
            {/* Soft Skills */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                <h3 className="text-lg font-medium">Soft Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {resumeData.full_resume.parsed_skills?.soft?.map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {skill.skill} {skill.context && `(${skill.context})`}
                  </Badge>
                )) || null}
              </div>
            </div>
            
            {/* Experience */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-amber-500" />
                <h3 className="text-lg font-medium">Professional Experience</h3>
              </div>
              <div className="space-y-3">
                {resumeData.full_resume.experience?.map((exp, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="font-medium">{exp.title} at {exp.company}</p>
                    <p className="text-sm text-muted-foreground">
                      {exp.duration?.years} year{exp.duration?.years !== 1 ? 's' : ''} 
                      {exp.duration?.months && exp.duration?.months > 0 ? `, ${exp.duration.months} month${exp.duration.months !== 1 ? 's' : ''}` : ''}
                    </p>
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="text-sm mt-2 list-disc list-inside space-y-1">
                        {exp.highlights.map((highlight, i) => (
                          <li key={i}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )) || null}
              </div>
            </div>
            
            {/* Education */}
            {resumeData.full_resume.education && resumeData.full_resume.education.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <h3 className="text-lg font-medium">Education</h3>
                </div>
                <div className="space-y-3">
                  {resumeData.full_resume.education?.map((edu, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-sm text-muted-foreground">
                        {edu.institution} {edu.year && `(${edu.year})`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Projects (if available) */}
            {resumeData.full_resume.projects && resumeData.full_resume.projects.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <h3 className="text-lg font-medium">Projects</h3>
                </div>
                <div className="space-y-3">
                  {resumeData.full_resume.projects?.map((project, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm mt-1">{project.description}</p>
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech, i) => (
                            <Badge key={i} variant="outline" className="bg-gray-100 dark:bg-gray-800">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}