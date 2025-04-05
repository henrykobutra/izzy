'use client';

import { BarChart4, MessageSquare } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AgentCardsProps {
  estimatedDuration: string;
  questionCount: number;
  preparationTips?: string[];
  skillGaps?: { skill: string; mitigation: string }[];
}

export function AgentCards({ 
  estimatedDuration, 
  questionCount,
  preparationTips,
  skillGaps,
}: AgentCardsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              Interviewer Agent
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ready to conduct your mock interview with questions based on the strategy.
          </p>

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm">
              Estimated duration: <span className="font-medium">{estimatedDuration}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {questionCount} questions covering key focus areas
            </p>
          </div>
        </CardContent>
      </Card>

      {preparationTips && preparationTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Preparation Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs space-y-1 text-muted-foreground">
              {preparationTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="min-w-4 pt-0.5">•</div>
                  <div>{tip}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <div className="flex items-center gap-2">
              <BarChart4 className="h-5 w-5 text-green-500" />
              Evaluator Agent
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Will provide scoring and constructive feedback on your interview responses after
            completion.
          </p>
        </CardContent>
      </Card>

      {skillGaps && skillGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Skills to Develop</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs space-y-2 text-muted-foreground">
              {skillGaps.map((gap, index) => (
                <li key={index} className="space-y-1">
                  <div className="font-medium text-sm">{gap.skill}</div>
                  {gap.mitigation && (
                    <div className="border-l-2 border-primary/30 pl-2 text-xs">
                      {gap.mitigation}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}