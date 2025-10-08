import React, { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, X, Check, ChevronLeft, ChevronRight, Settings2, MoreVertical } from 'lucide-react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import ContactInfoStep from './ContactInfoStep';
import PreScreeningStep from './PreScreeningStep';
import InterviewSchedulingStep from './InterviewSchedulingStep';
import ScreeningStep from './ScreeningStep';
import ResumeStep from './ResumeStep';
import AssessmentStep from './AssessmentStep';
import GenericModuleRenderer from './GenericModuleRenderer';
import ModuleConfigPanel from './ModuleConfigPanel';
import FeedbackModal from './FeedbackModal';
import { ApplicationData, ContactInfo, ScreeningData, ResumeData, PreScreeningInfo, AssessmentData, JobFitInfo, TasksInfo } from '../types/application';
import { ApplicationFlow as FlowType, FlowModule } from '../types/flow';
import { InterviewSchedulingData } from '../types/application';
import { useTemplates } from '../hooks/useTemplates';
import { useFlows } from '../hooks/useFlows';

export default function ApplicationFlow() {
  // ALL HOOKS MUST BE AT THE TOP - NO EXCEPTIONS
  const { templates } = useTemplates();
  const { updateFlow, flows, loading: flowsLoading } = useFlows();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Find the flow by slug
  const flow = flows.find(f => f.slug === slug);
  
  // ALL STATE HOOKS
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [stepValidationRefs, setStepValidationRefs] = useState<Array<() => boolean>>([]);
  
  // Configuration panel state
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [configModule, setConfigModule] = useState<FlowModule | null>(null);
  
  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Initial state variables (these are NOT hooks, just constants)
  const initialContactInfo: ContactInfo = {
    firstName: '',
    lastName: '',
    addressLine1: '',
    state: '',
    email: '',
    countryCode: '+1',
    phoneNumber: '',
    optInCommunications: false,
  };

  const initialJobFit: JobFitInfo = {
    experience: '',
    skills: [],
    availability: '',
    salary: '',
  };

  const initialTasks: TasksInfo = {
    portfolioUrl: '',
    coverLetter: '',
    additionalInfo: '',
  };

  const initialInterviewScheduling: InterviewSchedulingData = {
    selectedDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    selectedTime: '10:00 AM', // Default to first time slot
    timezone: 'UTC+05:30',
  };

  const initialPreScreening: PreScreeningInfo = {
    isAtLeast18: '',
    workAuthorization: '',
    requiresSponsorship: '',
    hasTransportation: '',
    travelDistance: '',
  };

  const initialScreening: ScreeningData = {
    workEligibility: '',
    department: '',
    services: [],
    motivation: '',
    weekdayDayShift: false,
    weekdayNightShift: false,
    weekdayNightShift2: false,
    weekendDayShift: false,
    weekendNightShift: false,
    weekendNightShift2: false,
  };

  const initialResume: ResumeData = {
    resumeFile: null,
    previouslyWorked: '',
    howDidYouHear: '',
  };

  const initialAssessment: AssessmentData = {
    introCompleted: false,
    scenarioAnswers: [],
    agreementAnswers: [],
    mathAnswers: []
  };
  
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    contactInfo: initialContactInfo,
    jobFit: initialJobFit,
    tasks: initialTasks,
    preScreening: initialPreScreening,
    screening: initialScreening,
    interviewScheduling: initialInterviewScheduling,
    resume: initialResume,
    assessment: initialAssessment,
  });

  // ALL useCallback HOOKS
  const updateContactInfo = useCallback((updates: Partial<ContactInfo>) => {
    setApplicationData(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, ...updates }
    }));
  }, []);

  const updatePreScreening = useCallback((updates: Partial<PreScreeningInfo>) => {
    setApplicationData(prev => ({
      ...prev,
      preScreening: { ...prev.preScreening, ...updates }
    }));
  }, []);

  const updateInterviewScheduling = useCallback((updates: Partial<InterviewSchedulingData>) => {
    setApplicationData(prev => ({
      ...prev,
      interviewScheduling: { ...prev.interviewScheduling, ...updates }
    }));
  }, []);

  const updateScreening = useCallback((updates: Partial<ScreeningData>) => {
    setApplicationData(prev => ({
      ...prev,
      screening: { ...prev.screening, ...updates }
    }));
  }, []);

  const updateResume = useCallback((updates: Partial<ResumeData>) => {
    setApplicationData(prev => ({
      ...prev,
      resume: { ...prev.resume, ...updates }
    }));
  }, []);

  const updateAssessment = useCallback((updates: Partial<AssessmentData>) => {
    setApplicationData(prev => ({
      ...prev,
      assessment: { ...prev.assessment, ...updates }
    }));
  }, []);
  
  // NOW WE CAN HAVE CONDITIONAL LOGIC AND EARLY RETURNS
  // Show loading state while flows are being fetched
  if (flowsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Loading flow...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }
  
  // Redirect to homepage if flow not found
  if (!flow) {
    return <Navigate to="/" replace />;
  }
  
  const primaryColor = flow.primaryColor || '#6366F1'; // Default to indigo if not set
  
  // Use flow steps directly
  const steps = flow.steps.map(step => ({
    id: step.id,
    title: step.name,
    isCompleted: false
  }));

  // Get current step's modules for sub-step navigation
  const currentStepModules = flow.steps[currentStep]?.modules || [];
  const hasSubSteps = currentStepModules.length > 1;

  const setStepValidationRef = (stepIndex: number, validateFn: () => boolean) => {
    const newRefs = [...stepValidationRefs];
    newRefs[stepIndex] = validateFn;
    setStepValidationRefs(newRefs);
  };

  const handleNext = () => {
    // Validate current step before proceeding
    const currentStepValidator = stepValidationRefs[currentStep];
    if (currentStepValidator && !currentStepValidator()) {
      return; // Don't proceed if validation fails
    }

    // Special handling for assessment step
    const currentFlowStep = flow.steps[currentStep];
    const currentModule = currentFlowStep?.modules[currentSubStep];
    
    if (currentModule?.component === 'AssessmentStep' && (window as any).assessmentState) {
      (window as any).assessmentState.handleNext();
      return;
    }

    // Handle sub-steps within current step
    if (hasSubSteps && currentSubStep < currentStepModules.length - 1) {
      setCurrentSubStep(currentSubStep + 1);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentSubStep(0); // Reset sub-step when moving to next step
    } else {
      // Flow is complete - show feedback modal if enabled, otherwise go back to homepage
      if (flow?.collectFeedback) {
        setShowFeedbackModal(true);
      } else {
        navigate('/');
      }
    }
  };

  const handleCustomNavigation = (target: { step?: number; subStep?: number; module?: string; flow?: string }) => {
    if (target.flow) {
      // Navigate to different flow
      navigate(`/flow/${target.flow}`);
    } else if (target.step !== undefined) {
      // Navigate to specific step
      setCurrentStep(target.step);
      setCurrentSubStep(target.subStep || 0);
    } else if (target.module) {
      // Find module and navigate to it
      const moduleIndex = findModuleIndex(target.module);
      if (moduleIndex) {
        setCurrentStep(moduleIndex.step);
        setCurrentSubStep(moduleIndex.subStep);
      }
    }
  };

  const findModuleIndex = (moduleId: string) => {
    for (let stepIndex = 0; stepIndex < flow.steps.length; stepIndex++) {
      const step = flow.steps[stepIndex];
      for (let moduleIndex = 0; moduleIndex < step.modules.length; moduleIndex++) {
        if (step.modules[moduleIndex].id === moduleId) {
          return { step: stepIndex, subStep: moduleIndex };
        }
      }
    }
    return null;
  };

  // Group modules that are custom button targets
  const getGroupedModules = (stepModules: FlowModule[]) => {
    const grouped: Array<FlowModule | FlowModule[]> = [];
    const customButtonTargets: FlowModule[] = [];
    
    for (const module of stepModules) {
      const isCustomButtonTarget = stepModules.some(m => 
        m.component === 'MultibuttonModule' && 
        m.templateOverrides?.customButtons?.some(button => button.targetModule === module.id)
      );
      
      if (isCustomButtonTarget && module.component !== 'MultibuttonModule') {
        customButtonTargets.push(module);
      } else {
        // If we have accumulated custom button targets, add them as a group
        if (customButtonTargets.length > 0) {
          grouped.push([...customButtonTargets]);
          customButtonTargets.length = 0;
        }
        grouped.push(module);
      }
    }
    
    // Add any remaining custom button targets
    if (customButtonTargets.length > 0) {
      grouped.push([...customButtonTargets]);
    }
    
    return grouped;
  };

  const handleBack = () => {
    // Handle sub-steps within current step
    if (hasSubSteps && currentSubStep > 0) {
      setCurrentSubStep(currentSubStep - 1);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Set to last sub-step of previous step if it has multiple modules
      const prevStepModules = flow.steps[currentStep - 1]?.modules || [];
      setCurrentSubStep(prevStepModules.length > 1 ? prevStepModules.length - 1 : 0);
    }
  };

  const handleStartNew = () => {
    setCurrentStep(0);
    setCurrentSubStep(0);
    setIsComplete(false);
    setStepValidationRefs([]);
    setApplicationData({
      contactInfo: initialContactInfo,
      jobFit: initialJobFit,
      tasks: initialTasks,
      preScreening: initialPreScreening,
      screening: initialScreening,
      interviewScheduling: initialInterviewScheduling,
      resume: initialResume,
      assessment: initialAssessment,
    });
  };

  // Handle module configuration
  const handleModuleConfig = (module: FlowModule) => {
    setConfigModule(module);
    setConfigPanelOpen(true);
  };

  const handleConfigSave = async (moduleId: string, overrides: FlowModule['templateOverrides']) => {
    try {
      // Update the flow with the new module configuration
      const updatedSteps = flow.steps.map(step => ({
        ...step,
        modules: step.modules.map(module => 
          module.id === moduleId 
            ? { ...module, templateOverrides: overrides }
            : module
        )
      }));

      const updatedFlow = {
        ...flow,
        steps: updatedSteps
      };

      // Save to database
      await updateFlow(flow.id, updatedFlow);
      
      // Close the panel
      setConfigPanelOpen(false);
      setConfigModule(null);
    } catch (error) {
      console.error('Failed to save module configuration:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleFeedbackSubmit = (rating: number, comment: string) => {
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', { rating, comment, flowId: flow?.id });
    setShowFeedbackModal(false);
    navigate('/');
  };

  const handleConfigClose = () => {
    setConfigPanelOpen(false);
    setConfigModule(null);
  };

  const renderCurrentStep = () => {
    const currentFlowStep = flow.steps[currentStep];
    if (!currentFlowStep || currentFlowStep.modules.length === 0) {
      return <div className="text-center text-gray-500">No modules configured for this step</div>;
    }

    // Render the current sub-step module
    const primaryModule = currentFlowStep.modules[currentSubStep] || currentFlowStep.modules[0];
    
    // Find the template for this module to get the latest content
    const moduleTemplate = templates.find(template => template.id === primaryModule.id);

    // Merge global template with flow-specific overrides
    const effectiveTemplate = moduleTemplate ? {
      ...moduleTemplate,
      content: {
        ...moduleTemplate.content,
        ...primaryModule.templateOverrides
      }
    } : undefined;

    switch (primaryModule.id) {
      case 'contact-info':
        return (
          <ContactInfoStep
            data={applicationData.contactInfo}
            onUpdate={updateContactInfo}
            onValidate={(validateFn) => setStepValidationRef(currentStep, validateFn)}
            template={effectiveTemplate}
          />
        );
      case 'pre-screening':
        return (
          <PreScreeningStep
            data={applicationData.preScreening}
            onUpdate={updatePreScreening}
            onValidate={(validateFn) => setStepValidationRef(currentStep, validateFn)}
            primaryColor={primaryColor}
            template={effectiveTemplate}
          />
        );
      case 'screening':
        return (
          <ScreeningStep
            data={applicationData.screening}
            onUpdate={updateScreening}
            onValidate={(validateFn) => setStepValidationRef(currentStep, validateFn)}
            primaryColor={primaryColor}
            template={effectiveTemplate}
          />
        );
      case 'interview-scheduling':
        return (
          <InterviewSchedulingStep
            data={applicationData.interviewScheduling}
            onUpdate={updateInterviewScheduling}
            onValidate={(validateFn) => setStepValidationRef(currentStep, validateFn)}
            primaryColor={primaryColor}
            template={effectiveTemplate}
          />
        );
      case 'resume':
        return (
          <ResumeStep
            data={applicationData.resume}
            onUpdate={updateResume}
            onValidate={(validateFn) => setStepValidationRef(currentStep, validateFn)}
            primaryColor={primaryColor}
            template={effectiveTemplate}
          />
        );
      case 'assessment':
        return (
          <AssessmentStep
            data={applicationData.assessment}
            onUpdate={updateAssessment}
            onValidate={(validateFn) => setStepValidationRef(currentStep, validateFn)}
            primaryColor={primaryColor}
            onNext={handleNext}
            template={effectiveTemplate}
          />
        );
      case 'thank-you':
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h2 className="text-[32px] font-semibold text-[#353B46] mb-4">
                {effectiveTemplate?.content.title || 'Thank you! 🎉'}
              </h2>
              <p className="text-[16px] text-[#464F5E] mb-6">
                {effectiveTemplate?.content.subtitle || 'We received your submission and will get back to you as soon as possible. Good luck!'}
              </p>
              
              {effectiveTemplate?.content.instructions && (
                <div className="mt-8">
                  <p className="text-[16px] text-[#464F5E] mb-4">
                    {effectiveTemplate.content.instructions}
                  </p>
                </div>
              )}
              
              {effectiveTemplate?.content.customFields?.contactInfo && (
                <div className="mt-8">
                  <div className="text-[16px]">
                    <p className="font-medium text-[#353B46] mb-1">
                      {effectiveTemplate.content.customFields.contactInfo.name || 'John Doe'}
                    </p>
                    <a 
                      href={`mailto:${effectiveTemplate.content.customFields.contactInfo.email || 'johndoe@company.com'}`}
                      className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                    >
                      {effectiveTemplate.content.customFields.contactInfo.email || 'johndoe@company.com'}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        if (effectiveTemplate) {
          return (
            <GenericModuleRenderer
              template={effectiveTemplate}
              primaryColor={primaryColor}
              onNext={handleNext}
              onNavigate={handleCustomNavigation}
              moduleOverrides={primaryModule.templateOverrides}
            />
          );
        }
        
        return <div className="text-center text-gray-500"></div>;
    }
  };

  const currentFlowStep = flow.steps[currentStep];

  return (
    <div className={`min-h-screen ${currentFlowStep?.modules[currentSubStep]?.component === 'AssessmentStep' ? 'bg-white' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto px-6 py-4 flex items-center justify-between relative">
          <div className="flex items-center space-x-4">
            
            
            <div className="flex items-center space-x-2">
             <img
          src={flow.logoUrl || "https://mms.businesswire.com/media/20240122372572/en/1546931/5/Phenom_Lockup_RGB_Black.jpg?download=1"}
          alt="Phenom Logo"
          className="h-8 w-auto"
        />
              <div>
               
              </div>
            </div>
          </div>
          
          {/* Step Indicator in Header Middle */}
          {!isComplete && (
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
            <div className="flex items-center">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center">
                    <div
                      className={`
                         w-7 h-7 min-w-7 min-h-7 flex-shrink-0 rounded-full flex items-center justify-center text-sm transition-all duration-300 border
                      `}
                      style={{
                        backgroundColor: index < currentStep 
                          ? `${primaryColor}20` 
                          : index === currentStep 
                          ? primaryColor 
                          : 'white',
                          border: '1px solid',
                        borderColor: index < currentStep 
                          ? `${primaryColor}40` 
                          : index === currentStep 
                          ? primaryColor 
                          : '#D1D5DC',
                        color: index < currentStep 
                          ? primaryColor 
                          : index === currentStep 
                          ? 'white' 
                          : '#6B7280'
                      }}
                    >
                      {index < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span
                      className="ml-2 text-sm transition-colors duration-300 hidden lg:inline font-medium"
                      style={{
                        color: index < currentStep 
                          ? '#464F5E' 
                          : index === currentStep 
                          ? primaryColor 
                          : '#637085'
                      }}
                    >
  {step.title}
                    </span>

                    {/* Sub-step dots for current step with multiple modules */}
                    {index === currentStep && flow.steps[currentStep]?.modules.length > 1 && (
                      <div className="flex items-center ml-2 space-x-1">
                        {(() => {
                          const groupedModules = getGroupedModules(flow.steps[currentStep].modules);
                          return groupedModules.map((group, groupIndex) => {
                            const isGroup = Array.isArray(group);
                            const isActive = isGroup 
                              ? group.some(module => {
                                  const moduleIndex = flow.steps[currentStep].modules.findIndex(m => m.id === module.id);
                                  return moduleIndex === currentSubStep;
                                })
                              : (() => {
                                  const moduleIndex = flow.steps[currentStep].modules.findIndex(m => m.id === (group as FlowModule).id);
                                  return moduleIndex === currentSubStep;
                                })();
                            
                            return (
                              <div
                                key={groupIndex}
                                className={`
                                  w-2 h-2 rounded-full transition-colors duration-300
                                  ${isGroup ? 'shadow-sm' : ''}
                                `}
                                style={{
                                  backgroundColor: isActive ? primaryColor : '#D1D5DB',
                                  
                                }}
                                title={isGroup ? `Custom Button Targets (${group.length})` : (group as FlowModule).name}
                              />
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`
                        w-12 h-px mx-4 transition-colors duration-300
                        ${
                          index < currentStep
                            ? 'bg-gray-200'
                            : 'bg-gray-200'
                        }
                      `}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            </div>
          )}
          
          {/* Header Actions */}
          <div className="flex items-center space-x-1">
            {/* Settings Button - only show if there are modules in current step */}
            {currentFlowStep?.modules && currentFlowStep.modules.length > 0 && (
              <button
                onClick={() => handleModuleConfig(currentFlowStep.modules[currentSubStep] || currentFlowStep.modules[0])}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Configure Module"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            )}
            
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      {(() => {
        const currentModuleId = currentFlowStep?.modules[currentSubStep]?.id;
        const currentComponent = currentFlowStep?.modules[currentSubStep]?.component;
        return null;
      })()}
      {(() => {
        // Check if current module has split screen enabled
        const currentModule = currentFlowStep?.modules[currentSubStep];
        const moduleTemplate = templates.find(template => template.id === currentModule?.id);
        const effectiveTemplate = moduleTemplate ? {
          ...moduleTemplate,
          content: {
            ...moduleTemplate.content,
            ...currentModule?.templateOverrides
          }
        } : undefined;
        
        const isSplitScreenEnabled = effectiveTemplate?.content.splitScreenWithImage && effectiveTemplate?.content.splitScreenImage;
        
        return currentFlowStep?.modules[currentSubStep]?.component === 'AssessmentStep' || isSplitScreenEnabled;
      })() ? (
        // Assessment and split screen modules get full screen treatment - no containers, no padding, no cards
        renderCurrentStep()
      ) : (
        <div className={`mx-auto px-4 py-8 ${
          currentFlowStep?.modules[currentSubStep]?.component === 'InterviewSchedulingStep' 
            ? 'max-w-[1000px]' 
            : 'max-w-[780px]'
        }`}>
          <div className={`bg-white rounded-xl shadow-sm p-8 mb-20 ${
            currentFlowStep?.modules[currentSubStep]?.component === 'InterviewSchedulingStep' 
              ? 'w-full' 
              : ''
          }`}>
          {isComplete ? (
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <h2 className="text-[32px] font-semibold text-[#353B46] mb-4">Application Complete</h2>
                <p className="text-[16px] text-[#464F5E] mb-6">
                  Your application has been submitted successfully.
                </p>
              </div>
            </div>
          ) : renderCurrentStep()}
        </div>
        </div>
      )}

      {/* Footer Navigation */}
      {currentFlowStep?.modules[currentSubStep]?.component !== 'ThankYouStep' && 
       currentFlowStep?.modules[currentSubStep]?.component !== 'AssessmentStep' &&
       currentFlowStep?.modules[currentSubStep]?.component !== 'MultibuttonModule' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="mx-auto flex justify-end items-center space-x-3">
          
            <button
            onClick={handleBack}
            disabled={currentStep === 0 && currentSubStep === 0}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-[10px] transition-all duration-200 border border-[#D1D5DC]
              ${
                currentStep === 0 && currentSubStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-[#353B46] hover:bg-gray-100 border border-gray-300'
              }
            `}
            >
            <ArrowLeft className="w-4 h-4" />
            
            </button>

          <button
            onClick={handleNext}
            data-next-button
            className="flex items-center space-x-2 px-6 py-2.5 rounded-[10px] transition-all duration-200 text-white"
            style={{ 
              backgroundColor: primaryColor
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${primaryColor}CC`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = primaryColor;
            }}
          >
            <span>
              {currentStep === steps.length - 1 && (!hasSubSteps || currentSubStep === currentStepModules.length - 1) 
                ? 'Submit' 
                : 'Next'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      )}

      {/* Module Configuration Panel */}
      {configModule && (
        <ModuleConfigPanel
          isOpen={configPanelOpen}
          onClose={handleConfigClose}
          module={configModule}
          globalTemplate={templates.find(template => template.id === configModule.id)}
          onSave={handleConfigSave}
        />
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          navigate('/');
        }}
        onSubmit={handleFeedbackSubmit}
        primaryColor={flow?.primaryColor || '#6366F1'}
      />
    </div>
  );
}