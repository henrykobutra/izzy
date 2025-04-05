'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InterviewQuestion } from '@/types/strategy';

interface InterviewQuestionsProps {
  questions: InterviewQuestion[];
}

export function InterviewQuestions({ questions }: InterviewQuestionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Recommended Questions</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-xs gap-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{isOpen ? 'Hide questions' : 'Show questions'}</span>
          <ChevronDown 
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex justify-between mb-1">
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-medium rounded-full bg-primary/10 text-primary mr-2">
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {question.question_type}
                  </span>
                </div>
                <div className="flex items-center">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      question.difficulty === 'easy'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : question.difficulty === 'medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {question.difficulty}
                  </span>
                </div>
              </div>
              <p className="text-sm">{question.question_text}</p>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Related to: {question.related_skill}</span>
                <span>Area: {question.focus_area}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}