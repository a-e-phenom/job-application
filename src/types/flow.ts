export interface FlowModule {
  id: string;
  name: string;
  description: string;
  component: string;
  isRequired?: boolean;
  // Flow-specific template overrides
  templateOverrides?: {
    title?: string;
    subtitle?: string;
    instructions?: string;
    centerTitle?: boolean;
    splitScreenWithImage?: boolean;
    splitScreenImage?: string;
    splitScreenImagePosition?: 'left' | 'right';
    comments?: string;
    questions?: Array<{
      id: string;
      text: string;
      type: 'text' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file' | 'image' | 'phone' | 'interview-scheduler' | 'message' | 'assessment' | 'video-interview';
      options?: string[];
      required?: boolean;
      halfWidth?: boolean;
      layout?: 'vertical' | 'horizontal';
      content?: string;
    }>;
    customFields?: Record<string, any>;
    customButtons?: Array<{
      id: string;
      label: string;
      isPrimary: boolean;
      targetStep?: number;
      targetSubStep?: number;
      targetModule?: string;
      targetFlow?: string;
    }>;
  };
}

export interface FlowStep {
  id: string;
  name: string;
  modules: FlowModule[];
}

export interface ApplicationFlow {
  id: string;
  name: string;
  description: string;
  slug: string; // URL-friendly identifier
  steps: FlowStep[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  primaryColor?: string;
  logoUrl?: string;
}



export const PRESET_COLORS = [
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Gray', value: '#6B7280' }
];