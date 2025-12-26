
export interface User {
  id: string;
  name: string;
  email: string;
  skills?: string[];
  role?: string;
  createdAt?: string;
}

export interface SkillAnalysis {
  detectedSkills: string[];
  predictedRole: string;
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  irrelevantSkills: string[];
}

export interface StudyPlanItem {
  skill: string;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  resources: { title: string; url: string }[];
  description: string;
}

export interface InterviewQuestion {
  id: string;
  category: 'Technical' | 'HR' | 'Aptitude' | 'Coding' | 'System Design';
  question: string;
  answer: string;
  tips: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AppState {
  user: User | null;
  analysis: SkillAnalysis | null;
  studyPlan: StudyPlanItem[] | null;
  interviewPrep: InterviewQuestion[] | null;
  history: any[];
}

export type AuthMode = 'signin' | 'signup';
