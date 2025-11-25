export interface ContactInfo {
  firstName: string;
  lastName: string;
  addressLine1: string;
  state: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  optInCommunications: boolean;
}

export interface JobFitInfo {
  experience: string;
  skills: string[];
  availability: string;
  salary: string;
}

export interface TasksInfo {
  portfolioUrl: string;
  coverLetter: string;
  additionalInfo: string;
}

export interface PreScreeningInfo {
  isAtLeast18: string;
  workAuthorization: string;
  requiresSponsorship: string;
  hasTransportation: string;
  travelDistance: string;
}

export interface ScreeningData {
  workEligibility: string;
  department: string;
  services: string[];
  motivation: string;
  weekdayDayShift: boolean;
  weekdayNightShift: boolean;
  weekdayNightShift2: boolean;
  weekendDayShift: boolean;
  weekendNightShift: boolean;
  weekendNightShift2: boolean;
}

export interface InterviewSchedulingData {
  selectedDate: string;
  selectedTime: string;
  timezone: string;
}

export interface ResumeData {
  resumeFile: File | null;
  previouslyWorked: string;
  howDidYouHear: string;
}

export interface AssessmentData {
  introCompleted: boolean;
  completed?: boolean;
  scenarioAnswers: Array<{
    questionId: string;
    bestResponse: string;
    worstResponse: string;
  }>;
  agreementAnswers: Array<{
    questionId: string;
    rating: number;
  }>;
  mathAnswers: Array<{
    questionId: string;
    answer: string;
  }>;
}

export interface VoiceScreeningData {
  introCompleted: boolean;
  completed?: boolean;
  callStarted: boolean;
  callDuration?: number;
  transcript?: string;
}

export interface ApplicationData {
  contactInfo: ContactInfo;
  jobFit: JobFitInfo;
  tasks: TasksInfo;
  preScreening: PreScreeningInfo;
  screening: ScreeningData;
  interviewScheduling: InterviewSchedulingData;
  resume: ResumeData;
  assessment: AssessmentData;
  voiceScreening: VoiceScreeningData;
}

export interface StepConfig {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  isCompleted: boolean;
}