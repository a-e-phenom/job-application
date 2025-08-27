import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { AssessmentData } from '../types/application';
import { ModuleTemplate } from '../hooks/useTemplates';

interface AssessmentStepProps {
  data: AssessmentData;
  onUpdate: (data: AssessmentData) => void;
  onValidate: (validateFn: () => boolean) => void;
  primaryColor: string;
  onNext: () => void;
  template?: ModuleTemplate;
}

const SCENARIO_QUESTIONS = [
  {
    id: 'scenario1',
    title: '1. What do you do?',
    description: 'You are waiting for a colleague to take over at the end of your shift, but they don\'t show up and you have plans. What do you do?',
    image: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=600',
    responses: [
      'You contact your store manager with a situation update. You decide to delay meeting your friends until the situation is solved.',
      'You check if someone else is available by calling other colleagues in other stores.',
      'You contact your store manager and tell them that you have to leave as it\'s the end of your shift and you will have to close the store.'
    ]
  }
];

const AGREEMENT_QUESTIONS = [
  {
    id: 'agreement1',
    statement: 'When faced with challenges in store management, I tend to stick to the strategies I already know, rather than seeking new approaches.'
  }
];

const MATH_QUESTIONS = [
  {
    id: 'math1',
    title: '3. Read the text',
    question: 'What are the total monthly earnings of Sarah?',
    description: 'Sarah, a Store Associate, earned a base salary of $1,500 per month and a commission of 5% on her total monthly sales. If she made $3,800 in sales this month, what is her total monthly earnings?',
    options: ['$1,700', '$1,850', '$1,950', '$2,000']
  }
];

