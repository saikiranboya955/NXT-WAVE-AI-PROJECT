import type {
  FinderAnswers,
  ProjectRecommendation,
  ProjectId,
} from '../types';

// ─── Project catalogue ────────────────────────────────────────────────────────

const PROJECTS: Record<ProjectId, ProjectRecommendation> = {
  'resume-feedback': {
    id: 'resume-feedback',
    name: 'Resume Feedback Assistant',
    tagline: 'Paste your resume; get structured, actionable feedback instantly.',
    why: 'You said you want to solve a real-world problem and build something practical. A resume reviewer is a tool almost every student needs right now, and the beginner version fits neatly inside a single focused session.',
    starterTasks: [
      'Accept plain-text resume input via a simple form',
      'Run keyword matching against a target job description',
      'Display a structured feedback report (strengths, gaps, suggestions)',
    ],
    sixtyMinScope:
      'In 60 minutes you will have a working keyword-matching assistant that reads a pasted resume and a job description, then outputs structured feedback. A full AI-powered version with LLM scoring is a natural next step after the workshop.',
    techStack: ['Python', 'Streamlit or Flask', 'basic string processing'],
  },
  'expense-analyzer': {
    id: 'expense-analyzer',
    name: 'Student Expense Analyzer',
    tagline: 'Upload a CSV of transactions and get instant category summaries.',
    why: 'You enjoy working with data and want to build a useful tool. Expense analysis is a concrete, data-driven project where Python pandas skills pay off immediately — and every student has expense data to test with.',
    starterTasks: [
      'Load a CSV of transactions using pandas',
      'Categorise spending by keyword matching (food, transport, study)',
      'Plot a simple bar chart of monthly spending by category',
    ],
    sixtyMinScope:
      'In 60 minutes you will load real CSV data, run category tagging, and display a readable summary chart. Adding predictive budgeting or bank API integration is a clear path for after the workshop.',
    techStack: ['Python', 'pandas', 'matplotlib or plotly'],
  },
  'notes-summarizer': {
    id: 'notes-summarizer',
    name: 'Study Notes Summarizer',
    tagline: 'Paste lecture notes; get bullet-point summaries in seconds.',
    why: 'You want to learn the basics and create content. A notes summarizer is one of the cleanest entry points into NLP — you get visible, useful output from a small amount of code, which makes learning feel rewarding.',
    starterTasks: [
      'Accept a block of lecture-note text via a simple form',
      'Split text into sentences and score by keyword frequency',
      'Return the top five most informative sentences as a bullet summary',
    ],
    sixtyMinScope:
      'In 60 minutes you will build an extractive summariser that works without any API key or cloud service. After the workshop you can extend it to use a free LLM API for abstractive summaries.',
    techStack: ['Python', 'NLTK or spaCy', 'Streamlit'],
  },
  'faq-assistant': {
    id: 'faq-assistant',
    name: 'Campus FAQ Assistant',
    tagline: 'Answer common campus questions from a plain-text knowledge base.',
    why: 'You want to build something useful with a portfolio impact. A FAQ chatbot demonstrates retrieval, matching, and a conversational interface — skills that appear in nearly every AI job description — and you already know your campus context inside out.',
    starterTasks: [
      'Define a small FAQ list as a Python dictionary or text file',
      'Match user questions to FAQ entries using cosine similarity or fuzzy match',
      'Display the best-matching answer in a simple chat interface',
    ],
    sixtyMinScope:
      'In 60 minutes you will have a working FAQ matcher that handles common campus questions. A production version with a vector database and LLM fallback is the logical workshop follow-up project.',
    techStack: ['Python', 'scikit-learn or rapidfuzz', 'Streamlit'],
  },
};

// ─── Recommendation logic ─────────────────────────────────────────────────────
// Deterministic mapping: no external model, no randomness.
// Rule table is readable and independently auditable.

type RecommendationKey = `${FinderAnswers['interest']}-${FinderAnswers['skill']}-${FinderAnswers['goal']}`;

