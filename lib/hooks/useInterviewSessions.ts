import { useState, useEffect } from 'react';

export type InterviewStatus = 'not_started' | 'in_progress' | 'completed' | 'planned';

export interface InterviewSession {
  id: string;
  title: string;
  date: Date;
  status: InterviewStatus;
  score?: number;
}

export function useInterviewSessions() {
  const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>([]);

  useEffect(() => {
    // Load mock interview sessions (would be from API in real implementation)
    const loadInterviewSessions = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Add a previously completed interview for demo
      setInterviewSessions([
        {
          id: '1',
          title: 'Frontend Developer Interview',
          date: new Date(Date.now() - 86400000 * 3), // 3 days ago
          status: 'completed' as InterviewStatus,
          score: 4.2
        }
      ]);
    };

    loadInterviewSessions();
  }, []);

  const updateSessionStatus = (
    sessionId: string, 
    status: InterviewStatus, 
    additionalData: Partial<InterviewSession> = {}
  ) => {
    setInterviewSessions(prev => {
      const sessionIndex = prev.findIndex(session => session.id === sessionId);
      if (sessionIndex === -1) return prev;
      
      const updatedSessions = [...prev];
      updatedSessions[sessionIndex] = {
        ...updatedSessions[sessionIndex],
        status,
        ...additionalData
      };
      
      return updatedSessions;
    });
  };

  const addNewSession = (sessionData: Partial<InterviewSession> & { id: string }) => {
    setInterviewSessions(prev => [
      {
        id: sessionData.id,
        title: sessionData.title || 'Interview Session',
        date: sessionData.date || new Date(),
        status: sessionData.status || 'planned',
        score: sessionData.score
      },
      ...prev
    ]);
  };

  return {
    interviewSessions,
    setInterviewSessions,
    updateSessionStatus,
    addNewSession
  };
}