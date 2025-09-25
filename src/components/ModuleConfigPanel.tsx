import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Plus, Type, FileText, ChevronDown, Circle, CheckSquare, FolderOpen, Image, Phone, Calendar, MessageSquare, ClipboardList, Video, ChevronUp, ChevronDown as ChevronDownIcon, MoveUp, MoveDown, Trash2 } from 'lucide-react';
import { FlowModule } from '../types/flow';
import { ModuleTemplate } from '../hooks/useTemplates';

interface LocalOverrides {
  title: string;
  subtitle: string;
  centerTitle: boolean;
  questions: Array<{
    id: string;
    text: string;
    type: 'text' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file' | 'image' | 'phone' | 'interview-scheduler' | 'message' | 'assessment' | 'video-interview';
    options?: string[];
    required?: boolean;
    halfWidth?: boolean;
    layout?: 'vertical' | 'horizontal';
    content?: string;
    typeSelectorOpen?: boolean; // Added for custom dropdown
    assessmentConfig?: {
      screens: Array<{
        id: string;
        type: 'welcome' | 'best-worst' | 'agree-scale' | 'single-select';
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
        };
      }>;
    };
  }>;
}

// Assessment Screen Types
type AssessmentScreenType = 'welcome' | 'best-worst' | 'agree-scale' | 'single-select';

interface AssessmentScreen {
  id: string;
  type: AssessmentScreenType;
  title: string;
  content: {
    // Welcome screen
    welcomeTitle?: string;
    welcomeDescription?: string;
    welcomeImage?: string;
    
    // Best-worst screen
    scenarioTitle?: string;
    scenarioDescription?: string;
    scenarioImage?: string;
    scenarioResponses?: string[];
    instructionText?: string;
    
    // Agree scale screen
    agreementTitle?: string;
    agreementStatement?: string;
    scaleLabels?: {
      left: string;
      right: string;
    };
    
    // Single select screen
    singleSelectTitle?: string;
    singleSelectQuestion?: string;
    singleSelectDescription?: string;
    singleSelectOptions?: string[];
  };
}

interface AssessmentConfigurationProps {
  question: any;
  onUpdate: (config: any) => void;
}

