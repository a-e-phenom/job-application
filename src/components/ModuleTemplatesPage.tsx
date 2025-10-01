import React, { useState } from 'react';
import { ArrowLeft, X, Check, Plus, Airplay, Type, FileText, ChevronDown, ChevronUp, Circle, CheckSquare, FolderOpen, Image, Phone, Calendar, MessageSquare, ClipboardList, Video, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTemplates, ModuleTemplate } from '../hooks/useTemplates';
import GenericModuleRenderer from './GenericModuleRenderer';
import ImageUploadComponent from './ImageUploadComponent';

// Assessment Screen Types
type AssessmentScreenType = 'welcome' | 'best-worst' | 'agree-scale' | 'single-select';

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
                    <label className="block text-xs font-medium text-gray-600 mb-1">Image</label>
                    <ImageUploadComponent
                      value={screen.content.welcomeImage || ''}
                      onChange={(value) => updateScreenContent(screen.id, { welcomeImage: value })}
                      placeholder="https://example.com/welcome-image.png"
                      label="Welcome Image"
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
                    <label className="block text-xs font-medium text-gray-600 mb-1">Scenario Image</label>
                    <ImageUploadComponent
                      value={screen.content.scenarioImage || ''}
                      onChange={(value) => updateScreenContent(screen.id, { scenarioImage: value })}
                      placeholder="https://example.com/scenario-image.png"
                      label="Scenario Image"
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Time Limit (seconds)</label>
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

