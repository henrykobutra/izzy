import { FocusArea } from '@/types/strategy';

export const DEFAULT_FOCUS_AREAS: FocusArea[] = [
  { name: 'Technical Competency', weight: 40, description: 'Core technical skills' },
  { name: 'Problem Solving', weight: 30, description: 'Analytical abilities' },
  { name: 'Experience', weight: 20, description: 'Relevant background' },
  { name: 'Culture Fit', weight: 10, description: 'Team compatibility' }
];

export const DEFAULT_QUESTION_COUNT = 10;
export const DEFAULT_INTERVIEW_DURATION = '20-25 minutes';