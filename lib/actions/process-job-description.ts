'use server';

import { processJobDescription as agentProcessJobDescription } from '@/agents/process-job-description';

export async function processJobDescription(jobDesc: string) {
  // Call the agent implementation
  return agentProcessJobDescription(jobDesc);
}