import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { VoiceScreeningData } from '../types/application';
import { ModuleTemplate } from '../hooks/useTemplates';

interface VoiceScreeningStepProps {
  data: VoiceScreeningData;
  onUpdate: (data: VoiceScreeningData) => void;
  onValidate: (validateFn: () => boolean) => void;
  primaryColor: string;
  onNext: () => void;
  template?: ModuleTemplate;
}

const VoiceScreeningStep = React.memo(function VoiceScreeningStep({ 
  data, 
  onUpdate, 
  onValidate, 
  primaryColor, 
  onNext,
  template 
}: VoiceScreeningStepProps) {
  const [currentSubStep, setCurrentSubStep] = useState(data.introCompleted ? 1 : 0);
  const [localData, setLocalData] = useState<VoiceScreeningData>(data);
  const [isCallActive, setIsCallActive] = useState(data.introCompleted || false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const validateForm = React.useCallback((): boolean => {
    onUpdate(localData);
    return true;
  }, [localData, onUpdate]);

  useEffect(() => {
    onValidate(validateForm);
  }, [onValidate, validateForm]);

  const handleChange = React.useCallback((updates: Partial<VoiceScreeningData>) => {
    const newData = { ...localData, ...updates };
    setLocalData(newData);
    onUpdate(newData);
  }, [localData, onUpdate]);

  // Start call automatically when entering call step
  useEffect(() => {
    if (currentSubStep === 1 && !isCallActive) {
      setIsCallActive(true);
      handleChange({ callStarted: true });
    }
  }, [currentSubStep, isCallActive, handleChange]);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive && currentSubStep === 1) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive, currentSubStep]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };


  const renderIntroStep = () => {
    // Get image from template overrides or use default
    const introImage = template?.content?.splitScreenImage || '/screeningintro.png';
    // Default to true (show image) unless explicitly set to false
    const splitScreenEnabled = template?.content?.splitScreenWithImage !== false;
    
    // If split screen is disabled, show only text content with new structure
    if (!splitScreenEnabled) {
      const defaultTitle = template?.content?.title || "You're invited to a screening with our virtual agent!";
      
      return (
        <div className="w-full flex items-center justify-center m-0 p-0" style={{ minHeight: 'calc(100vh - 140px)', backgroundColor: '#F8F9FB' }}>
          <div className="w-full max-w-4xl mx-auto px-8 md:px-12 lg:px-16 xl:px-20">
            <h2 className="text-[28px] font-semibold text-[#353B46] mb-6">
              {defaultTitle}
            </h2>
            
            <div className="space-y-2 text-[16px] text-[#464F5E] leading-relaxed">
              {/* How to prepare section */}
              <div>
                <h3 className="font-semibold text-[#353B46] mb-1">How to prepare:</h3>
                <p>
                  {template?.content?.subtitle || "The screening takes around 10 minutes. We recommend completing the screening in a quiet space where you can focus and be easily heard."}
                </p>
              </div>
              
              {/* During the call section */}
              <div>
                <h3 className="font-semibold text-[#353B46] mb-1">During the call</h3>
                <p>
                  You'll have a natural, voice-based conversation with our virtual agent. Feel free to ask questions or request more info about the process at any time.
                </p>
              </div>
              
              {/* After the call section */}
              <div>
                <h3 className="font-semibold text-[#353B46] mb-1">After the call</h3>
                <p className="mb-2">
                  Once you finish, our team will review your responses and get back to you shortly with the next steps.
                </p>
              </div>
              
              {/* Support message */}
              <div className="mt-2"></div>
              <div className="bg-gray-50 rounded-xl px-4 py-2">
                <p className="text-[14px] text-[#464F5E]">
                  If you have any technical questions or need support with your agent call, don't hesitate to{' '}
                  <a href="#" className="text-blue-600 underline hover:text-blue-700">
                    contact our candidate support team
                  </a>
                  .
                </p>
              </div>
            
            </div>
          </div>
        </div>
      );
    }
    
    // Split screen layout with image
    const imagePosition = template?.content?.splitScreenImagePosition || 'left';
    
    // Default content structure
    const defaultTitle = template?.content?.title || "You're invited to a screening with our virtual agent!";
    
    return (
      <div className="w-full bg-white flex items-center justify-center m-0 p-0" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start w-full max-w-6xl mx-auto px-6 md:px-8 lg:px-12`}>
          {imagePosition === 'left' ? (
            <>
              {/* Image on the left */}
              <div className="order-2 lg:order-1">
                <img
                  src={introImage}
                  alt="Voice screening"
                  className="w-full h-auto max-h-[500px] object-contain rounded-lg"
                />
              </div>
              {/* Content on the right */}
              <div className="order-1 lg:order-2">
                <h2 className="text-[28px] font-semibold text-[#353B46] mb-6">
                  {defaultTitle}
                </h2>
                
                <div className="space-y-3 text-[16px] text-[#464F5E] leading-relaxed">
                  {/* How to prepare section */}
                  <div>
                    <h3 className="font-semibold text-[#353B46] mb-1">How to prepare:</h3>
                    <p>
                      {template?.content?.subtitle || "The screening takes around 10 minutes. We recommend completing the screening in a quiet space where you can focus and be easily heard."}
                    </p>
                  </div>
                  
                  {/* During the call section */}
                  <div>
                    <h3 className="font-semibold text-[#353B46] mb-1">During the call</h3>
                    <p>
                      You'll have a natural, voice-based conversation with our virtual agent. Feel free to ask questions or request more info about the process at any time.
                    </p>
                  </div>
                  
                  {/* After the call section */}
                  <div>
                    <h3 className="font-semibold text-[#353B46] mb-1">After the call</h3>
                    <p>
                      Once you finish, our team will review your responses and get back to you shortly with the next steps.
                    </p>
                  </div>
                  
                  {/* Support message */}
                  <div className="bg-gray-50 rounded-xl px-4 py-2 mt-6">
                    <p className="text-[14px] text-[#464F5E]">
                      If you have any technical questions or need support with your agent call, don't hesitate to{' '}
                      <a href="#" className="text-blue-600 underline hover:text-blue-700">
                        contact our candidate support team
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Content on the left */}
              <div className="order-1 lg:order-1">
                <h2 className="text-[28px] font-semibold text-[#353B46] mb-6">
                  {defaultTitle}
                </h2>
                
                <div className="space-y-6 text-[16px] text-[#464F5E] leading-relaxed">
                  {/* How to prepare section */}
                  <div>
                    <h3 className="font-semibold text-[#353B46] mb-2">How to prepare:</h3>
                    <p>
                      {template?.content?.subtitle || "The screening takes around 10 minutes. We recommend completing the screening in a quiet space where you can focus and be easily heard."}
                    </p>
                  </div>
                  
                  {/* During the call section */}
                  <div>
                    <h3 className="font-semibold text-[#353B46] mb-2">During the call</h3>
                    <p>
                      You'll have a natural, voice-based conversation with our virtual agent. Feel free to ask questions or request more info about the process at any time.
                    </p>
                  </div>
                  
                  {/* After the call section */}
                  <div>
                    <h3 className="font-semibold text-[#353B46] mb-2">After the call</h3>
                    <p>
                      Once you finish, our team will review your responses and get back to you shortly with the next steps.
                    </p>
                  </div>
                  
                  {/* Support message */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                    <p className="text-[14px] text-[#464F5E]">
                      If you have any technical questions or need support with your agent call, don't hesitate to{' '}
                      <a href="#" className="text-blue-600 underline hover:text-blue-700">
                        contact our candidate support team
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
              {/* Image on the right */}
              <div className="order-2 lg:order-2">
                <img
                  src={introImage}
                  alt="Voice screening"
                  className="w-full h-auto max-h-[500px] object-contain rounded-lg"
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderCallStep = () => {
    return (
      <div className="w-full m-0 p-0 overflow-x-hidden flex flex-col" style={{ minHeight: 'calc(100vh - 140px)', backgroundColor: '#F8F9FB' }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl w-full px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 mb-8" style={{ gap: '48px' }}>
              {/* Virtual Agent Card */}
              <div
                className="border-2 rounded-2xl flex flex-col items-center justify-center"
                style={{
                  borderColor: primaryColor,
                  backgroundColor: 'white',
                  minHeight: '200px',
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  paddingLeft: '16px',
                  paddingRight: '16px'
                }}
              >
              <h3 className="text-[16px] font-semibold text-[#353B46] mb-2">
                Rachel
              </h3>
              <p className="text-[14px] font-normal text-[#637085] mb-4">
                Virtual agent
              </p>
                
                {/* Audio Waveform Visualization - Always show when on call step */}
                <div className="flex items-center justify-center">
                  <svg width="288" height="32" viewBox="0 0 288 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="77" y="10" width="2" height="12" rx="1" fill="#353B46"/>
                    <rect x="83" y="15" width="2" height="2" rx="1" fill="#353B46"/>
                    <rect x="89" y="15" width="2" height="2" rx="1" fill="#353B46"/>
                    <rect x="95" y="11" width="2" height="10" rx="1" fill="#353B46"/>
                    <rect x="101" y="13" width="2" height="6" rx="1" fill="#353B46"/>
                    <rect x="107" y="13" width="2" height="6" rx="1" fill="#353B46"/>
                    <rect x="113" y="14" width="2" height="4" rx="1" fill="#353B46"/>
                    <rect x="119" y="12" width="2" height="8" rx="1" fill="#353B46"/>
                    <rect x="125" y="11" width="2" height="10" rx="1" fill="#353B46"/>
                    <rect x="131" y="6" width="2" height="20" rx="1" fill="#353B46"/>
                    <rect x="137" y="12" width="2" height="8" rx="1" fill="#353B46"/>
                    <rect x="143" y="11" width="2" height="10" rx="1" fill="#353B46"/>
                    <rect x="149" y="10" width="2" height="12" rx="1" fill="#353B46"/>
                    <rect x="155" y="14" width="2" height="4" rx="1" fill="#353B46"/>
                    <rect x="161" y="13" width="2" height="6" rx="1" fill="#353B46"/>
                    <rect x="167" y="12" width="2" height="8" rx="1" fill="#353B46"/>
                    <rect x="173" y="6" width="2" height="20" rx="1" fill="#353B46"/>
                    <rect x="179" y="10" width="2" height="12" rx="1" fill="#353B46"/>
                    <rect x="185" y="12" width="2" height="8" rx="1" fill="#353B46"/>
                    <rect x="191" y="12" width="2" height="8" rx="1" fill="#353B46"/>
                    <rect x="197" y="14" width="2" height="4" rx="1" fill="#353B46"/>
                    <rect x="203" y="14" width="2" height="4" rx="1" fill="#353B46"/>
                    <rect x="209" y="10" width="2" height="12" rx="1" fill="#353B46"/>
                  </svg>
                </div>
              </div>

            {/* User Card */}
            <div 
              className="rounded-2xl flex flex-col items-center justify-center bg-white shadow-md"
              style={{ 
                minHeight: '200px',
                paddingTop: '16px',
                paddingBottom: '16px',
                paddingLeft: '16px',
                paddingRight: '16px'
              }}
            >
              <h3 className="text-[16px] font-semibold text-[#353B46] mb-2">
                David
              </h3>
              <p className="text-[14px] font-normal text-[#637085] mb-4">
                You
              </p>
              
              {/* Empty space - no icon */}
              <div className="w-12 h-12"></div>
            </div>
            </div>
          </div>
        </div>

        {/* Call Duration - at bottom above footer */}
        <div className="text-center pb-4">
          <p className="text-[16px] font-normal text-[#637085] mb-4">
            Call duration: <span className="font-normal text-[#353B46]">{formatDuration(callDuration)}</span>
          </p>
        </div>

      </div>
    );
  };

  const renderCurrentSubStep = () => {
    switch (currentSubStep) {
      case 0:
        return renderIntroStep();
      case 1:
        return renderCallStep();
      default:
        return renderCallStep();
    }
  };

  return (
    <div className="w-full m-0 p-0 overflow-x-hidden" style={{ backgroundColor: '#F8F9FB' }}>
      {renderCurrentSubStep()}
      
      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 w-full p-4 md:p-6 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-end">
          <button
            onClick={() => {
              if (currentSubStep === 0) {
                handleChange({ introCompleted: true });
                setCurrentSubStep(1);
              } else {
                // Mark as completed and advance to next step
                const updatedData = { ...localData, completed: true };
                setLocalData(updatedData);
                onUpdate(updatedData);
                if (onNext) {
                  onNext();
                }
              }
            }}
            className="flex items-center space-x-2 px-4 md:px-6 py-2 rounded-lg transition-all duration-200 text-white text-sm md:text-base"
            style={{ backgroundColor: primaryColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${primaryColor}CC`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = primaryColor;
            }}
          >
            <span>
              {currentSubStep === 0 ? 'Start Now' : 'Complete'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default VoiceScreeningStep;

