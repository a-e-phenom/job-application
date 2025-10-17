import React, { useState } from 'react';
import { Check, Upload, X, ChevronLeft, ChevronRight, ChevronDown, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { ModuleTemplate } from '../hooks/useTemplates';
import VideoInterviewStep from './VideoInterviewStep';

interface GenericModuleRendererProps {
  template: ModuleTemplate;
  primaryColor: string;
  onNext?: () => void;
  onNavigate?: (target: NavigationTarget) => void;
  moduleOverrides?: {
    customButtons?: Array<{
      id: string;
      label: string;
      isPrimary: boolean;
      targetModule?: string;
      targetStep?: number;
      targetSubStep?: number;
      targetFlow?: string;
    }>;
  };
}

interface NavigationTarget {
  step?: number;
  subStep?: number;
  module?: string;
  flow?: string;
}

interface FileUploadComponentProps {
  value: File | null;
  onChange: (file: File | null) => void;
}



const AssessmentComponent = React.memo(({ 
  primaryColor,
  onNext,
  assessmentConfig
}: {
  primaryColor: string;
  onNext?: () => void;
  assessmentConfig?: {
    screens: Array<{
      id: string;
      type: 'welcome' | 'best-worst' | 'agree-scale' | 'single-select' | 'language-reading' | 'language-listening' | 'language-typing';
      title: string;
      content: {
        welcomeTitle?: string;
        welcomeDescription?: string;
        welcomeImage?: string;
        scenarioTitle?: string;
        scenarioDescription?: string;
        scenarioImage?: string;
        scenarioResponses?: string[];
        instructionText?: string;
        agreementTitle?: string;
        agreementStatement?: string;
        scaleLabels?: {
          left: string;
          right: string;
        };
        singleSelectTitle?: string;
        singleSelectQuestion?: string;
        singleSelectDescription?: string;
        singleSelectOptions?: string[];
        languageReadingTitle?: string;
        languageReadingQuestion?: string;
        languageReadingDescription?: string;
        languageReadingOptions?: string[];
        languageListeningTitle?: string;
        languageListeningQuestion?: string;
        languageListeningDescription?: string;
        languageListeningOptions?: string[];
        languageTypingTitle?: string;
        languageTypingQuestion?: string;
        languageTypingText?: string;
      };
    }>;
  };
}) => {
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [scenarioAnswers, setScenarioAnswers] = useState<Array<{
    questionId: string;
    bestResponse: string;
    worstResponse: string;
  }>>([]);
  const [agreementAnswers, setAgreementAnswers] = useState<Array<{
    questionId: string;
    rating: number;
  }>>([]);
  const [mathAnswers, setMathAnswers] = useState<Array<{
    questionId: string;
    answer: string;
  }>>([]);

  // Use assessmentConfig screens or fallback to default screens
  const screens = assessmentConfig?.screens || [
    {
      id: 'welcome-1',
      type: 'welcome' as const,
      title: 'Welcome Screen',
      content: {
        welcomeTitle: 'Welcome to the assessment!',
        welcomeDescription: 'You will choose the most suitable and least suitable response for each scenario.',
        welcomeImage: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800'
      }
    },
    {
      id: 'best-worst-1',
      type: 'best-worst' as const,
      title: 'Best/Worst Response',
      content: {
        scenarioTitle: 'Scenario Question',
        scenarioDescription: 'A customer approaches you with a complaint about a product they purchased last week.',
        scenarioImage: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800',
        scenarioResponses: [
          'Listen to their concern and offer a full refund',
          'Ask them to provide a receipt before helping',
          'Explain the return policy and suggest alternatives',
          'Refer them to customer service'
        ],
        instructionText: 'Select the ✔ next to the response you feel is the best response. Then, select the ✘ next to the response you feel is the worst response.'
      }
    },
    {
      id: 'agree-scale-1',
      type: 'agree-scale' as const,
      title: 'Agreement Scale',
      content: {
        agreementTitle: 'Do you agree with the statement below?',
        agreementStatement: 'I believe that customer satisfaction is the most important aspect of our business.',
        scaleLabels: {
          left: 'Strongly disagree',
          right: 'Strongly agree'
        }
      }
    },
    {
      id: 'single-select-1',
      type: 'single-select' as const,
      title: 'Single Select Question',
      content: {
        singleSelectTitle: 'Math Question',
        singleSelectQuestion: 'What is 15% of $2,000?',
        singleSelectDescription: 'Choose the correct answer from the options below.',
        singleSelectOptions: ['$300', '$350', '$400', '$450']
      }
    }
  ];

  const handleScenarioAnswer = (questionId: string, type: 'best' | 'worst', responseIndex: number) => {
    const updatedAnswers = [...scenarioAnswers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === questionId);
    
    if (existingIndex >= 0) {
      const currentAnswer = updatedAnswers[existingIndex];
      
      if (type === 'best' && currentAnswer.bestResponse === responseIndex.toString()) {
        currentAnswer.bestResponse = '';
      } else if (type === 'worst' && currentAnswer.worstResponse === responseIndex.toString()) {
        currentAnswer.worstResponse = '';
      } else {
        if (type === 'best') {
          if (currentAnswer.worstResponse === responseIndex.toString()) {
            currentAnswer.worstResponse = '';
          }
          currentAnswer.bestResponse = responseIndex.toString();
        } else {
          if (currentAnswer.bestResponse === responseIndex.toString()) {
            currentAnswer.bestResponse = '';
          }
          currentAnswer.worstResponse = responseIndex.toString();
        }
      }
    } else {
      updatedAnswers.push({
        questionId,
        bestResponse: type === 'best' ? responseIndex.toString() : '',
        worstResponse: type === 'worst' ? responseIndex.toString() : ''
      });
    }
    
    setScenarioAnswers(updatedAnswers);
  };

  const handleAgreementAnswer = (questionId: string, rating: number) => {
    const updatedAnswers = [...agreementAnswers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === questionId);
    
    if (existingIndex >= 0) {
      updatedAnswers[existingIndex].rating = rating;
    } else {
      updatedAnswers.push({ questionId, rating });
    }
    
    setAgreementAnswers(updatedAnswers);
  };

  const handleMathAnswer = (questionId: string, answer: string) => {
    const updatedAnswers = [...mathAnswers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === questionId);
    
    if (existingIndex >= 0) {
      updatedAnswers[existingIndex].answer = answer;
    } else {
      updatedAnswers.push({ questionId, answer });
    }
    
    setMathAnswers(updatedAnswers);
  };

  const getScenarioAnswer = (questionId: string) => {
    return scenarioAnswers.find(a => a.questionId === questionId);
  };

  const getAgreementAnswer = (questionId: string) => {
    return agreementAnswers.find(a => a.questionId === questionId);
  };

  const getMathAnswer = (questionId: string) => {
    return mathAnswers.find(a => a.questionId === questionId);
  };

  const getSizeClasses = (rating: number) => {
    switch (rating) {
      case 1: return 'w-[72px] h-[72px]';
      case 2: return 'w-14 h-14';
      case 3: return 'w-8 h-8';
      case 4: return 'w-14 h-14';
      case 5: return 'w-[72px] h-[72px]';
      default: return 'w-8 h-8';
    }
  };

  const renderIntroStep = () => {
    const currentScreen = screens[currentSubStep];
    if (!currentScreen || currentScreen.type !== 'welcome') return null;

    return (
      <div className="w-full bg-white flex items-center justify-center m-0 p-0" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full max-w-6xl mx-auto px-6 md:px-8 lg:px-12">
          <div>
            <img
              src={currentScreen.content.welcomeImage || "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800"}
              alt="Assessment welcome"
              className="w-full h-auto max-h-[500px] object-contain rounded-lg"
            />
          </div>
          <div>
            <h2 className="text-[28px] font-semibold text-[#353B46] mb-6">
              {currentScreen.content.welcomeTitle || 'Welcome to the assessment!'}
            </h2>
            
            <div className="space-y-4 text-[16px] text-[#464F5E] leading-relaxed">
              <p className="whitespace-pre-line">{currentScreen.content.welcomeDescription || 'You will choose the most suitable and least suitable response for each scenario.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderScenarioStep = () => {
    const currentScreen = screens[currentSubStep];
    if (!currentScreen || currentScreen.type !== 'best-worst') return null;

    const answer = getScenarioAnswer(currentScreen.id);
    
    return (
      <div className="w-full bg-white m-0 p-0 overflow-x-hidden" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full m-0 p-0" style={{ minHeight: 'calc(100vh - 140px)' }}>
          <div className="px-8 md:px-12 lg:px-16 py-8 md:py-12 flex flex-col justify-center w-full">
            <h2 className="text-[20px] font-medium text-[#353B46] mb-4">
              {currentScreen.content.scenarioTitle || 'Scenario Question'}
            </h2>
            <img
              src={currentScreen.content.scenarioImage || "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800"}
              alt="Scenario"
              className="w-full h-auto rounded-lg mb-4"
            />
            <p className="text-[16px] text-[#464F5E] leading-relaxed whitespace-pre-line">
              {currentScreen.content.scenarioDescription || 'A customer approaches you with a complaint about a product they purchased last week.'}
            </p>
          </div>
          
          <div className="px-8 md:px-12 lg:px-16 py-8 md:py-12 flex flex-col justify-center w-full bg-[#F8F9FB]">
            <div>
              <p className="text-[14px] text-[#637085] leading-relaxed whitespace-pre-line">
                {currentScreen.content.instructionText || 'Select the ✔ next to the response you feel is the best response. Then, select the ✘ next to the response you feel is the worst response. You must select one ✔and one ✘ to advance to the next question.'}
              </p>
            </div>
            
            <div className="space-y-4 mt-6">
              {(currentScreen.content.scenarioResponses || []).map((response, index) => (
                <div key={index} className="border border-gray-200 bg-white rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <p className="text-[16px] text-[#464F5E] flex-1 pr-4 whitespace-pre-line">{response}</p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleScenarioAnswer(currentScreen.id, 'best', index)}
                        className={`
                          w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-200
                          ${answer?.bestResponse === index.toString()
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'border-gray-300 hover:border-green-400'
                          }
                        `}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleScenarioAnswer(currentScreen.id, 'worst', index)}
                        className={`
                          w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-200
                          ${answer?.worstResponse === index.toString()
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'border-gray-300 hover:border-red-400'
                          }
                        `}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAgreementStep = () => {
    const currentScreen = screens[currentSubStep];
    if (!currentScreen || currentScreen.type !== 'agree-scale') return null;

    const answer = getAgreementAnswer(currentScreen.id);
    
    return (
      <div className="w-full bg-white m-0 p-0 overflow-x-hidden" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full m-0 p-0" style={{ minHeight: 'calc(100vh - 140px)' }}>
          <div className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-8 md:py-12 w-full">
            <h2 className="text-[20px] font-medium text-[#353B46] mb-8">
              {currentScreen.content.agreementTitle || 'Do you agree with the statement below?'}
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-[18px] text-[#353B46] font-medium leading-relaxed whitespace-pre-line">
                {currentScreen.content.agreementStatement || 'I believe that customer satisfaction is the most important aspect of our business.'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col justify-center px-6 md:px-8 lg:px-12 py-8 md:py-12 w-full" style={{ backgroundColor: '#F8F9FB' }}>
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleAgreementAnswer(currentScreen.id, rating)}
                  className={`
                    ${getSizeClasses(rating)} rounded-full border-2 transition-all duration-200 flex items-center justify-center
                    ${answer?.rating === rating
                      ? ''
                      : 'border-gray-400 hover:border-gray-500'
                    }
                  `}
                  style={{
                    backgroundColor: answer?.rating === rating ? 'white' : 'transparent',
                    borderColor: answer?.rating === rating ? primaryColor : '#9CA3AF'
                  }}
                >
                  {answer?.rating === rating && (
                    <Check 
                      className={
                        rating === 1 || rating === 5 ? 'w-6 h-6' :
                        rating === 2 || rating === 4 ? 'w-5 h-5' :
                        'w-4 h-4'
                      }
                      style={{ color: primaryColor }}
                    />
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between text-[14px] text-[#637085]">
              <span>{currentScreen.content.scaleLabels?.left || 'Strongly disagree'}</span>
              <span>{currentScreen.content.scaleLabels?.right || 'Strongly agree'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMathStep = () => {
    const currentScreen = screens[currentSubStep];
    if (!currentScreen || currentScreen.type !== 'single-select') return null;

    const answer = getMathAnswer(currentScreen.id);
    
    return (
      <div className="w-full bg-white m-0 p-0 overflow-x-hidden" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full m-0 p-0" style={{ minHeight: 'calc(100vh - 140px)' }}>
          <div className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-8 md:py-12 w-full">
            <h2 className="text-[20px] font-medium text-[#353B46] mb-4">
              {currentScreen.content.singleSelectTitle || 'Math Question'}
            </h2>
            <p className="text-[16px] text-[#464F5E] mb-6">
              {currentScreen.content.singleSelectQuestion || 'What is 15% of $2,000?'}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-[16px] text-[#353B46] text-center leading-relaxed whitespace-pre-line">
                {currentScreen.content.singleSelectDescription || 'Choose the correct answer from the options below.'}
              </p>
            </div>
          </div>
          
          <div 
            className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-8 md:py-12 w-full"
            style={{ backgroundColor: '#F8F9FB' }}
          >
            <div className="space-y-3">
              {(currentScreen.content.singleSelectOptions || []).map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleMathAnswer(currentScreen.id, option)}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all duration-200 bg-white
                    ${answer?.answer === option
                      ? ''
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  style={{
                    borderColor: answer?.answer === option ? primaryColor : undefined,
                    color: answer?.answer === option ? primaryColor : '#464F5E'
                  }}
                >
                  <span className="text-[16px] font-medium">{option}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLanguageReadingStep = () => {
    const currentScreen = screens[currentSubStep];
    if (!currentScreen || currentScreen.type !== 'language-reading') return null;

    const answer = getMathAnswer(currentScreen.id);
    
    return (
      <div className="w-full bg-white m-0 p-0 overflow-x-hidden" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full m-0 p-0" style={{ minHeight: 'calc(100vh - 140px)' }}>
          <div className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-8 md:py-12 w-full">
            <h2 className="text-[20px] font-medium text-[#353B46] mb-4">
              {currentScreen.content.languageReadingTitle || 'Reading Question'}
            </h2>
            <p className="text-[16px] text-[#464F5E] mb-6">
              {currentScreen.content.languageReadingQuestion || 'Read the passage and answer the question.'}
            </p>
            
            <div className="mb-6">
              <p className="text-[16px] text-[#353B46] text-left leading-relaxed whitespace-pre-line">
                {currentScreen.content.languageReadingDescription || 'Select the correct answer from the options below.'}
              </p>
            </div>
          </div>
          
          <div 
            className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-8 md:py-12 w-full"
            style={{ backgroundColor: '#F8F9FB' }}
          >
            <div className="space-y-3">
              {(currentScreen.content.languageReadingOptions || []).map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleMathAnswer(currentScreen.id, option)}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all duration-200 bg-white
                    ${answer?.answer === option
                      ? ''
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  style={{
                    borderColor: answer?.answer === option ? primaryColor : undefined,
                    color: answer?.answer === option ? primaryColor : '#464F5E'
                  }}
                >
                  <span className="text-[16px] font-medium">{option}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLanguageListeningStep = () => {
    const currentScreen = screens[currentSubStep];
    if (!currentScreen || currentScreen.type !== 'language-listening') return null;

    const answer = getMathAnswer(currentScreen.id);
    
    return (
      <div className="w-full bg-white m-0 p-0 overflow-x-hidden" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full m-0 p-0" style={{ minHeight: 'calc(100vh - 140px)' }}>
          <div className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-8 md:py-12 w-full">
            <h2 className="text-[20px] font-medium text-[#353B46] mb-4">
              {currentScreen.content.languageListeningTitle || 'Listening Question'}
            </h2>
            <p className="text-[16px] text-[#464F5E] mb-6">
              {currentScreen.content.languageListeningQuestion || 'Listen to the audio and answer the question.'}
            </p>
            
            {/* Audio Player Image - Not editable */}
            <div className="mb-6">
              <img 
                src="/audio-player.png" 
                alt="Audio player"
                className="w-full h-auto"
              />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-[16px] text-[#353B46] text-center leading-relaxed whitespace-pre-line">
                {currentScreen.content.languageListeningDescription || 'Choose the correct answer from the options below.'}
              </p>
            </div>
          </div>
          
          <div 
            className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-8 md:py-12 w-full"
            style={{ backgroundColor: '#F8F9FB' }}
          >
            <div className="space-y-3">
              {(currentScreen.content.languageListeningOptions || []).map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleMathAnswer(currentScreen.id, option)}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all duration-200 bg-white
                    ${answer?.answer === option
                      ? ''
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  style={{
                    borderColor: answer?.answer === option ? primaryColor : undefined,
                    color: answer?.answer === option ? primaryColor : '#464F5E'
                  }}
                >
                  <span className="text-[16px] font-medium">{option}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLanguageTypingStep = () => {
    const currentScreen = screens[currentSubStep];
    if (!currentScreen || currentScreen.type !== 'language-typing') return null;

    const answer = getMathAnswer(currentScreen.id);
    
    return (
      <div className="w-full bg-white m-0 p-0 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col px-8 md:px-12 lg:px-16 py-8 md:py-12 w-full max-w-5xl mx-auto mb-20">
          <h2 className="text-[18px] font-medium text-[#353B46] mb-1">
            {currentScreen.content.languageTypingTitle || 'Typing Test'}
          </h2>
          <p className="text-[14px] text-[#464F5E] mb-6">
            {currentScreen.content.languageTypingQuestion || 'Type the following text in the box below as accurately and quickly as possible.'}
          </p>
          
          {/* Text to type - displayed at the top */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-[16px] text-[#353B46] leading-relaxed whitespace-pre-line">
              {currentScreen.content.languageTypingText || 'Sample text to type...'}
            </p>
          </div>

          {/* Typing textarea */}
          <textarea
            value={answer?.answer || ''}
            onChange={(e) => handleMathAnswer(currentScreen.id, e.target.value)}
            placeholder="Start typing here..."
            rows={12}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-vertical text-[16px]"
            style={{
              borderColor: answer?.answer ? primaryColor : undefined,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = primaryColor;
              e.target.style.boxShadow = `0 0 0 3px ${primaryColor}33`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = answer?.answer ? primaryColor : '#D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>
    );
  };

  const renderCurrentSubStep = () => {
    const currentScreen = screens[currentSubStep];
    if (!currentScreen) return renderIntroStep();

    switch (currentScreen.type) {
      case 'welcome':
        return renderIntroStep();
      case 'best-worst':
        return renderScenarioStep();
      case 'agree-scale':
        return renderAgreementStep();
      case 'single-select':
        return renderMathStep();
      case 'language-reading':
        return renderLanguageReadingStep();
      case 'language-listening':
        return renderLanguageListeningStep();
      case 'language-typing':
        return renderLanguageTypingStep();
      default:
        return renderIntroStep();
    }
  };

  const getSubStepTitle = (step: number) => {
    const currentScreen = screens[step];
    if (!currentScreen) return '';

    if (step === 0) {
      return 'Introduction';
    }

    const questionScreens = screens.filter(screen => 
      screen.type === 'best-worst' || screen.type === 'agree-scale' || screen.type === 'single-select' || screen.type === 'language-reading' || screen.type === 'language-listening' || screen.type === 'language-typing'
    );
    const questionIndex = questionScreens.findIndex(screen => screen.id === currentScreen.id);
    
    if (questionIndex >= 0) {
      return `Question ${questionIndex + 1} of ${questionScreens.length}`;
    }

    return currentScreen.title;
  };

  return (
    <div className="w-full m-0 p-0 overflow-x-hidden bg-white">
      {renderCurrentSubStep()}
      
      {/* Assessment Navigation */}
      <div className="fixed bottom-0 left-0 right-0 w-full pb-4  bg-white z-50">
        {/* Progress Bar */}
        {currentSubStep > 0 && (
          <div className="w-full px-0 pb-4">
            <div className="flex w-full gap-2">
              {screens.filter(screen => 
                screen.type === 'best-worst' || screen.type === 'agree-scale' || screen.type === 'single-select' || screen.type === 'language-reading' || screen.type === 'language-listening' || screen.type === 'language-typing'
              ).map((screen) => {
                const screenIndex = screens.findIndex(s => s.id === screen.id);
                return (
                  <div
                    key={screen.id}
                    className="h-1 rounded-full transition-all duration-300 flex-1"
                    style={{
                      backgroundColor: currentSubStep > screenIndex ? primaryColor : '#E5E7EB',
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
        
        <div className="flex items-center px-6 justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-[12px] md:text-[14px] text-[#637085]">
              Assessment | {getSubStepTitle(currentSubStep)}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {currentSubStep > 0 && (
             <div className="flex items-center space-x-2 mr-2">
             <div className="flex items-center space-x-2">
               <div className="relative inline-block w-[44px] h-[24px]">
                 <input
                   type="checkbox"
                   className="sr-only peer"
                   id="autoAdvance"
                 />
                 <label
                   htmlFor="autoAdvance"
                   className="block w-[44px] h-[24px] bg-gray-300 rounded-full cursor-pointer transition-colors duration-200"
                 >
                   <div className="w-[20px] h-[20px] bg-white rounded-full shadow-md transform transition-transform duration-200 translate-x-[2px] translate-y-[2px] peer-checked:translate-x-[22px]" />
                 </label>
               </div>
               <span className="text-[12px] md:text-[14px] text-[#353B46]">Auto Advance</span>
               <Info className="w-4 h-4 text-gray-500" />
             </div>
           </div>
           
            )}
            
            {currentSubStep > 0 && (
            <button
  onClick={() => setCurrentSubStep(Math.max(0, currentSubStep - 1))}
  className="flex items-center space-x-2 px-6 py-2.5 text-[#353B46] border border-gray-300 rounded-[10px] hover:bg-gray-50 transition-colors duration-200 text-sm md:text-base"
>
  <ArrowLeft className="w-4 h-4" />
  <span>Previous</span>
</button>

            )}
            
            {currentSubStep === 0 && (
  <div className="flex items-center space-x-2">
    <span className="text-[12px] md:text-[14px] text-[#637085]">Language:</span>
    <div className="relative">
      <select 
        className="h-[32px] pl-3 pr-8 text-[12px] md:text-[14px] text-[#353B46] border border-[#8C95A8] rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
        defaultValue="english"
      >
        <option value="english">English</option>
      </select>
      
      <ChevronDown 
        size={16} 
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#353B46] pointer-events-none" 
      />
    </div>

  </div>
)}

            
           <button
  onClick={() => {
    console.log('Complete button clicked in GenericModuleRenderer!');
    if (currentSubStep < screens.length - 1) {
      setCurrentSubStep(currentSubStep + 1);
    } else {
      console.log('Assessment complete - final step reached');
      if (onNext) {
        console.log('Calling parent onNext function');
        onNext();
      } else {
        console.log('ERROR: onNext function not provided to GenericModuleRenderer');
      }
    }
  }}
  data-complete-button
  className="flex items-center space-x-2 px-6 py-2.5 rounded-[10px] transition-all duration-200 text-white text-sm md:text-base"
  style={{ backgroundColor: primaryColor }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = `${primaryColor}CC`;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = primaryColor;
  }}
>
  <span>
    {currentSubStep === 0 
      ? 'Start' 
      : currentSubStep === screens.length - 1 
        ? 'Complete' 
        : 'Next'}
  </span>
  <ArrowRight className="w-4 h-4" />
</button>

          </div>
        </div>
      </div>
    </div>
  );
});

const InterviewSchedulerComponent = React.memo(({ primaryColor }: { primaryColor: string }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [timezone, setTimezone] = useState('UTC+05:30');

  const TIMEZONES = [
    { value: 'UTC+05:30', label: '(UTC + 05:30) Asia / Calcutta' },
    { value: 'UTC-08:00', label: '(UTC - 08:00) America / Los_Angeles' },
    { value: 'UTC-05:00', label: '(UTC - 05:00) America / New_York' },
    { value: 'UTC+00:00', label: '(UTC + 00:00) Europe / London' },
  ];

  const TIME_SLOTS = [
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
  ];

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday (0) to be last (6)
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    try {
      console.log('Navigating month:', direction, 'Current month:', currentMonth, 'Current year:', currentYear);
      
      if (direction === 'prev') {
        if (currentMonth === 0) {
          console.log('Setting to December of previous year');
          setCurrentMonth(11);
          setCurrentYear(currentYear - 1);
        } else {
          console.log('Setting to previous month');
          setCurrentMonth(currentMonth - 1);
        }
      } else {
        if (currentMonth === 11) {
          console.log('Setting to January of next year');
          setCurrentMonth(0);
          setCurrentYear(currentYear + 1);
        } else {
          console.log('Setting to next month');
          setCurrentMonth(currentMonth + 1);
        }
      }
      
      console.log('New values will be - Month:', direction === 'prev' ? (currentMonth === 0 ? 11 : currentMonth - 1) : (currentMonth === 11 ? 0 : currentMonth + 1), 'Year:', direction === 'prev' ? (currentMonth === 0 ? currentYear - 1 : currentYear) : (currentMonth === 11 ? currentYear + 1 : currentYear));
    } catch (error) {
      console.error('Error in navigateMonth:', error);
    }
  };

  const isDateSelected = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedDate === dateStr;
  };

  const isDateAvailable = (day: number) => {
    try {
      // Check if the date falls on Saturday or Sunday
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Exclude weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return false;
      }
      
      // Simple approach: make Monday and Wednesday unavailable for odd weeks, Tuesday and Thursday for even weeks
      const weekOfMonth = Math.floor((day - 1) / 7);
      const isOddWeek = weekOfMonth % 2 === 0;
      
      if (isOddWeek) {
        // Odd weeks: Monday (1) and Wednesday (3) unavailable
        return dayOfWeek !== 1 && dayOfWeek !== 3;
      } else {
        // Even weeks: Tuesday (2) and Thursday (4) unavailable
        return dayOfWeek !== 2 && dayOfWeek !== 4;
      }
    } catch (error) {
      console.error('Error in isDateAvailable:', error, { day, currentMonth, currentYear });
      return false; // Default to unavailable if there's an error
    }
  };

  const selectDate = (day: number) => {
    if (!isDateAvailable(day)) return;
    
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const renderCalendar = () => {
    try {
      console.log('Rendering calendar for month:', currentMonth, 'year:', currentYear);
      
      const daysInMonth = getDaysInMonth(currentMonth, currentYear);
      const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
      const days = [];

      console.log('Days in month:', daysInMonth, 'First day:', firstDay);

      // Empty cells for days before the first day of the month
      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="w-12 h-12"></div>);
      }

      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        try {
          const isSelected = isDateSelected(day);
          const isAvailable = isDateAvailable(day);
          
          days.push(
            <button
              key={day}
              onClick={() => selectDate(day)}
              disabled={!isAvailable}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                ${isSelected
                  ? 'border-2 text-gray-700'
                  : isAvailable
                  ? 'border border-[#D1D5DC] text-gray-700 hover:bg-gray-100'
                  : 'text-gray-700 cursor-not-allowed'
                }
              `}
              style={{
                borderColor: isSelected ? primaryColor : undefined
              }}
            >
              {day}
            </button>
          );
        } catch (dayError) {
          console.error('Error rendering day:', day, dayError);
          // Add a placeholder for the problematic day
          days.push(
            <div key={day} className="w-12 h-12 flex items-center justify-center text-red-500">
              !
            </div>
          );
        }
      }

      return days;
    } catch (error) {
      console.error('Error in renderCalendar:', error, { currentMonth, currentYear });
      return [<div key="error" className="col-span-7 text-red-500">Error rendering calendar</div>];
    }
  };

  return (
    <div className="w-full">
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Calendar */}
          <div className="space-y-6">
            {/* Timezone and Duration */}
            <div className="flex items-center justify-between w-full">
  <div className="relative w-full">
    <select
      value={timezone}
      onChange={(e) => setTimezone(e.target.value)}
      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
    >
      {TIMEZONES.map((tz) => (
        <option key={tz.value} value={tz.value}>
          {tz.label}
        </option>
      ))}
    </select>
    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
</div>


            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {MONTHS[currentMonth]} {currentYear}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-lg p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((day) => (
                  <div key={day} className="w-12 h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </div>
          </div>

          {/* Right side - Time slots */}
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Meeting duration | 60 min
            </div>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {TIME_SLOTS.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  style={{
                    borderColor: isSelected ? primaryColor : '#D1D5DB',
                    color: '#374151'
                  }}
                  className={`
                    w-full px-4 py-3 rounded-lg border text-left transition-all duration-200
                    ${isSelected ? 'border-2' : 'hover:border-gray-400 hover:bg-gray-50'}
                  `}
                >
                  {time}
                </button>
                
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const FileUploadComponent = React.memo(({ value, onChange }: FileUploadComponentProps) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onChange(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onChange(file);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
      'text/html',
      'image/png',
      'image/jpeg'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid file format (.pdf, .doc, .docx, .txt, .rtf, .html, .png, .jpg)');
      return false;
    }
    
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return false;
    }
    
    return true;
  };

  const removeFile = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
        ${dragActive 
          ? 'border-blue-400 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
        }
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt,.rtf,.html,.png,.jpg,.jpeg"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      {value ? (
        <div className="flex items-center justify-center space-x-3">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
            <span className="text-[14px] text-[#464F5E]">{value.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="text-gray-500 hover:text-red-500 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          <p className="text-[14px] text-[#464F5E] mb-2">
            Drop file here or <span 
              className="font-medium cursor-pointer text-[#464F5E]"
              
            >
              select a file to upload
            </span>
          </p>
        </div>
      )}
    </div>
  );
});

export default function GenericModuleRenderer({ template, primaryColor, onNext, onNavigate, moduleOverrides }: GenericModuleRendererProps) {
  
  // Handle Thank You screen separately
  if (template.component === 'ThankYouStep') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-[#353B46] mb-6 text-center">
            {template.content.title || 'Thank you! 🎉'}
          </h2>
          <p className="text-[18px] text-[#464F5E] mb-8 whitespace-pre-line text-center">
            {template.content.subtitle || 'We received your submission and will get back to you as soon as possible.\nGood luck!'}
          </p>
          
        </div>
      </div>
    );
  }

  // Single state object to manage all form data
  const [formData, setFormData] = useState<Record<string, any>>({});

  const updateFormData = (questionId: string, value: any) => {
    setFormData(prev => ({ ...prev, [questionId]: value }));
  };

  const renderQuestion = (question: any, onNext?: () => void) => {
    const value = formData[question.id] || '';

    switch (question.type) {
      case 'text':
        return (
          <input
            key={question.id}
            type="text"
            placeholder={` ${question.text}`}
            value={value}
            onChange={(e) => updateFormData(question.id, e.target.value)}
            className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onFocus={(e) => {
              e.target.style.borderColor = primaryColor;
              e.target.style.boxShadow = `0 0 0 3px ${primaryColor}33`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
          />
        );

      case 'textarea':
        return (
          <textarea
            key={question.id}
            placeholder={` ${question.text}`}
            value={value}
            onChange={(e) => updateFormData(question.id, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-vertical"
            onFocus={(e) => {
              e.target.style.borderColor = primaryColor;
              e.target.style.boxShadow = `0 0 0 3px ${primaryColor}33`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
          />
        );

      case 'select':
        return (
          <div key={question.id} className="relative">
            <select 
              value={value}
              onChange={(e) => updateFormData(question.id, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
              onFocus={(e) => {
                e.target.style.borderColor = primaryColor;
                e.target.style.boxShadow = `0 0 0 3px ${primaryColor}33`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">Select an option</option>
              {question.options?.map((option: string, optIndex: number) => (
                <option key={optIndex} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
              <svg
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 011.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        );

      case 'radio':
        return (
          <div key={question.id} className={question.layout === 'horizontal' ? "flex flex-wrap gap-6" : "space-y-3"}>
            {question.options?.map((option: string, optIndex: number) => {
              const isSelected = value === option;
              return (
                <div key={optIndex} className="flex items-center">
                  <div 
                    onClick={() => updateFormData(question.id, option)}
                    className="relative flex items-center justify-center cursor-pointer"
                  >
                    <div 
                      className={`
                        w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                        ${isSelected
                          ? 'text-white'
                          : 'border-gray-300 bg-white'
                        }
                      `}
                      style={{
                        backgroundColor: isSelected ? primaryColor : undefined,
                        borderColor: isSelected ? primaryColor : undefined
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = `${primaryColor}66`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#D1D5DB';
                      }}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-[16px] text-[#464F5E]">{option}</span>
                </div>
              );
            })}
          </div>
        );

      case 'checkbox':
        if (question.options) {
          const selectedOptions = Array.isArray(value) ? value : [];
          return (
            <div key={question.id} className="space-y-3">
              {question.options.map((option: string, optIndex: number) => {
                const isChecked = selectedOptions.includes(option);
                return (
                  <div key={optIndex} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`${question.id}_${optIndex}`}
                      name={question.id}
                      value={option}
                      checked={isChecked}
                      onChange={(e) => {
                        const newSelected = e.target.checked
                          ? [...selectedOptions, option]
                          : selectedOptions.filter((item: string) => item !== option);
                        updateFormData(question.id, newSelected);
                      }}
                      className="w-[18px] h-[18px] border-gray-300 rounded focus:ring-2"
                      style={{
                        accentColor: primaryColor
                      }}
                      onFocus={(e) => {
                        e.target.style.boxShadow = `0 0 0 2px ${primaryColor}33`;
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <label htmlFor={`${question.id}_${optIndex}`} className="ml-3 text-[16px] text-[#464F5E] cursor-pointer">
                      {option}
                    </label>
                  </div>
                );
              })}
            </div>
          );
        } else {
          const isChecked = Boolean(value);
          return (
            <div key={question.id} className="flex items-center">
              <input
                type="checkbox"
                id={question.id}
                name={question.id}
                checked={isChecked}
                onChange={(e) => updateFormData(question.id, e.target.checked)}
                className="w-[18px] h-[18px] border-gray-300 rounded focus:ring-2"
                style={{
                  accentColor: primaryColor
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = `0 0 0 2px ${primaryColor}33`;
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                }}
              />
              <label htmlFor={question.id} className="ml-3 text-[16px] text-[#464F5E] cursor-pointer">
                {question.text}
              </label>
            </div>
          );
        }

      case 'phone':
        const phoneData = value || { countryCode: '+1', number: '' };
        return (
          <div key={question.id} className="flex space-x-2">
            <div className="relative w-32">
              <select
                value={phoneData.countryCode}
                onChange={(e) => updateFormData(question.id, { ...phoneData, countryCode: e.target.value })}
                className="appearance-none w-full text-[14px] text-[#464F5E] border border-gray-300 rounded-[10px] py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onFocus={(e) => {
                  e.target.style.borderColor = primaryColor;
                  e.target.style.boxShadow = `0 0 0 3px ${primaryColor}33`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+33">🇫🇷 +33</option>
                <option value="+49">🇩🇪 +49</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 011.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <input
              type="tel"
              placeholder="Type phone number"
              value={phoneData.number}
              onChange={(e) => updateFormData(question.id, { ...phoneData, number: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onFocus={(e) => {
                e.target.style.borderColor = primaryColor;
                e.target.style.boxShadow = `0 0 0 3px ${primaryColor}33`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        );

      case 'file':
        return (
          <FileUploadComponent
            key={question.id}
            value={value}
            onChange={(file) => updateFormData(question.id, file)}
          />
        );

      case 'image':
        if (question.content) {
          return (
            <div key={question.id} className="w-full">
              <img 
                src={question.content} 
                alt="Element image" 
                className="w-[500px] h-auto rounded-lg border border-gray-200"
              />
            </div>
          );
        }
        return null;

      case 'assessment':
        return (
          <AssessmentComponent
            key={question.id}
            primaryColor={primaryColor}
            onNext={onNext}
            assessmentConfig={question.assessmentConfig}
          />
        );

      case 'interview-scheduler':
        return (
          <InterviewSchedulerComponent 
            primaryColor={primaryColor}
          />
        );

      case 'video-interview':
        return (
          <VideoInterviewStep
            key={question.id}
            data={{}}
            onUpdate={() => {}}
            onValidate={() => {}}
            primaryColor={primaryColor}
            onNext={onNext || (() => {})}
            template={template}
          />
        );

      case 'message':
        return (
          <div 
            className="w-full py-3"
            style={{ color: '#464F5E' }}
            dangerouslySetInnerHTML={{
              __html: (question.content || '')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>')
            }}
          />
        );

      default:
        console.warn('Unknown element type:', question.type, question);
        return null;
    }
  };

  const questions = template.content.questions || [];
  const elements: JSX.Element[] = [];
  let i = 0;

  while (i < questions.length) {
    const question = questions[i];
    const nextQuestion = questions[i + 1];
    
    // Check if current and next questions are both half-width text/select
    const isCurrentHalfWidth = question.halfWidth && (question.type === 'text' || question.type === 'select');
    const isNextHalfWidth = nextQuestion?.halfWidth && (nextQuestion.type === 'text' || nextQuestion.type === 'select');
    
    if (isCurrentHalfWidth && isNextHalfWidth) {
      // Render two half-width inputs in one row
      elements.push(
        <div key={`${question.id}-${nextQuestion.id}`} className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {question.type !== 'image' && question.type !== 'assessment' && (
              <label className="block text-[14px] text-[#464F5E] mb-2">
                {question.text}
                {question.required && <span className="text-red-500 ml-1"></span>}
              </label>
            )}
            {renderQuestion(question, onNext)}
          </div>
          <div className="space-y-2">
            {nextQuestion.type !== 'image' && nextQuestion.type !== 'assessment' && (
              <label className="block text-[14px] text-[#464F5E] mb-2">
                {nextQuestion.text}
                {nextQuestion.required && <span className="text-red-500 ml-1"></span>}
              </label>
            )}
            {renderQuestion(nextQuestion, onNext)}
          </div>
        </div>
      );
      i += 2; // Skip next question since we processed it
    } else {
      // Render single question (full width or half width but no consecutive half)
      elements.push(
        <div key={question.id} className="space-y-2">
          {question.type !== 'checkbox' && question.type !== 'message' && question.type !== 'image' && question.type !== 'assessment' && question.type !== 'video-interview' && (
            <label className="block text-[14px] text-[#464F5E] mb-2">
              {question.text}
              {question.required && <span className="text-red-500 ml-1"></span>}
            </label>
          )}
          
          <div className={question.halfWidth && (question.type === 'text' || question.type === 'select') ? "w-1/2" : "w-full"}>
            {renderQuestion(question, onNext)}
          </div>
        </div>
      );
      i += 1;
    }
  }

  // MultibuttonModule component
  if (template.component === 'MultibuttonModule') {
    const buttons = moduleOverrides?.customButtons || (template.content as any)?.customButtons || [
      { id: 'button1', label: 'Button 1', isPrimary: true },
      { id: 'button2', label: 'Button 2', isPrimary: false }
    ];
    
    return (
      <div className="w-full">
        <div className="mb-8">
          {template.content.title && (
            <h2 className={`text-[18px] font-semibold text-[#353B46] mb-1 ${template.content.centerTitle ? 'text-center' : ''}`}>
              {template.content.title}
            </h2>
          )}
          {template.content.subtitle && (
            <p className={`text-[14px] text-[#464F5E] mb-6 ${template.content.centerTitle ? 'text-center' : ''}`}>
              {template.content.subtitle}
            </p>
          )}
          
          {/* Render Questions/Elements */}
          {template.content.questions && template.content.questions.length > 0 && (
            <div className="space-y-6">
              {template.content.questions.map((question: any) => (
                <div key={question.id}>
                  {renderQuestion(question, onNext)}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Custom Footer Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="mx-auto flex justify-end items-center space-x-3">
            {buttons.map((button: { id: string; label: string; isPrimary: boolean; targetModule?: string; targetStep?: number; targetSubStep?: number; targetFlow?: string }) => (
              <button
                key={button.id}
                onClick={() => {
                  // Handle custom navigation if configured
                  if (onNavigate && (button.targetModule || button.targetStep !== undefined || button.targetFlow)) {
                    onNavigate({
                      module: button.targetModule,
                      step: button.targetStep,
                      subStep: button.targetSubStep,
                      flow: button.targetFlow
                    });
                  } else if (onNext) {
                    // Fallback to default next behavior
                    onNext();
                  }
                }}
                className={`
                  flex items-center space-x-2 px-6 py-2.5 rounded-[10px] transition-all duration-200 text-sm md:text-base
                  ${button.isPrimary 
                    ? 'text-white' 
                    : 'text-[#353B46] border border-gray-300 hover:bg-gray-50'
                  }
                `}
                style={{
                  backgroundColor: button.isPrimary ? primaryColor : 'white'
                }}
                onMouseEnter={(e) => {
                  if (button.isPrimary) {
                    e.currentTarget.style.backgroundColor = `${primaryColor}CC`;
                  } else {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (button.isPrimary) {
                    e.currentTarget.style.backgroundColor = primaryColor;
                  } else {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <span>{button.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Check if split screen is enabled and we have an image (exclude MultibuttonModule)
  const isSplitScreenEnabled = template.content.splitScreenWithImage && template.content.splitScreenImage && template.component !== 'MultibuttonModule';
  const imagePosition = template.content.splitScreenImagePosition || 'right';

  // Render split screen layout
  if (isSplitScreenEnabled) {
    const contentSection = (
      <div 
        className={`flex-1 flex flex-col px-8 md:px-12 lg:px-16 py-8 md:py-12 ${imagePosition === 'left' ? 'border-l' : 'border-r'}`}
        style={{ backgroundColor: '#F8F9FB', borderColor: '#D1D5DC', paddingBottom: '40px', minHeight: 'calc(100vh + 40px)' }}
      >
        {/* Title and Subtitle for all modules except Assessment and Video Interview */}
        {template.component !== 'AssessmentStep' && !questions.some(q => q.type === 'video-interview') && (
          <div className={`mb-8 ${template.content.centerTitle ? 'text-center' : ''}`}>
            {template.content.title && (
              <h2 className="text-[18px] font-semibold text-[#353B46] mb-1">
                {template.content.title}
              </h2>
            )}
            {template.content.subtitle && (
              <p className="text-[14px] text-[#464F5E] mb-6">
                {template.content.subtitle}
              </p>
            )}
          </div>
        )}
     
        {elements.length > 0 && (
          <div className="space-y-6">
            {elements}
          </div>
        )}
        
        {/* Spacer for footer clearance */}
        <div style={{ height: '20px' }}></div>
      </div>
    );

    const imageSection = (
      <div className="flex-1 p-8 flex flex-col items-start justify-start sticky top-0 min-h-screen">
        {/* Image Side Title and Subtitle */}
        {template.content.imageSideHasTitleSubtitle && (
          <div className="mb-4 w-full">
            {template.content.imageSideTitle && (
              <h2 className="text-[18px] font-semibold text-[#353B46] mb-2">
                {template.content.imageSideTitle}
              </h2>
            )}
            {template.content.imageSideSubtitle && (
              <p className="text-[14px] text-[#464F5E] mb-2">
                {template.content.imageSideSubtitle}
              </p>
            )}
          </div>
        )}
        
        {/* Image */}
        <div className="flex-1 flex items-start justify-center w-full">
          <img 
            src={template.content.splitScreenImage} 
            alt="Split screen image"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      </div>
    );

    return (
      <div className="w-full m-0 p-0 overflow-x-hidden bg-white" style={{ marginBottom: '40px' }}>
        <div className="w-full min-h-screen flex" style={{ paddingBottom: '0px' }}>
          {imagePosition === 'left' ? (
            <>
              {imageSection}
              {contentSection}
            </>
          ) : (
            <>
              {contentSection}
              {imageSection}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Title and Subtitle for all modules except Assessment and Video Interview */}
      {template.component !== 'AssessmentStep' && !questions.some(q => q.type === 'video-interview') && (
        <div className={`mb-8 ${template.content.centerTitle ? 'text-center' : ''}`}>
          {template.content.title && (
            <h2 className="text-[18px] font-semibold text-[#353B46] mb-1">
              {template.content.title}
            </h2>
          )}
          {template.content.subtitle && (
            <p className="text-[14px] text-[#464F5E] mb-6">
              {template.content.subtitle}
            </p>
          )}
        </div>
      )}
   
      {elements.length > 0 && (
        <div className="space-y-6">
          {elements}
        </div>
      )}
    </div>
  );
}