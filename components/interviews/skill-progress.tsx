'use client';

import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface SkillScore {
  skill: string;
  averageScore: number;
}

interface SkillProgressProps {
  skillScores: SkillScore[];
}

export function SkillProgress({ skillScores }: SkillProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Progress</CardTitle>
        <CardDescription>
          Track your performance across key skills
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skillScores.length > 0 ? (
            skillScores.map(({ skill, averageScore }) => (
              <div key={skill} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{skill}</p>
                  <p className="text-sm font-medium">{averageScore.toFixed(1)}/5</p>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div 
                    className={`h-full rounded-full ${
                      averageScore >= 4 ? 'bg-green-500' :
                      averageScore >= 3 ? 'bg-amber-500' :
                      'bg-red-500'
                    }`} 
                    style={{ width: `${(averageScore / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Complete more interviews to see skill progress
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full gap-2">
          <FileText className="h-4 w-4" />
          View All Skills
        </Button>
      </CardFooter>
    </Card>
  );
}