const AssessmentStep = React.memo(function AssessmentStep({ data, onUpdate, onValidate, primaryColor, onNext }: AssessmentStepProps) {
  const [currentSubStep, setCurrentSubStep] = useState(data.introCompleted ? 1 : 0);
  const [localData, setLocalData] = useState<AssessmentData>(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const validateForm = React.useCallback((): boolean => {
    onUpdate(localData);
    return true; // Assessment steps don't require validation
  }, [localData, onUpdate]);

  useEffect(() => {
    onValidate(validateForm);
  }, [onValidate, validateForm]);

  const handleChange = React.useCallback((updates: Partial<AssessmentData>) => {
    const newData = { ...localData, ...updates };
    setLocalData(newData);
    onUpdate(newData);
  }, [localData, onUpdate]);

  const getScenarioAnswer = (questionId: string) => {
    return localData.scenarioAnswers.find(a => a.questionId === questionId);
  };

  const getAgreementAnswer = (questionId: string) => {
    return localData.agreementAnswers.find(a => a.questionId === questionId);
  };

  const getMathAnswer = (questionId: string) => {
    console.log('Assessment internal next clicked, currentSubStep:', currentSubStep);
    
    return localData.mathAnswers.find(a => a.questionId === questionId);
  };

  const handleScenarioAnswer = (questionId: string, type: 'best' | 'worst', responseIndex: number) => {
    const updatedAnswers = [...localData.scenarioAnswers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === questionId);
      // Assessment is complete - call main flow next
      console.log('Assessment complete - calling main flow onNext');
    if (existingIndex >= 0) {
      const currentAnswer = updatedAnswers[existingIndex];
      handleChange({ completed: true });
      
      // Check if clicking the same button that's already selected
      if (type === 'best' && currentAnswer.bestResponse === responseIndex.toString()) {
        // Deselect it
        currentAnswer.bestResponse = '';
      } else if (type === 'worst' && currentAnswer.worstResponse === responseIndex.toString()) {
        // Deselect it
        currentAnswer.worstResponse = '';
      } else {
        // Clear any existing selection on this specific card (response)
        if (type === 'best') {
          // If this card already has a best selection, clear it first
          // If this card already has a worst selection, clear it first
          if (currentAnswer.worstResponse === responseIndex.toString()) {
            currentAnswer.worstResponse = '';
          }
          currentAnswer.bestResponse = responseIndex.toString();
        } else {
          // If this card already has a best selection, clear it first
          if (currentAnswer.bestResponse === responseIndex.toString()) {
            currentAnswer.bestResponse = '';
          }
          currentAnswer.worstResponse = responseIndex.toString();
        }
      }
      // Call the main flow's next function immediately
      console.log('Assessment complete - calling onNext');
      onNext && onNext();
    } else {
      updatedAnswers.push({
        questionId,
        bestResponse: type === 'best' ? responseIndex.toString() : '',
        worstResponse: type === 'worst' ? responseIndex.toString() : ''
      });
    }
    
    handleChange({ scenarioAnswers: updatedAnswers });
  };

  const handleAgreementAnswer = (questionId: string, rating: number) => {
    const updatedAnswers = [...localData.agreementAnswers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === questionId);
    
    if (existingIndex >= 0) {
      updatedAnswers[existingIndex].rating = rating;
    } else {
      updatedAnswers.push({ questionId, rating });
    }
    
    handleChange({ agreementAnswers: updatedAnswers });
  };

  const handleMathAnswer = (questionId: string, answer: string) => {
    const updatedAnswers = [...localData.mathAnswers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === questionId);
    
    if (existingIndex >= 0) {
      updatedAnswers[existingIndex].answer = answer;
    } else {
      updatedAnswers.push({ questionId, answer });
    }
    
    handleChange({ mathAnswers: updatedAnswers });
  };

  const renderIntroStep = () => {
    return (
      <div className="w-full flex items-center justify-center m-0 p-0" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Store interior"
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-[28px] font-semibold text-[#353B46] mb-6">Welcome to the assessment!</h2>
              
              <div className="space-y-4 text-[16px] text-[#464F5E] leading-relaxed">
                <p>You will choose the most suitable and least suitable response for each scenario.</p>
                
                <p>We're excited for you to get a glimpse of life as part of our team! In the upcoming section, you'll see different scenarios that you may experience while on the job. Each scenario will have a set of responses listed below it.</p>
                
                <p>After that section, you'll see a series of statements. You will choose how strongly you agree or disagree with each statement.</p>
                
                <p>This will only take about 10 minutes to complete. Let's begin!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderIntroStepOld = () => {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center m-0 p-0">
        <div className="text-center px-6 md:px-8">
          <h2 className="text-[20px] font-medium text-[#353B46] mb-4">Assessment Introduction</h2>
          <p className="text-[16px] text-[#464F5E] leading-relaxed">
            Welcome to the assessment. This will consist of 3 questions to evaluate your skills and decision-making abilities.
          </p>
        </div>
      </div>
    );
  };

  const renderScenarioStep = () => {
    const question = SCENARIO_QUESTIONS[0];
    const answer = getScenarioAnswer(question.id);
    
    return (
      <div className="w-full bg-white m-0 p-0 overflow-x-hidden" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full m-0 p-0" style={{ minHeight: 'calc(100vh - 140px)' }}>
          <div className="px-8 md:px-12 lg:px-16 py-8 md:py-12 flex flex-col justify-center w-full">
            <h2 className="text-[20px] font-medium text-[#353B46] mb-4">{question.title}</h2>
            <img
              src={question.image}
              alt="Scenario"
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <p className="text-[16px] text-[#464F5E] leading-relaxed">{question.description}</p>
          </div>
          
          <div className="px-8 md:px-12 lg:px-16 py-8 md:py-12 flex flex-col justify-center w-full">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-[14px] text-[#637085] leading-relaxed">
                Select the ✔ next to the response you feel is the best response. Then, select the ✘ next to the response you feel is the worst response. You must select one ✔and one ✘ to advance to the next question.
              </p>
            </div>
            
            <div className="space-y-4">
              {question.responses.map((response, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <p className="text-[16px] text-[#464F5E] flex-1 pr-4">{response}</p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleScenarioAnswer(question.id, 'best', index)}
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
                        onClick={() => handleScenarioAnswer(question.id, 'worst', index)}
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
    const question = AGREEMENT_QUESTIONS[0];
    const answer = getAgreementAnswer(question.id);
    
    const getSizeClasses = (rating: number) => {
      switch (rating) {
        case 1: return 'w-8 h-8';   // 32px
        case 2: return 'w-10 h-10'; // 40px
        case 3: return 'w-8 h-8';   // 32px
        case 4: return 'w-14 h-14'; // 56px
        case 5: return 'w-[72px] h-[72px]'; // 72px
        default: return 'w-8 h-8';
      }
    };
    
    return (
      <div className="w-full bg-white m-0 p-0 overflow-x-hidden" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full m-0 p-0" style={{ minHeight: 'calc(100vh - 140px)' }}>
          <div className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-8 md:py-12 w-full">
            <h2 className="text-[20px] font-medium text-[#353B46] mb-8">2. Do you agree with the statement below?</h2>
            
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-[18px] text-[#353B46] font-medium leading-relaxed">
                {question.statement}
              </p>
            </div>
          </div>
          
          {/* Right column - Rating component */}
          <div className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-8 md:py-12 w-full" style={{ backgroundColor: '#F8F9FB' }}>
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleAgreementAnswer(question.id, rating)}
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
              <span>Strongly disagree</span>
              <span>Strongly agree</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMathStep = () => {
    const question = MATH_QUESTIONS[0];
    const answer = getMathAnswer(question.id);
    
    return (
      <div className="w-full bg-white m-0 p-0 overflow-x-hidden" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full m-0 p-0" style={{ minHeight: 'calc(100vh - 140px)' }}>
          {/* Left column - Question and description */}
          <div className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-8 md:py-12 w-full">
            <h2 className="text-[20px] font-medium text-[#353B46] mb-4">{question.title}</h2>
            <p className="text-[16px] text-[#464F5E] mb-6">{question.question}</p>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-[16px] text-[#353B46] text-center leading-relaxed">
                {question.description}
              </p>
            </div>
          </div>
          
          {/* Right column - Answer options */}
          <div 
            className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-8 md:py-12 w-full"
            style={{ backgroundColor: '#F8F9FB' }}
          >
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    console.log('Complete button clicked!');
                    handleMathAnswer(question.id, option);
                    // Just answer the question, don't auto-advance
                  }}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all duration-200
                    ${answer?.answer === option
                      ? 'text-white border-transparent'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  style={{
                    backgroundColor: answer?.answer === option ? primaryColor : 'transparent'
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

  const renderCurrentSubStep = () => {
    switch (currentSubStep) {
      case 0:
        return renderIntroStep();
      case 1:
        return renderScenarioStep();
      case 2:
        return renderAgreementStep();
      case 3:
        return renderMathStep();
      default:
        return renderMathStep();
    }
  };

  // Expose assessment state and handlers to parent
  React.useEffect(() => {
    window.assessmentState = {
      currentSubStep,
      setCurrentSubStep,
      canAdvance: () => {
        switch (currentSubStep) {
          case 0:
            return true;
          case 1:
            const scenarioAnswer = getScenarioAnswer(SCENARIO_QUESTIONS[0].id);
            return scenarioAnswer?.bestResponse !== undefined && scenarioAnswer?.worstResponse !== undefined && 
                   scenarioAnswer?.bestResponse !== scenarioAnswer?.worstResponse;
          case 2:
            return getAgreementAnswer(AGREEMENT_QUESTIONS[0].id)?.rating;
          case 3:
            return getMathAnswer(MATH_QUESTIONS[0].id)?.answer;
          default:
            return false;
        }
      },
      getSubStepTitle: (step: number) => {
        switch (step) {
          case 0:
            return 'Introduction';
          case 1:
            return 'Question 1 of 3';
          case 2:
            return 'Question 2 of 3';
          case 3:
            return 'Question 3 of 3';
          default:
            return '';
        }
      },
      handleNext: () => {
        console.log('Assessment internal handleNext called, currentSubStep:', currentSubStep);
        if (currentSubStep === 0) {
          handleChange({ introCompleted: true });
          setCurrentSubStep(1);
        } else if (currentSubStep < 3) {
          setCurrentSubStep(currentSubStep + 1);
        } else {
          console.log('Assessment complete - should advance to next step');
          // Mark assessment as completed
          const updatedData = { ...localData, completed: true };
          setLocalData(updatedData);
          onUpdate(updatedData);
          // Call the main flow's next function
          if (onNext) {
            console.log('Calling onNext to advance to next step');
            onNext();
          } else {
            console.log('ERROR: onNext function not available');
          }
        }
      },
      handlePrevious: () => {
        setCurrentSubStep(Math.max(0, currentSubStep - 1));
      }
    };
  }, [currentSubStep, onNext, handleChange, localData, onUpdate]);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      delete window.assessmentState;
    };
  }, []);

  return (
    <div className="w-full m-0 p-0 overflow-x-hidden bg-white">
      {renderCurrentSubStep()}
      
      {/* Assessment Navigation */}
      <div className="fixed bottom-0 left-0 right-0 w-full p-4 md:p-6 bg-white border-t border-gray-200 z-50">
        {/* Progress Bar */}
        {currentSubStep > 0 && (
          <div className="w-full px-0 pb-4">
            <div className="flex w-full gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className="h-1 rounded-full transition-all duration-300 flex-1"
                  style={{
                    backgroundColor: currentSubStep >= step ? primaryColor : '#E5E7EB',
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-[12px] md:text-[14px] text-[#637085]">
              Assessment | {window.assessmentState?.getSubStepTitle(currentSubStep) || ''}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {currentSubStep > 0 && (
              <button
                onClick={() => setCurrentSubStep(Math.max(0, currentSubStep - 1))}
                className="flex items-center space-x-2 px-3 md:px-4 py-1 md:py-3 text-[#353B46] border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-sm md:text-base"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
            
            <button
              onClick={() => {
                console.log('Complete button clicked in AssessmentStep!');
                if (currentSubStep < 3) {
                  setCurrentSubStep(currentSubStep + 1);
                } else {
                  console.log('Assessment complete - final step reached');
                  const updatedData = { ...localData, completed: true };
                  setLocalData(updatedData);
                  onUpdate(updatedData);
                  if (onNext) {
                    console.log('Calling parent onNext function');
                    onNext();
                  } else {
                    console.log('ERROR: onNext function not provided to AssessmentStep');
                  }
                }
              }}
              className="flex items-center space-x-2 px-4 md:px-6 py-2 rounded-lg transition-all duration-200 text-white text-sm md:text-base"
              style={{ backgroundColor: primaryColor }}
            >
              <span>{currentSubStep === 0 ? 'Start' : currentSubStep === 3 ? 'Complete' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AssessmentStep;