export default function ModuleTemplatesPage() {
  const { templates, loading, error, createTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<ModuleTemplate | null>(null);
  const [editedTemplate, setEditedTemplate] = useState<ModuleTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('edit');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing] = useState(true);
  const [saveFeedback, setSaveFeedback] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null); // Track which template to delete
  const navigate = useNavigate();

  const handleSelectTemplate = (template: ModuleTemplate) => {
    setIsCreatingNew(false);
    setSelectedTemplate(template);
    setEditedTemplate({ ...template });
  };

  const handleSaveTemplate = async () => {
    if (!editedTemplate) return;

    setSaveFeedback('saving');
    try {
      if (isCreatingNew) {
        // Generate unique component name based on module name
        const componentName = generateUniqueComponentName(editedTemplate.name, templates);
        
        await createTemplate({
          name: editedTemplate.name,
          description: editedTemplate.description,
          component: componentName,
          content: editedTemplate.content
        });
        setIsCreatingNew(false);
      } else {
        await updateTemplate(editedTemplate.id, {
          name: editedTemplate.name,
          description: editedTemplate.description,
          component: editedTemplate.component,
          content: editedTemplate.content
        });
      }
      setSelectedTemplate(editedTemplate);
      setSaveFeedback('success');
      
      // Reset success feedback after 2 seconds
      setTimeout(() => setSaveFeedback('idle'), 2000);
    } catch (error) {
      console.error('Failed to save template:', error);
      setSaveFeedback('error');
      
      // Reset error feedback after 3 seconds
      setTimeout(() => setSaveFeedback('idle'), 3000);
    }
  };


  const generateUniqueComponentName = (baseName: string, existingTemplates: ModuleTemplate[]): string => {
    // Convert module name to a valid component name (remove spaces, special chars, capitalize)
    const cleanName = baseName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '') // Remove spaces
      .replace(/^[a-z]/, (char) => char.toUpperCase()); // Capitalize first letter
    
    let componentName = cleanName || 'CustomStep';
    let counter = 1;
    
    // Check if component name already exists and add number if needed
    while (existingTemplates.some(template => template.component === componentName)) {
      componentName = `${cleanName || 'CustomStep'}${counter}`;
      counter++;
    }
    
    return componentName;
  };

  const handleCreateNew = () => {
    const newTemplate: ModuleTemplate = {
      id: '',
      name: 'New Module',
      description: 'Custom module description',
      component: '', // Will be generated when saving
      content: {
        title: 'New Module Title',
        subtitle: 'Module subtitle',
        centerTitle: false,
        questions: []
      },
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setIsCreatingNew(true);
    setSelectedTemplate(null);
    setEditedTemplate(newTemplate);
    setActiveTab('edit');
  };


  const handleDeleteClick = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    setShowDeleteConfirm(templateId);
  };

  const handleDeleteConfirm = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      
      // Clear selection if deleted template was selected
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
        setEditedTemplate(null);
        setIsCreatingNew(false);
      }
      
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(null);
  };

  const updateEditedTemplate = (field: string, value: any) => {
    if (!editedTemplate) return;
    
    if (field.startsWith('content.')) {
      const contentField = field.replace('content.', '');
      setEditedTemplate(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          content: {
            ...prev.content,
            [contentField]: value
          }
        };
      });
    } else {
      setEditedTemplate(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [field]: value
        };
      });
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      id: `element_${Date.now()}`,
      text: 'New Element',
      type: 'text' as const,
      required: false,
      typeSelectorOpen: false
    };

    setEditedTemplate(prev => ({
      ...prev!,
      content: {
        ...prev!.content,
        questions: [...(prev!.content.questions || []), newQuestion]
      }
    }));
  };

  const removeQuestion = (questionId: string) => {
    if (!editedTemplate) return;
    
    setEditedTemplate(prev => ({
      ...prev!,
      content: {
        ...prev!.content,
        questions: prev!.content.questions?.filter(q => q.id !== questionId) || []
      }
    }));
  };

  const updateQuestion = (questionId: string, field: string, value: any) => {
    if (!editedTemplate) return;
    
    setEditedTemplate(prev => ({
      ...prev!,
      content: {
        ...prev!.content,
        questions: prev!.content.questions?.map(q => 
          q.id === questionId ? { ...q, [field]: value } : q
        ) || []
      }
    }));
  };

  const moveQuestionUp = (index: number) => {
    if (!editedTemplate || index === 0) return;
    
    const questions = [...(editedTemplate.content.questions || [])];
    const temp = questions[index];
    questions[index] = questions[index - 1];
    questions[index - 1] = temp;
    
    setEditedTemplate(prev => ({
      ...prev!,
      content: {
        ...prev!.content,
        questions
      }
    }));
  };

  const moveQuestionDown = (index: number) => {
    if (!editedTemplate || index === (editedTemplate.content.questions || []).length - 1) return;
    
    const questions = [...(editedTemplate.content.questions || [])];
    const temp = questions[index];
    questions[index] = questions[index + 1];
    questions[index + 1] = temp;
    
    setEditedTemplate(prev => ({
      ...prev!,
      content: {
        ...prev!.content,
        questions
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border border-b border-gray-200">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
               
              </button>
             
              <div>
                <h1 className="text-lg font-semibold text-gray-700">Module Templates</h1>
                <p className="text-[#637085] text-sm mt-0">Customize the content and behavior of your application modules</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        <div className="bg-white">
          <div className="flex ">
            {/* Left sidebar - Module list */}
            <div className="w-1/4 border-r border-gray-200 overflow-y-auto">
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading templates...</div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-2">Error: {error}</div>
                    <p className="text-sm text-gray-500">Please make sure you're connected to Supabase</p>
                  </div>
                ) : (
                <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900">Modules</h3>
                  <button
                    onClick={handleCreateNew}
                    className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`
                        w-full p-3 rounded-xl border transition-colors duration-200 relative group
                        ${(selectedTemplate?.id === template.id && !isCreatingNew) || (isCreatingNew && editedTemplate?.id === template.id)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200'
                        }
                      `}
                    >
                      <div 
                        onClick={() => handleSelectTemplate(template)}
                        className="cursor-pointer flex items-center justify-between"
                      >
                        <h4 className="font-medium text-sm text-gray-900">{template.name}</h4>
                        
                        {/* Delete button for custom templates */}
                        {!template.isDefault && (
                          <button
                            onClick={(e) => handleDeleteClick(e, template.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700"
                            title="Delete template"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* Delete Confirmation Overlay */}
                      {showDeleteConfirm === template.id && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                          <div className="px-3 py-2 mt-1 text-sm text-gray-700">
                            Delete this module?
                          </div>
                          <div className="flex gap-2 px-3 py-2">
                            <button
                              type="button"
                              onClick={handleDeleteCancel}
                              className="flex-1 px-4 py-1.5 text-sm text-gray-600 border border-gray-300 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                            >
                              No
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteConfirm(template.id)}
                              className="flex-1 px-4 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-1 focus:ring-red-300"
                            >
                              Yes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                </>
                )}
              </div>
            </div>

            {/* Right content - Template editor */}
            <div className="flex-1 overflow-y-auto">
              {selectedTemplate || isCreatingNew ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {isCreatingNew ? 'Create New Module' : ` ${selectedTemplate?.name}`}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleSaveTemplate}
                        disabled={saveFeedback === 'saving'}
                        className={`
                          flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                          ${saveFeedback === 'success' 
                            ? 'bg-green-600 text-white' 
                            : saveFeedback === 'error'
                            ? 'bg-red-600 text-white'
                            : saveFeedback === 'saving'
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }
                        `}
                      >
                        {saveFeedback === 'saving' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Saving...</span>
                          </>
                        ) : saveFeedback === 'success' ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Saved!</span>
                          </>
                        ) : saveFeedback === 'error' ? (
                          <>
                            <X className="w-4 h-4" />
                            <span>Error</span>
                          </>
                        ) : (
                          <span>{isCreatingNew ? 'Create Module' : 'Save'}</span>
                        )}
                      </button>
                      
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-200 mb-6">
                    <button
                      onClick={() => setActiveTab('edit')}
                      className={`
                        px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200
                        ${activeTab === 'edit'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`
                        px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ml-6
                        ${activeTab === 'preview'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      Preview
                    </button>
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'edit' ? (
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Module Name</label>
                        <input
                          type="text"
                          value={editedTemplate?.name || ''}
                          onChange={(e) => updateEditedTemplate('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          A unique component name will be automatically generated based on this name
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={editedTemplate?.description || ''}
                          onChange={(e) => updateEditedTemplate('description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-vertical"
                        />
                      </div>

                      {/* Content */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">Content Settings</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                              type="text"
                              value={editedTemplate?.content.title || ''}
                              onChange={(e) => updateEditedTemplate('content.title', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                            <input
                              type="text"
                              value={editedTemplate?.content.subtitle || ''}
                              onChange={(e) => updateEditedTemplate('content.subtitle', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Center Title and Subtitle Checkbox */}
                        <div className="mb-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editedTemplate?.content.centerTitle || false}
                              onChange={(e) => updateEditedTemplate('content.centerTitle', e.target.checked)}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Center title and subtitle</span>
                          </label>
                        </div>

                        {/* Questions */}
                        {(editedTemplate?.content.questions !== undefined || editedTemplate?.component === 'InterviewSchedulingStep' || editedTemplate?.component === 'AssessmentStep' || editedTemplate?.component === 'VideoInterviewStep') && (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-medium text-gray-700">Elements</h5>
                              <button
                                onClick={addQuestion}
                                className="text-sm text-indigo-600 hover:text-indigo-700"
                              >
                                + Add Element
                              </button>
                            </div>
                            
                            <div className="space-y-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
                              {(editedTemplate.content.questions || []).map((question, index) => (
                                <div 
                                  key={question.id}
                                  className="border bg-white rounded-lg p-3 pb-6 transition-all duration-200 border-gray-200"
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className="flex-1">
                                      {/* First Row: Type Dropdown, Reorder Buttons, and Delete Button */}
                                      <div className="flex items-center justify-between mb-3">
                                        {/* Question Type Dropdown */}
                                        <div className="relative">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateQuestion(question.id, 'typeSelectorOpen', !question.typeSelectorOpen)
                                            }
                                            className="w-auto inline-flex px-1 py-1 text-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-between"
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
                                                {question.type === 'textarea' && 'Textarea'}
                                                {question.type === 'select' && 'Dropdown input'}
                                                {question.type === 'radio' && 'Radio'}
                                                {question.type === 'checkbox' && 'Checkbox'}
                                                {question.type === 'file' && 'File uploader'}
                                                {question.type === 'image' && 'Image'}
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
                                            <div className="absolute w-60 top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                              <div 
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                                                onClick={() => {
                                                  updateQuestion(question.id, 'type', 'text');
                                                  updateQuestion(question.id, 'typeSelectorOpen', false);
                                                }}
                                              >
                                                <Type className="w-4 h-4" />
                                                <span>Text input</span>
                                              </div>
                                              <div 
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                                                onClick={() => {
                                                  updateQuestion(question.id, 'type', 'textarea');
                                                  updateQuestion(question.id, 'typeSelectorOpen', false);
                                                }}
                                              >
                                                <FileText className="w-4 h-4" />
                                                <span>Textarea</span>
                                              </div>
                                              <div 
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                                                onClick={() => {
                                                  updateQuestion(question.id, 'type', 'select');
                                                  updateQuestion(question.id, 'typeSelectorOpen', false);
                                                }}
                                              >
                                                <ChevronDown className="w-4 h-4" />
                                                <span>Dropdown input</span>
                                              </div>
                                              <div 
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                                                onClick={() => {
                                                  updateQuestion(question.id, 'type', 'radio');
                                                  updateQuestion(question.id, 'typeSelectorOpen', false);
                                                }}
                                              >
                                                <Circle className="w-4 h-4" />
                                                <span>Radio</span>
                                              </div>
                                              <div 
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                                                onClick={() => {
                                                  updateQuestion(question.id, 'type', 'checkbox');
                                                  updateQuestion(question.id, 'typeSelectorOpen', false);
                                                }}
                                              >
                                                <CheckSquare className="w-4 h-4" />
                                                <span>Checkbox</span>
                                              </div>
                                              <div 
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                                                onClick={() => {
                                                  updateQuestion(question.id, 'type', 'file');
                                                  updateQuestion(question.id, 'typeSelectorOpen', false);
                                                }}
                                              >
                                                <FolderOpen className="w-4 h-4" />
                                                <span>File uploader</span>
                                              </div>
                                              <div 
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                                                onClick={() => {
                                                  updateQuestion(question.id, 'type', 'image');
                                                  updateQuestion(question.id, 'typeSelectorOpen', false);
                                                }}
                                              >
                                                <Image className="w-4 h-4" />
                                                <span>Image</span>
                                              </div>
                                              <div 
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                                                onClick={() => {
                                                  updateQuestion(question.id, 'type', 'phone');
                                                  updateQuestion(question.id, 'typeSelectorOpen', false);
                                                }}
                                              >
                                                <Phone className="w-4 h-4" />
                                                <span>Phone Number</span>
                                              </div>
                                              <div 
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                                                onClick={() => {
                                                  updateQuestion(question.id, 'type', 'interview-scheduler');
                                                  updateQuestion(question.id, 'typeSelectorOpen', false);
                                                }}
                                              >
                                                <Calendar className="w-4 h-4" />
                                                <span>Interview Scheduler</span>
                                              </div>
                                              <div 
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                                                onClick={() => {
                                                  updateQuestion(question.id, 'type', 'message');
                                                  updateQuestion(question.id, 'typeSelectorOpen', false);
                                                }}
                                              >
                                                <MessageSquare className="w-4 h-4" />
                                                <span>Message</span>
                                              </div>
                                              <div 
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                                                onClick={() => {
                                                  updateQuestion(question.id, 'type', 'assessment');
                                                  updateQuestion(question.id, 'typeSelectorOpen', false);
                                                }}
                                              >
                                                <ClipboardList className="w-4 h-4" />
                                                <span>Assessments</span>
                                              </div>
                                              <div 
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                                                onClick={() => {
                                                  updateQuestion(question.id, 'type', 'video-interview');
                                                  updateQuestion(question.id, 'typeSelectorOpen', false);
                                                }}
                                              >
                                                <Video className="w-4 h-4" />
                                                <span>Video Interview</span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {/* Reorder Buttons and Delete Button */}
                                        <div className="flex items-center space-x-2">
                                          {/* Up Arrow */}
                                          <button
                                            onClick={() => moveQuestionUp(index)}
                                            disabled={index === 0}
                                            className={`p-1 rounded transition-colors duration-200 ${
                                              index === 0 
                                                ? 'text-gray-300 cursor-not-allowed' 
                                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                            }`}
                                            title="Move up"
                                          >
                                            <ChevronUp className="w-4 h-4" />
                                          </button>
                                          
                                          {/* Down Arrow */}
                                          <button
                                            onClick={() => moveQuestionDown(index)}
                                            disabled={index === (editedTemplate.content.questions || []).length - 1}
                                            className={`p-1 rounded transition-colors duration-200 ${
                                              index === (editedTemplate.content.questions || []).length - 1
                                                ? 'text-gray-300 cursor-not-allowed' 
                                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                            }`}
                                            title="Move down"
                                          >
                                            <ChevronDown className="w-4 h-4" />
                                          </button>
                                          
                                          {/* Delete Button */}
                                          <button
                                            onClick={() => removeQuestion(question.id)}
                                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                      
                                      {/* Question Text Input - Only for non-image, non-message, and non-assessment types */}
                                      {question.type !== 'image' && question.type !== 'message' && question.type !== 'interview-scheduler' && question.type !== 'assessment' && question.type !== 'video-interview' && (
                                        <div className="mb-3">
                                          <input
                                            type="text"
                                            value={question.text}
                                            onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                                            placeholder="Element text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          />
                                        </div>
                                      )}
                                      
                                      {/* Interview Scheduler Info - Only for interview-scheduler type */}
                                      {question.type === 'interview-scheduler' && (
                                        <div className="mb-3">
                                          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                                            The calendar widget will be displayed
                                          </div>
                                        </div>
                                      )}

                                      {/* Assessment Configuration - Only for assessment type */}
                                      {question.type === 'assessment' && (
                                        <div className="mt-3">
                                          <AssessmentConfiguration
                                            question={question}
                                            onUpdate={(updatedQuestion) => updateQuestion(question.id, 'assessmentConfig', updatedQuestion)}
                                          />
                                        </div>
                                      )}

                                      {/* Video Interview Configuration - Only for video-interview type */}
                                      {question.type === 'video-interview' && (
                                        <div className="mt-3">
                                          <VideoInterviewConfiguration
                                            question={question}
                                            onUpdate={(updatedQuestion) => updateQuestion(question.id, 'videoInterviewConfig', updatedQuestion)}
                                          />
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
                                              onChange={(e) => updateQuestion(question.id, 'content', e.target.value)}
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
                                                    className="w-[500px] h-auto rounded border"
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
                                                      updateQuestion(question.id, 'content', e.target?.result as string);
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
                                    
                                      {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                                        <div className="mt-3">
                                          <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs font-medium text-gray-600">Options</label>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const currentOptions = question.options || [];
                                                updateQuestion(question.id, 'options', [...currentOptions, '']);
                                              }}
                                              className="text-xs text-indigo-600 hover:text-indigo-700"
                                            >
                                              + Add Option
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
                                                    updateQuestion(question.id, 'options', newOptions);
                                                  }}
                                                  placeholder={`Option ${optionIndex + 1}`}
                                                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const newOptions = question.options?.filter((_, i) => i !== optionIndex) || [];
                                                    updateQuestion(question.id, 'options', newOptions);
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
                                              onClick={() => updateQuestion(question.id, 'layout', 'vertical')}
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
                                              onClick={() => updateQuestion(question.id, 'layout', 'horizontal')}
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

                                      {/* Half-size checkbox for text and select inputs */}
                                      {(question.type === 'text' || question.type === 'select') && (
                                        <div className="mt-3 mx-7">
                                          <label className="flex items-center">
                                            <input
                                              type="checkbox"
                                              checked={question.halfWidth || false}
                                              onChange={(e) => updateQuestion(question.id, 'halfWidth', e.target.checked)}
                                              disabled={!isEditing}
                                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
                                            />
                                            <span className="ml-2 text-xs text-gray-600">Half-size input</span>
                                          </label>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}


                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Preview Header */}
                      <div className="max-w-2xl mx-auto">
                        {editedTemplate && (
                          <GenericModuleRenderer
                            template={editedTemplate}
                            primaryColor="#6366F1"
                            onNext={() => {}}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
  {/* Icon in gray box */}
  <div className="bg-gray-50 rounded-xl p-3  mb-3">
    <Airplay className="w-6 h-6 text-gray-500" />
  </div>

  {/* Text */}
  <p className="text-sm text-center">
    Select a module template to edit or create a new one
  </p>
</div>

              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}