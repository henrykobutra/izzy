'use client';

import { useState } from 'react';
import { UploadState } from '@/components/resume/types';
import { ResumeParserResponse } from '@/types/openai';
import { parseResume, saveResumeToSupabase } from '@/agents/parser/agent';

export function useResumeUpload() {
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [dragActive, setDragActive] = useState(false);
  const [resumeParsed, setResumeParsed] = useState<ResumeParserResponse | null>(null);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [resumeText, setResumeText] = useState("");

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

  return {
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
    setErrorMessage,
    resumeText,
    setResumeText,
    handleFileUpload,
    handleTextSubmit
  };
}