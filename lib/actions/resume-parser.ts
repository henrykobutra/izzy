'use server';

import OpenAI from 'openai';
import { ResumeParserResponse } from '@/types/openai';

// Initialize OpenAI client server-side with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseResume(pdfText: string) {
  try {
    // Process with OpenAI Assistant
    const assistantId = process.env.OPENAI_RESUME_PARSER_ASSISTANT_ID;
    
    if (!assistantId) {
      throw new Error('Resume parser assistant ID not configured');
    }
    
    // Create thread and send message to OpenAI Assistant
    const thread = await openai.beta.threads.create();
    
    await openai.beta.threads.messages.create(
      thread.id,
      {
        role: "user",
        content: `Please analyze this resume and extract the key information:\n\n${pdfText}`
      }
    );
    
    // Run the assistant
    const run = await openai.beta.threads.runs.create(
      thread.id,
      {
        assistant_id: assistantId
      }
    );
    
    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(
      thread.id,
      run.id
    );
    
    // Simple polling mechanism - in production, use a more sophisticated approach
    while (runStatus.status !== "completed" && runStatus.status !== "failed") {
      // Wait 1 second between polls
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );
    }
    
    if (runStatus.status === "failed") {
      throw new Error('Assistant processing failed');
    }
    
    // Get assistant response
    const messages = await openai.beta.threads.messages.list(thread.id);
    
    // Find the assistant's response
    const assistantMessages = messages.data.filter(
      (message) => message.role === "assistant"
    );
    
    if (assistantMessages.length === 0) {
      throw new Error('No response from assistant');
    }
    
    // Parse JSON from the message
    const lastMessage = assistantMessages[0];
    const messageContent = lastMessage.content[0];
    
    if (messageContent.type !== "text") {
      throw new Error('Expected text response from assistant');
    }
    
    // Extract JSON from the text response
    const textContent = messageContent.text.value;
    let jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/);
    
    if (!jsonMatch) {
      // Try to find any JSON-like structure
      jsonMatch = textContent.match(/\{[\s\S]*\}/);
    }
    
    if (!jsonMatch) {
      throw new Error('Could not parse JSON response from assistant');
    }
    
    // Parse and normalize the JSON response
    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      
      // Handle potential legacy format conversion
      if (parsedJson.skills && !parsedJson.parsed_skills) {
        console.log("Converting legacy format to new schema");
        parsedJson = {
          parsed_skills: {
            technical: parsedJson.skills.technical.map((skill: string) => ({ skill })),
            soft: parsedJson.skills.soft.map((skill: string) => ({ skill })),
            certifications: parsedJson.certifications ? 
              parsedJson.certifications.map((cert: { name: string; year?: string | number }) => ({ 
                name: cert.name, 
                year: cert.year ? (typeof cert.year === 'string' ? parseInt(cert.year) : cert.year) : undefined 
              })) : []
          },
          experience: parsedJson.experience.map((exp: { position?: string; title?: string; company: string; duration: string | { years?: number; months?: number }; description?: string }) => ({
            title: exp.position || exp.title,
            company: exp.company,
            duration: {
              years: typeof exp.duration === 'string' 
                ? parseInt(exp.duration.match(/(\d+)\s*years?/i)?.[1] || '0')
                : exp.duration?.years || 0,
              months: typeof exp.duration === 'string'
                ? parseInt(exp.duration.match(/(\d+)\s*months?/i)?.[1] || '0')
                : exp.duration?.months || 0
            },
            highlights: exp.description ? [exp.description] : []
          })),
          education: parsedJson.education.map((edu: { degree: string; institution: string; year?: string | number }) => ({
            degree: edu.degree,
            institution: edu.institution,
            year: edu.year ? (typeof edu.year === 'string' ? parseInt(edu.year) : edu.year) : undefined
          })),
          projects: parsedJson.projects
            ? parsedJson.projects.map((proj: { name: string; description: string; technologies?: string[] }) => ({
                name: proj.name,
                description: proj.description,
                technologies: Array.isArray(proj.technologies) 
                  ? proj.technologies 
                  : []
              }))
            : []
        };
      }
      
      return { success: true, data: parsedJson as ResumeParserResponse };
      
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error('Failed to parse JSON response');
    }
    
  } catch (error) {
    console.error('Error processing resume:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process resume' 
    };
  }
}