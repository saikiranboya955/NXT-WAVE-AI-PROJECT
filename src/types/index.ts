// ─── Types ────────────────────────────────────────────────────────────────────

export type Interest = 'real-world' | 'tools' | 'data' | 'content';
export type SkillLevel = 'beginner' | 'some-python' | 'small-project';
export type Goal = 'learn-basics' | 'practical-problem' | 'portfolio';

export type ProjectId =
  | 'resume-feedback'
  | 'expense-analyzer'
  | 'notes-summarizer'
  | 'faq-assistant';

export interface FinderAnswers {
  interest: Interest | null;
  skill: SkillLevel | null;
  goal: Goal | null;
}

export interface ProjectRecommendation {
  id: ProjectId;
  name: string;
  tagline: string;
  why: string;
  starterTasks: string[];
  sixtyMinScope: string;
  techStack: string[];
}

export interface Registration {
  id: string;
  name: string;
  email: string;
  college: string;
  graduationYear: string;
  referralCode?: string;
  projectId?: ProjectId;
  registeredAt: string;
  source: AcquisitionSource;
}

export type AcquisitionSource =
  | 'direct'
  | 'whatsapp'
  | 'referral'
  | 'organic';

export interface DashboardMetrics {
  totalRegistrations: number;
  target: number;
  campaignDays: number;
  budgetTotal: number;
  budgetSpent: number;
  bySource: Record<AcquisitionSource, number>;
  dailyTrend: Array<{ day: string; count: number }>;
  funnel: {
    landingPageViews: number;
    finderCompletions: number;
    registrations: number;
  };
  referralActivity: Array<{ code: string; count: number }>;
}

export interface ReferralInfo {
  code: string;
  shareUrl: string;
}
