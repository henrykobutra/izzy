'use client';

import { CheckCircle, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SkillsAnalysisProps {
  strongMatches: { skill: string; experience?: string }[];
  areasToHighlight: { skill: string; note: string }[];
}

export function SkillsAnalysis({ 
  strongMatches, 
  areasToHighlight 
}: SkillsAnalysisProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Skills Match Analysis</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
              Strong Matches
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <ul className="space-y-1 text-sm">
              {(strongMatches || []).map((match, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>
                    {match.skill} {match.experience ? `(${match.experience})` : ''}
                  </span>
                </li>
              ))}
              {!strongMatches?.length && (
                <li className="text-muted-foreground italic">No strong matches found</li>
              )}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Areas to Highlight
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <ul className="space-y-1 text-sm">
              {(areasToHighlight || []).map((area, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-amber-500" />
                  <span>
                    {area.skill} {area.note ? `(${area.note})` : ''}
                  </span>
                </li>
              ))}
              {!areasToHighlight?.length && (
                <li className="text-muted-foreground italic">No areas found</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}