const AssessmentConfiguration: React.FC<AssessmentConfigurationProps> = ({ question, onUpdate }) => {
  const [screens, setScreens] = useState<AssessmentScreen[]>(
    question.assessmentConfig?.screens || [
      {
        id: 'welcome-1',
        type: 'welcome',
        title: 'Welcome Screen',
        content: {
          welcomeTitle: 'Welcome to the assessment!',
          welcomeDescription: 'You will choose the most suitable and least suitable response for each scenario.',
          welcomeImage: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800'
        }
      },
      {
        id: 'best-worst-1',
        type: 'best-worst',
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
        type: 'agree-scale',
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
        type: 'single-select',
        title: 'Single Select Question',
        content: {
          singleSelectTitle: 'Math Question',
          singleSelectQuestion: 'What is 15% of $2,000?',
          singleSelectDescription: 'Choose the correct answer from the options below.',
          singleSelectOptions: ['$300', '$350', '$400', '$450']
        }
      }
    ]
  );

  const updateScreens = (newScreens: AssessmentScreen[]) => {
    setScreens(newScreens);
    onUpdate({ screens: newScreens });
  };

  const addScreen = (type: AssessmentScreenType) => {
    const newScreen: AssessmentScreen = {
      id: `${type}-${Date.now()}`,
      type,
      title: getDefaultTitle(type),
      content: getDefaultContent(type)
    };
    updateScreens([...screens, newScreen]);
  };

  const removeScreen = (screenId: string) => {
    updateScreens(screens.filter(s => s.id !== screenId));
  };

  const moveScreenUp = (index: number) => {
    if (index === 0) return;
    const newScreens = [...screens];
    [newScreens[index], newScreens[index - 1]] = [newScreens[index - 1], newScreens[index]];
    updateScreens(newScreens);
  };

  const moveScreenDown = (index: number) => {
    if (index === screens.length - 1) return;
    const newScreens = [...screens];
    [newScreens[index], newScreens[index + 1]] = [newScreens[index + 1], newScreens[index]];
    updateScreens(newScreens);
  };

  const updateScreen = (screenId: string, updates: Partial<AssessmentScreen>) => {
    const newScreens = screens.map(s => 
      s.id === screenId ? { ...s, ...updates } : s
    );
    updateScreens(newScreens);
  };

  const updateScreenContent = (screenId: string, contentUpdates: Partial<AssessmentScreen['content']>) => {
    const newScreens = screens.map(s => 
      s.id === screenId 
        ? { ...s, content: { ...s.content, ...contentUpdates } }
        : s
    );
    updateScreens(newScreens);
  };

  const getDefaultTitle = (type: AssessmentScreenType): string => {
    switch (type) {
      case 'welcome': return 'Welcome Screen';
      case 'best-worst': return 'Best/Worst Response';
      case 'agree-scale': return 'Agreement Scale';
      case 'single-select': return 'Single Select Question';
      default: return 'New Screen';
    }
  };

  const getDefaultContent = (type: AssessmentScreenType): AssessmentScreen['content'] => {
    switch (type) {
      case 'welcome':
        return {
          welcomeTitle: 'Welcome to the assessment!',
          welcomeDescription: 'You will choose the most suitable and least suitable response for each scenario.',
          welcomeImage: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800'
        };
      case 'best-worst':
        return {
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
        };
      case 'agree-scale':
        return {
          agreementTitle: 'Do you agree with the statement below?',
          agreementStatement: 'I believe that customer satisfaction is the most important aspect of our business.',
          scaleLabels: {
            left: 'Strongly disagree',
            right: 'Strongly agree'
          }
        };
      case 'single-select':
        return {
          singleSelectTitle: 'Math Question',
          singleSelectQuestion: 'What is 15% of $2,000?',
          singleSelectDescription: 'Choose the correct answer from the options below.',
          singleSelectOptions: ['$300', '$350', '$400', '$450']
        };
      default:
        return {};
    }
  };

  const addResponseOption = (screenId: string) => {
    const screen = screens.find(s => s.id === screenId);
    if (screen && screen.type === 'best-worst') {
      const newResponses = [...(screen.content.scenarioResponses || []), 'New response option'];
      updateScreenContent(screenId, { scenarioResponses: newResponses });
    }
  };

  const updateResponseOption = (screenId: string, index: number, value: string) => {
    const screen = screens.find(s => s.id === screenId);
    if (screen && screen.type === 'best-worst') {
      const newResponses = [...(screen.content.scenarioResponses || [])];
      newResponses[index] = value;
      updateScreenContent(screenId, { scenarioResponses: newResponses });
    }
  };

  const removeResponseOption = (screenId: string, index: number) => {
    const screen = screens.find(s => s.id === screenId);
    if (screen && screen.type === 'best-worst') {
      const newResponses = (screen.content.scenarioResponses || []).filter((_, i) => i !== index);
      updateScreenContent(screenId, { scenarioResponses: newResponses });
    }
  };

  const addSelectOption = (screenId: string) => {
    const screen = screens.find(s => s.id === screenId);
    if (screen && screen.type === 'single-select') {
      const newOptions = [...(screen.content.singleSelectOptions || []), 'New option'];
      updateScreenContent(screenId, { singleSelectOptions: newOptions });
    }
  };

  const updateSelectOption = (screenId: string, index: number, value: string) => {
    const screen = screens.find(s => s.id === screenId);
    if (screen && screen.type === 'single-select') {
      const newOptions = [...(screen.content.singleSelectOptions || [])];
      newOptions[index] = value;
      updateScreenContent(screenId, { singleSelectOptions: newOptions });
    }
  };

  const removeSelectOption = (screenId: string, index: number) => {
    const screen = screens.find(s => s.id === screenId);
    if (screen && screen.type === 'single-select') {
      const newOptions = (screen.content.singleSelectOptions || []).filter((_, i) => i !== index);
      updateScreenContent(screenId, { singleSelectOptions: newOptions });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-gray-600">Assessment Screens</label>
        <div className="relative">
          <select
            onChange={(e) => {
              if (e.target.value) {
                addScreen(e.target.value as AssessmentScreenType);
                e.target.value = '';
              }
            }}
            className="text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded px-2 py-1 bg-white"
          >
            <option value="">+ Add Screen</option>
            <option value="welcome">Welcome Screen</option>
            <option value="best-worst">Best/Worst Response</option>
            <option value="agree-scale">Agreement Scale</option>
            <option value="single-select">Single Select Question</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {screens.map((screen, index) => (
          <div key={screen.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            {/* Screen Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">{screen.title}</span>
                {/* <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {screen.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span> */}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => moveScreenUp(index)}
                  disabled={index === 0}
                  className={`p-1 rounded transition-colors duration-200 ${
                    index === 0 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  title="Move up"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveScreenDown(index)}
                  disabled={index === screens.length - 1}
                  className={`p-1 rounded transition-colors duration-200 ${
                    index === screens.length - 1
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  title="Move down"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeScreen(screen.id)}
                  className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                  title="Remove screen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Screen Configuration */}
            <div className="space-y-3">
              {/* Screen Title */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Screen Title</label>
                <input
                  type="text"
                  value={screen.title}
                  onChange={(e) => updateScreen(screen.id, { title: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Welcome Screen Configuration */}
              {screen.type === 'welcome' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Welcome Title</label>
                    <input
                      type="text"
                      value={screen.content.welcomeTitle || ''}
                      onChange={(e) => updateScreenContent(screen.id, { welcomeTitle: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea
                      value={screen.content.welcomeDescription || ''}
                      onChange={(e) => updateScreenContent(screen.id, { welcomeDescription: e.target.value })}
                      rows={3}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-vertical"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={screen.content.welcomeImage || ''}
                      onChange={(e) => updateScreenContent(screen.id, { welcomeImage: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Best-Worst Screen Configuration */}
              {screen.type === 'best-worst' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Scenario Title</label>
                    <input
                      type="text"
                      value={screen.content.scenarioTitle || ''}
                      onChange={(e) => updateScreenContent(screen.id, { scenarioTitle: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Scenario Description</label>
                    <textarea
                      value={screen.content.scenarioDescription || ''}
                      onChange={(e) => updateScreenContent(screen.id, { scenarioDescription: e.target.value })}
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-vertical"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Scenario Image URL</label>
                    <input
                      type="text"
                      value={screen.content.scenarioImage || ''}
                      onChange={(e) => updateScreenContent(screen.id, { scenarioImage: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Instruction Text</label>
                    <textarea
                      value={screen.content.instructionText || ''}
                      onChange={(e) => updateScreenContent(screen.id, { instructionText: e.target.value })}
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-vertical"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-gray-600">Response Options</label>
                      <button
                        onClick={() => addResponseOption(screen.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        + Add Option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(screen.content.scenarioResponses || []).map((response, responseIndex) => (
                        <div key={responseIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={response}
                            onChange={(e) => updateResponseOption(screen.id, responseIndex, e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => removeResponseOption(screen.id, responseIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Agree Scale Screen Configuration */}
              {screen.type === 'agree-scale' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Agreement Title</label>
                    <input
                      type="text"
                      value={screen.content.agreementTitle || ''}
                      onChange={(e) => updateScreenContent(screen.id, { agreementTitle: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Statement</label>
                    <textarea
                      value={screen.content.agreementStatement || ''}
                      onChange={(e) => updateScreenContent(screen.id, { agreementStatement: e.target.value })}
                      rows={3}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-vertical"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Left Label</label>
                      <input
                        type="text"
                        value={screen.content.scaleLabels?.left || ''}
                        onChange={(e) => updateScreenContent(screen.id, { 
                          scaleLabels: { 
                            left: e.target.value,
                            right: screen.content.scaleLabels?.right || 'Strongly agree'
                          } 
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Right Label</label>
                      <input
                        type="text"
                        value={screen.content.scaleLabels?.right || ''}
                        onChange={(e) => updateScreenContent(screen.id, { 
                          scaleLabels: { 
                            left: screen.content.scaleLabels?.left || 'Strongly disagree',
                            right: e.target.value
                          } 
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Single Select Screen Configuration */}
              {screen.type === 'single-select' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Question Title</label>
                    <input
                      type="text"
                      value={screen.content.singleSelectTitle || ''}
                      onChange={(e) => updateScreenContent(screen.id, { singleSelectTitle: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Question Text</label>
                    <input
                      type="text"
                      value={screen.content.singleSelectQuestion || ''}
                      onChange={(e) => updateScreenContent(screen.id, { singleSelectQuestion: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea
                      value={screen.content.singleSelectDescription || ''}
                      onChange={(e) => updateScreenContent(screen.id, { singleSelectDescription: e.target.value })}
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-vertical"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-gray-600">Answer Options</label>
                      <button
                        onClick={() => addSelectOption(screen.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        + Add Option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(screen.content.singleSelectOptions || []).map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateSelectOption(screen.id, optionIndex, e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => removeSelectOption(screen.id, optionIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Video Interview Step Types
type VideoInterviewStepType = 'question';

interface VideoInterviewStep {
  id: string;
  type: VideoInterviewStepType;
  title: string;
  content: {
    question?: string;
    timeLimit?: number;
    attempts?: number;
  };
}

interface VideoInterviewConfigurationProps {
  question: any;
  onUpdate: (config: any) => void;
}

const VideoInterviewConfiguration: React.FC<VideoInterviewConfigurationProps> = ({ question, onUpdate }) => {
  const [steps, setSteps] = useState<VideoInterviewStep[]>(
    question.videoInterviewConfig?.steps || [
      {
        id: 'question-1',
        type: 'question',
        title: 'Question 1',
        content: {
          question: 'What role do you believe technology (e.g., CRM systems, analytics) plays in modern sales management?',
          timeLimit: 90,
          attempts: 3
        }
      }
    ]
  );

  const updateSteps = (newSteps: VideoInterviewStep[]) => {
    setSteps(newSteps);
    onUpdate({ steps: newSteps });
  };

  const addStep = () => {
    const newStep: VideoInterviewStep = {
      id: `question-${Date.now()}`,
      type: 'question',
      title: `Question ${steps.length + 1}`,
      content: {
        question: 'Enter your interview question here...',
        timeLimit: 90,
        attempts: 3
      }
    };
    updateSteps([...steps, newStep]);
  };

  const removeStep = (stepId: string) => {
    updateSteps(steps.filter(s => s.id !== stepId));
  };

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
    updateSteps(newSteps);
  };

  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    updateSteps(newSteps);
  };

  const updateStep = (stepId: string, updates: Partial<VideoInterviewStep>) => {
    const newSteps = steps.map(s => 
      s.id === stepId ? { ...s, ...updates } : s
    );
    updateSteps(newSteps);
  };

  const updateStepContent = (stepId: string, contentUpdates: Partial<VideoInterviewStep['content']>) => {
    const newSteps = steps.map(s => 
      s.id === stepId 
        ? { ...s, content: { ...s.content, ...contentUpdates } }
        : s
    );
    updateSteps(newSteps);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-gray-600">Video Interview Questions</label>
        <button
          onClick={addStep}
          className="text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded px-2 py-1 bg-white"
        >
          + Add Question
        </button>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            {/* Step Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">{step.title}</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => moveStepUp(index)}
                  disabled={index === 0}
                  className={`p-1 rounded transition-colors duration-200 ${
                    index === 0 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  title="Move up"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveStepDown(index)}
                  disabled={index === steps.length - 1}
                  className={`p-1 rounded transition-colors duration-200 ${
                    index === steps.length - 1
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  title="Move down"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeStep(step.id)}
                  className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                  title="Remove question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step Configuration */}
            <div className="space-y-3">
              {/* Question Title */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Question Title</label>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => updateStep(step.id, { title: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                <textarea
                  value={step.content.question || ''}
                  onChange={(e) => updateStepContent(step.id, { question: e.target.value })}
                  rows={3}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-vertical"
                  placeholder="Enter your interview question here..."
                />
              </div>

              {/* Time Limit and Attempts */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Time Limit (sec)</label>
                  <input
                    type="number"
                    value={step.content.timeLimit || 90}
                    onChange={(e) => updateStepContent(step.id, { timeLimit: parseInt(e.target.value) || 90 })}
                    min="30"
                    max="600"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Attempts</label>
                  <input
                    type="number"
                    value={step.content.attempts || 3}
                    onChange={(e) => updateStepContent(step.id, { attempts: parseInt(e.target.value) || 3 })}
                    min="1"
                    max="10"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ModuleConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  module: FlowModule;
  globalTemplate: ModuleTemplate | undefined;
  onSave: (moduleId: string, overrides: FlowModule['templateOverrides']) => void;
}

export default function ModuleConfigPanel({
  isOpen,
  onClose,
  module,
  globalTemplate,
  onSave
}: ModuleConfigPanelProps) {
  const [localOverrides, setLocalOverrides] = useState<LocalOverrides>({
    title: '',
    subtitle: '',
    centerTitle: false,
    questions: []
  });
    const [hasChanges, setHasChanges] = useState(false);
  
  // Debug: Monitor questions state changes
  useEffect(() => {
    console.log('Questions state changed:', localOverrides.questions);
  }, [localOverrides.questions]);
  
  // Initialize local overrides with existing values or global template values
  useEffect(() => {
    const questions = (module.templateOverrides?.questions || globalTemplate?.content.questions || []).map(q => ({
      ...q,
      typeSelectorOpen: false // Ensure all questions have this property initialized
    }));
    
    const initialOverrides: LocalOverrides = {
      title: module.templateOverrides?.title || globalTemplate?.content.title || '',
      subtitle: module.templateOverrides?.subtitle || globalTemplate?.content.subtitle || '',
      centerTitle: module.templateOverrides?.centerTitle || globalTemplate?.content.centerTitle || false,
      questions
    };
    
    setLocalOverrides(initialOverrides);
    setHasChanges(false);
  }, [module, globalTemplate]);

  // Check if there are unsaved changes
  useEffect(() => {
    const original = module.templateOverrides || {};
    const current = localOverrides;
    
    const changed = JSON.stringify(original) !== JSON.stringify(current);
    setHasChanges(changed);
  }, [localOverrides, module.templateOverrides]);

  const handleSave = async () => {
    try {
      await onSave(module.id, localOverrides);
      // Close the panel after successful save
      onClose();
    } catch (error) {
      console.error('Failed to save configuration:', error);
      // Keep the panel open if there's an error
    }
  };

  const handleReset = () => {
    const initialOverrides: LocalOverrides = {
      title: globalTemplate?.content.title || '',
      subtitle: globalTemplate?.content.subtitle || '',
      centerTitle: globalTemplate?.content.centerTitle || false,
      questions: globalTemplate?.content.questions || []
    };
    setLocalOverrides(initialOverrides);
    setHasChanges(true);
  };

  const updateField = (field: keyof LocalOverrides, value: any) => {
    setLocalOverrides(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    console.log('updateQuestion called:', { index, field, value });
    console.log('Current questions:', localOverrides.questions);
    
    setLocalOverrides(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
      
      console.log('Updated question at index', index, ':', updatedQuestions[index]);
      console.log('All updated questions:', updatedQuestions);
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const addQuestion = () => {
    const newQuestion = {
      id: `question_${Date.now()}`,
      text: 'New Question',
      type: 'text' as const,
      required: false,
      typeSelectorOpen: false
    };
    
    const questions = [...localOverrides.questions, newQuestion];
    updateField('questions', questions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = localOverrides.questions.filter((_, i) => i !== index);
    updateField('questions', updatedQuestions);
  };

  const moveQuestionUp = (index: number) => {
    if (index === 0) return; // Can't move first item up
    
    setLocalOverrides(prev => {
      const updatedQuestions = [...prev.questions];
      const temp = updatedQuestions[index];
      updatedQuestions[index] = updatedQuestions[index - 1];
      updatedQuestions[index - 1] = temp;
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const moveQuestionDown = (index: number) => {
    if (index === localOverrides.questions.length - 1) return; // Can't move last item down
    
    setLocalOverrides(prev => {
      const updatedQuestions = [...prev.questions];
      const temp = updatedQuestions[index];
      updatedQuestions[index] = updatedQuestions[index + 1];
      updatedQuestions[index + 1] = temp;
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-[60]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Edit content</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">Edit {module.name} module at the flow level. The global template will not be affected.</p>
      </div>

      {/* Content */}
      <div className="p-6 pt-4 space-y-6">
        {/* Basic Fields - Hidden for Assessment and Video Interview modules */}
        {module.component !== 'AssessmentStep' && !localOverrides.questions.some(q => q.type === 'video-interview') && (
          <div className="space-y-3">
            {/* <h3 className="text-md font-medium text-gray-900">Basic Configuration</h3> */}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={localOverrides.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter title"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <textarea
                value={localOverrides.subtitle}
                onChange={(e) => updateField('subtitle', e.target.value)}
                placeholder="Enter subtitle"
                rows={3}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localOverrides.centerTitle}
                  onChange={(e) => updateField('centerTitle', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Center title and subtitle</span>
              </label>
              
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Elements</h3>
            <button
  onClick={addQuestion}
  className="flex items-center text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors duration-200"
>
  <Plus className="w-4 h-4 mr-1" />
  Add Element
</button>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 space-y-2 border border-gray-200">
          {localOverrides.questions.map((question, index) => (
          
            <div key={question.id} className="border border-gray-200 bg-white rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
              <div className="relative">
              <button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    console.log('Button clicked for index:', index, 'Current typeSelectorOpen:', question.typeSelectorOpen);
    updateQuestion(index, 'typeSelectorOpen', !question.typeSelectorOpen);
  }}
  className="w-auto inline-flex px-1 py-1 text-sm text-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
>
  <div className="flex items-center space-x-2">
    {question.type === 'text' && <Type className="w-4 h-4" />}
    {question.type === 'textarea' && <FileText className="w-4 h-4" />}
    {question.type === 'select' && <ChevronDown className="w-4 h-4" />}
    {question.type === 'radio' && <Circle className="w-4 h-4" />}
    {question.type === 'checkbox' && <CheckSquare className="w-4 h-4" />}
    {question.type === 'file' && <FolderOpen className="w-4 h-4" />}
    {question.type === 'image' && <Image className="w-4 h-4" />}
    {question.type === 'phone' && <Phone className="w-4 h-4" />}
    {question.type === 'interview-scheduler' && <Calendar className="w-4 h-4" />}
    {question.type === 'message' && <MessageSquare className="w-4 h-4" />}
    {question.type === 'assessment' && <ClipboardList className="w-4 h-4" />}
    {question.type === 'video-interview' && <Video className="w-4 h-4" />}
    <span>
      {question.type === 'text' && 'Text input'}
      {question.type === 'textarea' && 'Text Area'}
      {question.type === 'select' && 'Dropdown input'}
      {question.type === 'radio' && 'Radio Buttons'}
      {question.type === 'checkbox' && 'Checkboxes'}
      {question.type === 'file' && 'File uploader'}
      {question.type === 'image' && 'Image Upload'}
      {question.type === 'phone' && 'Phone Number'}
      {question.type === 'interview-scheduler' && 'Interview Scheduler'}
      {question.type === 'message' && 'Message'}
      {question.type === 'assessment' && 'Assessments'}
      {question.type === 'video-interview' && 'Video Interview'}
    </span>
  </div>
  <ChevronDown className="w-4 h-4 ml-2 text-indigo-700" />
</button>

                
                {/* Dropdown Menu */}
                {question.typeSelectorOpen && (
                  <div className="absolute w-60 top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    <div 
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Text option clicked for index:', index);
                        updateQuestion(index, 'type', 'text');
                        updateQuestion(index, 'typeSelectorOpen', false);
                      }}
                    >
                      <Type className="w-4 h-4" />
                      <span>Text input</span>
                    </div>
                    <div 
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuestion(index, 'type', 'textarea');
                        updateQuestion(index, 'typeSelectorOpen', false);
                      }}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Text Area</span>
                    </div>
                    <div 
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuestion(index, 'type', 'select');
                        updateQuestion(index, 'typeSelectorOpen', false);
                      }}
                    >
                      <ChevronDown className="w-4 h-4" />
                      <span>Dropdown input</span>
                    </div>
                    <div 
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuestion(index, 'type', 'radio');
                        updateQuestion(index, 'typeSelectorOpen', false);
                      }}
                    >
                      <Circle className="w-4 h-4" />
                      <span>Radio Buttons</span>
                    </div>
                    <div 
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuestion(index, 'type', 'checkbox');
                        updateQuestion(index, 'typeSelectorOpen', false);
                      }}
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Checkboxes</span>
                    </div>
                    <div 
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuestion(index, 'type', 'file');
                        updateQuestion(index, 'typeSelectorOpen', false);
                      }}
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>File uploader</span>
                    </div>
                    <div 
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuestion(index, 'type', 'image');
                        updateQuestion(index, 'typeSelectorOpen', false);
                      }}
                    >
                      <Image className="w-4 h-4" />
                      <span>Image Upload</span>
                    </div>
                    <div 
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuestion(index, 'type', 'phone');
                        updateQuestion(index, 'typeSelectorOpen', false);
                      }}
                    >
                      <Phone className="w-4 h-4" />
                      <span>Phone Number</span>
                    </div>
                    <div 
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuestion(index, 'type', 'interview-scheduler');
                        updateQuestion(index, 'typeSelectorOpen', false);
                      }}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Interview Scheduler</span>
                    </div>
                    <div 
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuestion(index, 'type', 'message');
                        updateQuestion(index, 'typeSelectorOpen', false);
                      }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message</span>
                    </div>
                    <div 
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuestion(index, 'type', 'assessment');
                        updateQuestion(index, 'typeSelectorOpen', false);
                      }}
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>Assessments</span>
                    </div>
                    <div 
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuestion(index, 'type', 'video-interview');
                        updateQuestion(index, 'typeSelectorOpen', false);
                      }}
                    >
                      <Video className="w-4 h-4" />
                      <span>Video Interview</span>
                    </div>
                  </div>
                )}
              </div>

                                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => moveQuestionUp(index)}
                    disabled={index === 0}
                    className={`p-1 rounded transition-colors duration-200 ${
                      index === 0 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveQuestionDown(index)}
                    disabled={index === localOverrides.questions.length - 1}
                    className={`p-1 rounded transition-colors duration-200 ${
                      index === localOverrides.questions.length - 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    title="Move down"
                  >
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeQuestion(index)}
                    className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                    title="Delete element"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Element Type Selector */}
             
              {/* Element Text Input - Hidden for image, message, assessment, and video-interview types */}
              {question.type !== 'image' && question.type !== 'message' && question.type !== 'assessment' && question.type !== 'video-interview' && (
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                  placeholder="Element text"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}

              {/* Assessment Configuration - Only for assessment type */}
              {question.type === 'assessment' && (
                <div className="mt-3">
                  <AssessmentConfiguration
                    question={question}
                    onUpdate={(updatedQuestion) => updateQuestion(index, 'assessmentConfig', updatedQuestion)}
                  />
                </div>
              )}

              {/* Video Interview Configuration - Only for video-interview type */}
              {question.type === 'video-interview' && (
                <div className="mt-3">
                  <VideoInterviewConfiguration
                    question={question}
                    onUpdate={(updatedQuestion) => updateQuestion(index, 'videoInterviewConfig', updatedQuestion)}
                  />
                </div>
              )}

            

              {/* Options for select, radio, and checkbox questions */}
              {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-gray-600">Options</label>
                    <button
                      type="button"
                      onClick={() => {
                        const currentOptions = question.options || [];
                        updateQuestion(index, 'options', [...currentOptions, '']);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(question.options || []).map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(question.options || [])];
                            newOptions[optionIndex] = e.target.value;
                            updateQuestion(index, 'options', newOptions);
                          }}
                          placeholder={`Option ${optionIndex + 1}`}
                          className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = question.options?.filter((_, i) => i !== optionIndex) || [];
                            updateQuestion(index, 'options', newOptions);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(!question.options || question.options.length === 0) && (
                      <div className="text-xs text-gray-500 italic">
                        Click "Add Option" to add choices
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Layout selection for radio questions */}
              {question.type === 'radio' && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-2">Layout</label>
                  <div className="inline-flex space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => updateQuestion(index, 'layout', 'vertical')}
                      className={`
                        px-3 py-1 text-xs rounded-md transition-colors duration-200
                        ${(question.layout || 'vertical') === 'vertical'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                        }
                      `}
                    >
                      Vertical
                    </button>
                    <button
                      type="button"
                      onClick={() => updateQuestion(index, 'layout', 'horizontal')}
                      className={`
                        px-3 py-1 text-xs rounded-md transition-colors duration-200
                        ${question.layout === 'horizontal'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                        }
                      `}
                    >
                      Horizontal
                    </button>
                  </div>
                </div>
              )}

              {/* Image Configuration for Image type */}
              {question.type === 'image' && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-2">Image Upload</label>
                  <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                    <div className="text-center">
                     
                      {question.content && (
                        <div className="mb-3">
                          <img 
                            src={question.content} 
                            alt="Uploaded image" 
                            className="max-w-full h-auto max-h-32 rounded border"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              updateQuestion(index, 'content', e.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                  
                </div>
              )}

              {/* Interview Scheduler Info */}
              {question.type === 'interview-scheduler' && (
                <div className="mt-3">
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                    The calendar widget will be displayed
                  </div>
                </div>
              )}

              {/* Rich Text Editor for Message type */}
              {question.type === 'message' && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-2">Message Content</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="flex border-b border-gray-200 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = document.getElementById(`message-${question.id}`) as HTMLTextAreaElement;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const before = text.substring(0, start);
                            const selected = text.substring(start, end);
                            const after = text.substring(end);
                            textarea.value = before + '**' + selected + '**' + after;
                            textarea.focus();
                            textarea.setSelectionRange(start + 2, end + 2);
                          }
                        }}
                        className="px-3 py-2 text-sm font-semibold hover:bg-gray-100 transition-colors duration-200"
                        title="Bold (Ctrl+B)"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = document.getElementById(`message-${question.id}`) as HTMLTextAreaElement;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const before = text.substring(0, start);
                            const selected = text.substring(start, end);
                            const after = text.substring(end);
                            textarea.value = before + '*' + selected + '*' + after;
                            textarea.focus();
                            textarea.setSelectionRange(start + 1, end + 1);
                          }
                        }}
                        className="px-3 py-2 text-sm italic hover:bg-gray-100 transition-colors duration-200"
                        title="Italic (Ctrl+I)"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = document.getElementById(`message-${question.id}`) as HTMLTextAreaElement;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const before = text.substring(0, start);
                            const selected = text.substring(start, end);
                            const after = text.substring(end);
                            textarea.value = before + '\n' + selected + '\n' + after;
                            textarea.focus();
                            textarea.setSelectionRange(start + 1, end + 1);
                          }
                        }}
                        className="px-3 py-2 text-sm hover:bg-gray-100 transition-colors duration-200"
                        title="New Line"
                      >
                        ↵
                      </button>
                      
                      {/* Text Alignment Buttons */}
                      <div className="flex border-l border-gray-300 ml-2">
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById(`message-${question.id}`) as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const text = textarea.value;
                              const before = text.substring(0, start);
                              const selected = text.substring(start, end);
                              const after = text.substring(end);
                              textarea.value = before + '<left>' + selected + '</left>' + after;
                              textarea.focus();
                              textarea.setSelectionRange(start + 7, end + 7);
                            }
                          }}
                          className="px-3 py-2 text-sm hover:bg-gray-100 transition-colors duration-200 border-r border-gray-300"
                          title="Left Align"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.getElementById(`message-${question.id}`) as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const text = textarea.value;
                              const before = text.substring(0, start);
                              const selected = text.substring(start, end);
                              const after = text.substring(end);
                              textarea.value = before + '<center>' + selected + '</center>' + after;
                              textarea.focus();
                              textarea.setSelectionRange(start + 8, end + 8);
                            }
                          }}
                          className="px-3 py-2 text-sm hover:bg-gray-100 transition-colors duration-200"
                          title="Center Align"
                        >
                          ↔
                        </button>
                      </div>
                    </div>
                    <textarea
                      id={`message-${question.id}`}
                      value={question.content || ''}
                      onChange={(e) => updateQuestion(index, 'content', e.target.value)}
                      placeholder="Enter your message content. Use **bold**, *italic*, and newlines for formatting."
                      rows={6}
                      className="w-full px-3 py-2 border-0 focus:outline-none focus:ring-0 resize-vertical"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use **text** for bold, *text* for italic, press Enter for new lines, and select text + click alignment buttons for positioning
                  </p>
                </div>
              )}

              {/* Half-size checkbox for text and select inputs */}
              {(question.type === 'text' || question.type === 'select') && (
                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={question.halfWidth || false}
                      onChange={(e) => updateQuestion(index, 'halfWidth', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-xs text-gray-600">Half-size input</span>
                  </label>
                </div>
              )}
            </div>
           
          ))}
           </div>

          {localOverrides.questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No elements configured</p>
              <p className="text-sm">Add custom elements or use global template elements</p>
            </div>
          )}
        </div>

        {/* Global Template Info */}
       
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3 z-[60]">
        <div className="flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-0 text-sm py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-1 py-2 text-gray-600 text-sm hover:text-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex items-center space-x-2 text-sm px-4 py-1.5 rounded-lg transition-colors duration-200 ${
                hasChanges
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}