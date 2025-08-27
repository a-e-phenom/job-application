/// <reference types="vite/client" />

declare global {
  interface Window {
    assessmentState?: {
      currentSubStep: number;
      setCurrentSubStep: (step: number) => void;
      canAdvance: () => boolean;
      getSubStepTitle: (step: number) => string;
      handleNext: () => void;
      handlePrevious: () => void;
    };
  }
}