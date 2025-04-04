# Izzy AI: An Adaptive Multi-Agent Interview Prep System

_Completed Individually by Varit Kobutra_  
_ITAI 2376: Deep Learning_  
_Professor Patricia McManus (CRN: 19519)_  
_Houston Community College_  
_Spring 2025_

## Problem Statement

Job interviews are high-stakes and nerve-wracking. Generic prep tools spit out random questions, ignoring your unique background and the specific role. Candidates need a tailored, adaptive coach that mirrors their skills to the job and hones their answers through practice. This project builds an Interview Prep Squad—a team of AI agents that parses your resume, strategizes your prep, mocks an interview, and sharpens your performance.

## Project Option

Multi-Agent Collaborative System. Four specialized agents (Parser, Strategist, Interviewer, Evaluator) work together to deliver personalized interview prep, outperforming a single-agent approach by dividing and conquering the task.

## Agent Design

### Architecture:

- **Parser Agent**: Processes resume and job description inputs, extracting skills and requirements (e.g., "Java, 3 years" or "needs communication").
- **Strategist Agent**: Uses Chain-of-Thought reasoning to map skills to job needs and plan questions (e.g., "They want leadership—ask about team projects").
- **Interviewer Agent**: Generates and asks mock questions based on Strategist's plan.
- **Evaluator Agent**: Scores answers (1–5 on clarity, relevance) and suggests improvements.

### Collaboration:

Linear handoff—Parser to Strategist to Interviewer to Evaluator—with feedback looping back to refine the next round.

### Pattern:

Planning-then-execution. Strategist plans, Interviewer executes, Evaluator reflects.

## Tool Selection

- **OpenAI API**: Powers NLP for parsing resume/job text, generating questions, and scoring answers. Used by all agents. Error handling: Fallback to generic prompts if API rate-limits hit.
- **SerpAPI (or Web Search)**: Strategist and Interviewer pull role-specific questions from the web (e.g., "common data analyst interview Qs"). Fallback: Cached question bank if search fails.
- **Supabase**: Stores user profiles (skills, past answers) and scores for RL feedback. Auth secures user data.

## Development Plan

- **March 31–April 7**: Set up Next.js on Vercel, connect Supabase for auth/database, draft Parser agent with OpenAI API. Submit proposal.
- **April 8–14**: Build Strategist (add SerpAPI for questions), test basic profile-to-plan flow.
- **April 15–21**: Code Interviewer and Evaluator, link all agents in a mock run.
- **April 22–28**: Add RL—Evaluator scores tweak Strategist's next plan. Refine UI.
- **April 29–May 5**: Test with sample resumes/jobs, record demo video, finalize report/code.

## Evaluation Strategy

### Test Cases:

Run with 3 scenarios (e.g., software engineer, marketing role, teacher) using fake resumes and job postings.

### Metrics:

- Strategy fit (do questions match job needs?).
- Answer improvement (do scores rise after feedback?).
- Reliability (does it crash or hallucinate less than 10% of the time?).

### Method:

Manual review of outputs plus user simulation (me answering as "candidate").

## Resource Requirements

- **Next.js/Vercel**: Free tier hosts the web app.
- **Supabase**: Free database/auth tier for user data.
- **OpenAI API**: $5–10 credit (test small, cache responses to stretch it).
- **SerpAPI**: Free trial or mock with static data if budget's tight.
- **Dev Environment**: Local machine + Replit for quick agent tests. LangGraph explored for agent flow if time allows.

## Risk Assessment

- **Challenge**: OpenAI API costs. **Solution**: Use minimal prompts, cache outputs, cap usage at 100 calls.
- **Challenge**: Agent miscommunication (e.g., Strategist picks bad questions). **Solution**: Test handoffs early, add debug logs.
- **Challenge**: RL tuning—Evaluator overcorrects. **Solution**: Start with simple scoring (1–5), adjust based on test runs.