const RECOMMENDATION_MAP: Partial<Record<string, ProjectId>> = {
  // interest: real-world
  'real-world-beginner-learn-basics': 'notes-summarizer',
  'real-world-beginner-practical-problem': 'resume-feedback',
  'real-world-beginner-portfolio': 'faq-assistant',
  'real-world-some-python-learn-basics': 'expense-analyzer',
  'real-world-some-python-practical-problem': 'resume-feedback',
  'real-world-some-python-portfolio': 'resume-feedback',
  'real-world-small-project-learn-basics': 'expense-analyzer',
  'real-world-small-project-practical-problem': 'resume-feedback',
  'real-world-small-project-portfolio': 'faq-assistant',

  // interest: tools
  'tools-beginner-learn-basics': 'notes-summarizer',
  'tools-beginner-practical-problem': 'resume-feedback',
  'tools-beginner-portfolio': 'resume-feedback',
  'tools-some-python-learn-basics': 'resume-feedback',
  'tools-some-python-practical-problem': 'expense-analyzer',
  'tools-some-python-portfolio': 'faq-assistant',
  'tools-small-project-learn-basics': 'expense-analyzer',
  'tools-small-project-practical-problem': 'faq-assistant',
  'tools-small-project-portfolio': 'faq-assistant',

  // interest: data
  'data-beginner-learn-basics': 'expense-analyzer',
  'data-beginner-practical-problem': 'expense-analyzer',
  'data-beginner-portfolio': 'expense-analyzer',
  'data-some-python-learn-basics': 'expense-analyzer',
  'data-some-python-practical-problem': 'expense-analyzer',
  'data-some-python-portfolio': 'expense-analyzer',
  'data-small-project-learn-basics': 'expense-analyzer',
  'data-small-project-practical-problem': 'expense-analyzer',
  'data-small-project-portfolio': 'faq-assistant',

  // interest: content
  'content-beginner-learn-basics': 'notes-summarizer',
  'content-beginner-practical-problem': 'notes-summarizer',
  'content-beginner-portfolio': 'notes-summarizer',
  'content-some-python-learn-basics': 'notes-summarizer',
  'content-some-python-practical-problem': 'notes-summarizer',
  'content-some-python-portfolio': 'faq-assistant',
  'content-small-project-learn-basics': 'notes-summarizer',
  'content-small-project-practical-problem': 'faq-assistant',
  'content-small-project-portfolio': 'faq-assistant',
};

export function getRecommendation(answers: FinderAnswers): ProjectRecommendation | null {
  if (!answers.interest || !answers.skill || !answers.goal) return null;

  const key = `${answers.interest}-${answers.skill}-${answers.goal}` as RecommendationKey;
  const projectId = RECOMMENDATION_MAP[key] ?? 'resume-feedback';

  // Inject personalised "why" based on answers
  const base = PROJECTS[projectId];
  return {
    ...base,
    why: buildPersonalisedWhy(base, answers),
  };
}

export function getProjectById(id: ProjectId): ProjectRecommendation {
  return PROJECTS[id];
}

function buildPersonalisedWhy(
  project: ProjectRecommendation,
  answers: FinderAnswers
): string {
  const interestLabel: Record<string, string> = {
    'real-world': 'solving real-world problems',
    tools: 'building useful tools',
    data: 'working with data',
    content: 'creating content',
  };
  const skillLabel: Record<string, string> = {
    beginner: 'a beginner',
    'some-python': 'someone who knows some Python',
    'small-project': 'someone who has built a small project before',
  };
  const goalLabel: Record<string, string> = {
    'learn-basics': 'learn the basics',
    'practical-problem': 'solve a practical problem',
    portfolio: 'build a portfolio project',
  };

  return `You are interested in ${interestLabel[answers.interest!]}, you are ${skillLabel[answers.skill!]}, and you want to ${goalLabel[answers.goal!]}. ${project.tagline} This project gives you a fast, visible result that maps directly onto what you said matters to you.`;
}
