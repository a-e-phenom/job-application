import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { ModuleTemplate } from '../hooks/useTemplates';

interface VideoInterviewStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onValidate: (validateFn: () => boolean) => void;
  primaryColor: string;
  onNext: () => void;
  template?: ModuleTemplate;
}

const VideoInterviewStep = React.memo(function VideoInterviewStep({ 
  data, 
  onUpdate, 
  onValidate, 
  primaryColor, 
  onNext, 
  template 
}: VideoInterviewStepProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [localData, setLocalData] = useState(data);

  // Get questions from template configuration or use defaults
  const getQuestions = () => {
    // Look for video interview configuration in the template
    if (template?.content?.questions) {
      const videoInterviewQuestion = template.content.questions.find(q => q.type === 'video-interview');
      if (videoInterviewQuestion?.videoInterviewConfig?.steps) {
        return videoInterviewQuestion.videoInterviewConfig.steps.map(step => ({
          id: step.id,
          question: step.content.question || 'Enter your interview question here...',
          timeLimit: step.content.timeLimit || 90,
          attempts: step.content.attempts || 3
        }));
      }
    }
    
    // Fallback to default questions
    return [
      {
        id: 'q1',
        question: 'What role do you believe technology (e.g., CRM systems, analytics) plays in modern sales management?',
        timeLimit: 90,
        attempts: 3
      },
      {
        id: 'q2', 
        question: 'Describe a time when you had to overcome a significant challenge in your previous role.',
        timeLimit: 120,
        attempts: 3
      }
    ];
  };

  const questions = getQuestions();

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const validateForm = React.useCallback((): boolean => {
    onUpdate(localData);
    return true; // Video interview steps don't require validation
  }, [localData, onUpdate]);

  useEffect(() => {
    onValidate(validateForm);
  }, [onValidate, validateForm]);

  const handleChange = React.useCallback((updates: any) => {
    const newData = { ...localData, ...updates };
    setLocalData(newData);
    onUpdate(newData);
  }, [localData, onUpdate]);

  // Countdown timer for recording start
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && !isRecording) {
      // Start recording when countdown reaches 0
      setIsRecording(true);
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [countdown, isRecording]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(recordingTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, recordingTime]);

  const startRecording = () => {
    setCountdown(15); // 15 second countdown
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    // Mark question as completed
    handleChange({ 
      completed: true,
      currentQuestion: currentQuestion + 1 
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingTimeRemaining = () => {
    const currentQ = questions[currentQuestion];
    return currentQ ? currentQ.timeLimit - recordingTime : 0;
  };

  const renderCurrentQuestion = () => {
    const question = questions[currentQuestion];
    if (!question) return null;

    return (
      <div className="w-full m-0 p-0 overflow-x-hidden">
        <div className="w-full max-w-4xl mx-auto px-8 md:px-12 lg:px-16 py-8 md:py-12">
          {/* Question Section */}
          <div className="mb-8">
            <h2 className="text-[18px] font-semibold text-[#353B46] mb-2">
              {question.question}
            </h2>
            <div className="flex items-center space-x-4 text-[14px] text-[#637085]">
              <span>Answer time: {formatTime(question.timeLimit)}</span>
              <span>Attempt: 1 of {question.attempts}</span>
            </div>
          </div>

          {/* Countdown Section */}
          {countdown > 0 && (
            <div className="text-center mb-6">
              <div className="text-[14px] text-[#637085] mb-2">
                Recording starts in
              </div>
              <div className="text-[18px] font-semibold text-red-600 border border-red-300 rounded px-3 py-1 bg-white inline-block">
                {formatTime(countdown)}
              </div>
            </div>
          )}

          {/* Video Frame */}
          <div className="relative rounded-xl overflow-hidden mb-6 max-w-2xl mx-auto" style={{ aspectRatio: '16/9' }}>
            {/* Placeholder for video feed */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="/Media.png" 
                alt="Video interview preview"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">REC</span>
              </div>
            )}
            
            {/* Recording time */}
            {isRecording && (
              <div className="absolute top-4 right-4 text-white text-sm font-medium">
                {formatTime(recordingTime)}
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            {/* Preparation dots */}
            {!isRecording && countdown === 0 && (
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <div key={dot} className="w-2 h-2 bg-gray-300 rounded-full"></div>
                ))}
              </div>
            )}
            
            {/* Start/Stop Recording Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={countdown > 0}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                ${isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : countdown > 0
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
                }
              `}
            >
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white' : 'bg-white'}`}></div>
              <span>{isRecording ? 'Stop recording' : 'Start recording'}</span>
            </button>
          </div>

          {/* Time remaining indicator */}
          {isRecording && (
            <div className="text-center">
              <div className="text-[14px] text-[#637085]">
                Time remaining: {formatTime(getRecordingTimeRemaining())}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsRecording(false);
      setCountdown(0);
      setRecordingTime(0);
    } else {
      // All questions completed
      handleChange({ completed: true });
      onNext && onNext();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setIsRecording(false);
      setCountdown(0);
      setRecordingTime(0);
    }
  };

  return (
    <div className="w-full m-0 p-0 overflow-x-hidden bg-white">
      {renderCurrentQuestion()}
      
      {/* Video Interview Navigation - Same footer as Assessment */}
      <div className="fixed bottom-0 left-0 right-0 w-full pb-4 bg-white z-50">
        {/* Progress Bar */}
        <div className="w-full px-0 pb-4">
          <div className="flex w-full gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className="h-1 rounded-full transition-all duration-300 flex-1"
                style={{
                  backgroundColor: currentQuestion >= index ? primaryColor : '#E5E7EB',
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="flex items-center px-6 justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-[12px] md:text-[14px] text-[#637085]">
              Screening | Video Interview | Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {currentQuestion > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center space-x-2 px-6 py-2.5 text-[#353B46] border border-gray-300 rounded-[10px] hover:bg-gray-50 transition-colors duration-200 text-sm md:text-base"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
            
            <button
              onClick={handleNext}
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
                {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VideoInterviewStep;
