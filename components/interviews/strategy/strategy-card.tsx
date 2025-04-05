'use client';

import Link from 'next/link';
import { Bot, Play } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkillsAnalysis } from './skills-analysis';
import { FocusAreas } from './focus-areas';
import { ProcessedStrategyData } from '@/types/strategy';

interface StrategyCardProps {
  sessionId: string;
  strategy: ProcessedStrategyData;
}

export function StrategyCard({ sessionId, strategy }: StrategyCardProps) {
  const { jobAnalysis, skillsMatch, interviewPlan } = strategy;
  
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-500" />
            Interview Strategy
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full">
              Strategist
            </div>
            {jobAnalysis.level && (
              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full capitalize">
                {jobAnalysis.level}
              </div>
            )}
          </div>
        </div>
        <CardDescription>
          Your personalized interview plan for {jobAnalysis.title || 'this role'}
          {jobAnalysis.company ? ` at ${jobAnalysis.company}` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SkillsAnalysis 
          strongMatches={skillsMatch.strong_matches} 
          areasToHighlight={skillsMatch.areas_to_highlight} 
        />

        <FocusAreas focusAreas={interviewPlan.focus_areas} />

        {/* Questions section */}
        {/* Comment out questions for now since it always renders with empty array */}
        {/* {strategy.interviewPlan.question_count > 0 && (
          <InterviewQuestions 
            questions={[]} 
          />
        )} */}
      </CardContent>
      <CardFooter>
        <Button className="gap-2" asChild>
          <Link href={`/interviews/session/${sessionId}`}>
            <Play className="h-4 w-4" />
            Start Practice Interview
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}