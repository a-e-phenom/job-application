import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Plus, Type, FileText, ChevronDown, Circle, CheckSquare, FolderOpen, Image, Phone, Calendar, AlignLeft, ClipboardList, Video, ChevronUp, ChevronDown as ChevronDownIcon, MoveUp, MoveDown, Trash2 } from 'lucide-react';
import { FlowModule } from '../types/flow';
import { ModuleTemplate } from '../hooks/useTemplates';
import ImageUploadComponent from './ImageUploadComponent';

interface LocalOverrides {
  title: string;
  subtitle: string;
  centerTitle: boolean;
  splitScreenWithImage: boolean;
  splitScreenImage?: string;
  splitScreenImagePosition?: 'left' | 'right';
  imageSideHasTitleSubtitle?: boolean;
  imageSideTitle?: string;
  imageSideSubtitle?: string;
  comments: string;
  customButtons?: Array<{
    id: string;
    label: string;
    isPrimary: boolean;
  }>;
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
  }>;
}

// Assessment Screen Types
type AssessmentScreenType = 'welcome' | 'best-worst' | 'agree-scale' | 'single-select' | 'language-reading' | 'language-listening' | 'language-typing';

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
    
    // Language reading screen
    languageReadingTitle?: string;
    languageReadingQuestion?: string;
    languageReadingDescription?: string;
    languageReadingOptions?: string[];
    
    // Language listening screen
    languageListeningTitle?: string;
    languageListeningQuestion?: string;
    languageListeningDescription?: string;
    languageListeningOptions?: string[];
    
    // Language typing screen
    languageTypingTitle?: string;
    languageTypingQuestion?: string;
    languageTypingText?: string;
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
      case 'language-reading': return 'Language-Reading';
      case 'language-listening': return 'Language - Listening';
      case 'language-typing': return 'Language - Typing';
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
      case 'language-reading':
        return {
          languageReadingTitle: 'Reading Question',
          languageReadingQuestion: 'Read the passage and answer the question.',
          languageReadingDescription: `Ana Martinez from "Customers First" explains three of the skills and qualities necessary for a successful career in customer service: "If you want to work in customer service, you have to have good communication skills. 

In my opinion, this is essential. You need to be able to listen to your customers and understand what they are saying. You need to be able to answer questions efficiently without mumbling or losing focus.

I think the second most important quality is patience. When you're dealing with an unhappy customer, you need to keep cool. Try to see difficult situations as an opportunity to turn a problem into something positive.

Last but not least, it's important for customer service representatives to be knowledgeable abput the product or services they are providing. If you don't have in-depth knowledge, how can you expect to be  able to provide quality customer service?"`,
          languageReadingOptions: [
            "It's important to look cool when you are with customers.",
            "It's important to speak clearly when you answer customers' questions.",
            "You don't need to be well-informed about the company's products and services.",
            "Being knowledgeable is the least important of the three skills and qualities."
          ]
        };
      case 'language-listening':
        return {
          languageListeningTitle: 'Listen to the customer voicemail',
          languageListeningQuestion: 'After listening, read the question below and choose the correct answer.',
          languageListeningDescription: 'What amount was the customer charged for their service?',
          languageListeningOptions: ['$47.15', '$14.75', '$46.15', '$14.47']
        };
      case 'language-typing':
        return {
          languageTypingTitle: 'Typing Test',
          languageTypingQuestion: 'Type the following text in the box below as accurately and quickly as possible.',
          languageTypingText: 'The solar system is made up of the sun, eight planets, and countless other objects such as asteroids, comets, and dwarf planets. The sun is the center of the solar system, and everything else revolves around it in their own orbits. The eight planets are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Each planet has its own unique characteristics, such as size, composition, and atmosphere.\nMercury, the closest planet to the sun, is a small, rocky world with extreme temperature variations between its scorching day side and freezing night side. Venus, often called Earth\'s "sister planet," has a thick atmosphere that traps heat, making it one of the hottest planets.'
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

  const addLanguageReadingOption = (screenId: string) => {
    const screen = screens.find(s => s.id === screenId);
    if (screen && screen.type === 'language-reading') {
      const newOptions = [...(screen.content.languageReadingOptions || []), 'New option'];
      updateScreenContent(screenId, { languageReadingOptions: newOptions });
    }
  };

  const updateLanguageReadingOption = (screenId: string, index: number, value: string) => {
    const screen = screens.find(s => s.id === screenId);
    if (screen && screen.type === 'language-reading') {
      const newOptions = [...(screen.content.languageReadingOptions || [])];
      newOptions[index] = value;
      updateScreenContent(screenId, { languageReadingOptions: newOptions });
    }
  };

  const removeLanguageReadingOption = (screenId: string, index: number) => {
    const screen = screens.find(s => s.id === screenId);
    if (screen && screen.type === 'language-reading') {
      const newOptions = (screen.content.languageReadingOptions || []).filter((_, i) => i !== index);
      updateScreenContent(screenId, { languageReadingOptions: newOptions });
    }
  };

  const addLanguageListeningOption = (screenId: string) => {
    const screen = screens.find(s => s.id === screenId);
    if (screen && screen.type === 'language-listening') {
      const newOptions = [...(screen.content.languageListeningOptions || []), 'New option'];
      updateScreenContent(screenId, { languageListeningOptions: newOptions });
    }
  };

  const updateLanguageListeningOption = (screenId: string, index: number, value: string) => {
    const screen = screens.find(s => s.id === screenId);
    if (screen && screen.type === 'language-listening') {
      const newOptions = [...(screen.content.languageListeningOptions || [])];
      newOptions[index] = value;
      updateScreenContent(screenId, { languageListeningOptions: newOptions });
    }
  };

  const removeLanguageListeningOption = (screenId: string, index: number) => {
    const screen = screens.find(s => s.id === screenId);
    if (screen && screen.type === 'language-listening') {
      const newOptions = (screen.content.languageListeningOptions || []).filter((_, i) => i !== index);
      updateScreenContent(screenId, { languageListeningOptions: newOptions });
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
            <option value="language-reading">Language-Reading</option>
            <option value="language-listening">Language - Listening</option>
            <option value="language-typing">Language - Typing</option>
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
                        <div key={responseIndex} className="flex items-start space-x-2">
                          <textarea
                            value={response}
                            onChange={(e) => updateResponseOption(screen.id, responseIndex, e.target.value)}
                            rows={4}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-vertical"
                            placeholder={`Response option ${responseIndex + 1}`}
                          />
                          <button
                            onClick={() => removeResponseOption(screen.id, responseIndex)}
                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 mt-1"
                            title="Remove response option"
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
                        <div key={optionIndex} className="flex items-start space-x-2">
                          <textarea
                            value={option}
                            onChange={(e) => updateSelectOption(screen.id, optionIndex, e.target.value)}
                            rows={2}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-vertical"
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          <button
                            onClick={() => removeSelectOption(screen.id, optionIndex)}
                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 mt-1"
                            title="Remove answer option"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Language-Reading Screen Configuration */}
              {screen.type === 'language-reading' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Question Title</label>
                    <input
                      type="text"
                      value={screen.content.languageReadingTitle || ''}
                      onChange={(e) => updateScreenContent(screen.id, { languageReadingTitle: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Question Text</label>
                    <input
                      type="text"
                      value={screen.content.languageReadingQuestion || ''}
                      onChange={(e) => updateScreenContent(screen.id, { languageReadingQuestion: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description (left-aligned, no background)</label>
                    <textarea
                      value={screen.content.languageReadingDescription || ''}
                      onChange={(e) => updateScreenContent(screen.id, { languageReadingDescription: e.target.value })}
                      rows={3}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-vertical"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-gray-600">Answer Options</label>
                      <button
                        onClick={() => addLanguageReadingOption(screen.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        + Add Option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(screen.content.languageReadingOptions || []).map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-start space-x-2">
                          <textarea
                            value={option}
                            onChange={(e) => updateLanguageReadingOption(screen.id, optionIndex, e.target.value)}
                            rows={2}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-vertical"
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          <button
                            onClick={() => removeLanguageReadingOption(screen.id, optionIndex)}
                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 mt-1"
                            title="Remove answer option"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Language-Listening Screen Configuration */}
              {screen.type === 'language-listening' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Question Title</label>
                    <input
                      type="text"
                      value={screen.content.languageListeningTitle || ''}
                      onChange={(e) => updateScreenContent(screen.id, { languageListeningTitle: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Question Text</label>
                    <input
                      type="text"
                      value={screen.content.languageListeningQuestion || ''}
                      onChange={(e) => updateScreenContent(screen.id, { languageListeningQuestion: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description (centered in gray box)</label>
                    <textarea
                      value={screen.content.languageListeningDescription || ''}
                      onChange={(e) => updateScreenContent(screen.id, { languageListeningDescription: e.target.value })}
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-vertical"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-gray-600">Answer Options</label>
                      <button
                        onClick={() => addLanguageListeningOption(screen.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        + Add Option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(screen.content.languageListeningOptions || []).map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-start space-x-2">
                          <textarea
                            value={option}
                            onChange={(e) => updateLanguageListeningOption(screen.id, optionIndex, e.target.value)}
                            rows={2}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-vertical"
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          <button
                            onClick={() => removeLanguageListeningOption(screen.id, optionIndex)}
                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 mt-1"
                            title="Remove answer option"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Language-Typing Screen Configuration */}
              {screen.type === 'language-typing' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Screen Title</label>
                    <input
                      type="text"
                      value={screen.content.languageTypingTitle || ''}
                      onChange={(e) => updateScreenContent(screen.id, { languageTypingTitle: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Instructions</label>
                    <input
                      type="text"
                      value={screen.content.languageTypingQuestion || ''}
                      onChange={(e) => updateScreenContent(screen.id, { languageTypingQuestion: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Text to Type</label>
                    <textarea
                      value={screen.content.languageTypingText || ''}
                      onChange={(e) => updateScreenContent(screen.id, { languageTypingText: e.target.value })}
                      rows={8}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-vertical"
                      placeholder="Enter the text that users will need to type..."
                    />
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
    splitScreenWithImage: false,
    splitScreenImage: '',
    splitScreenImagePosition: 'right',
    imageSideHasTitleSubtitle: false,
    imageSideTitle: '',
    imageSideSubtitle: '',
    comments: '',
    customButtons: [],
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
    
    // Default splitScreenWithImage to true for VoiceScreeningStep if not set
    const defaultSplitScreen = module.component === 'VoiceScreeningStep' 
      ? (module.templateOverrides?.splitScreenWithImage !== undefined 
          ? module.templateOverrides.splitScreenWithImage 
          : (globalTemplate?.content.splitScreenWithImage !== undefined 
              ? globalTemplate.content.splitScreenWithImage 
              : true))
      : (module.templateOverrides?.splitScreenWithImage || globalTemplate?.content.splitScreenWithImage || false);
    
    const initialOverrides: LocalOverrides = {
      title: module.templateOverrides?.title || globalTemplate?.content.title || '',
      subtitle: module.templateOverrides?.subtitle || globalTemplate?.content.subtitle || '',
      centerTitle: module.templateOverrides?.centerTitle || globalTemplate?.content.centerTitle || false,
      splitScreenWithImage: defaultSplitScreen,
      splitScreenImage: module.templateOverrides?.splitScreenImage || globalTemplate?.content.splitScreenImage || (module.component === 'VoiceScreeningStep' ? '/screeningintro.png' : ''),
      splitScreenImagePosition: module.templateOverrides?.splitScreenImagePosition || globalTemplate?.content.splitScreenImagePosition || (module.component === 'VoiceScreeningStep' ? 'left' : 'right'),
      imageSideHasTitleSubtitle: module.templateOverrides?.imageSideHasTitleSubtitle || globalTemplate?.content.imageSideHasTitleSubtitle || false,
      imageSideTitle: module.templateOverrides?.imageSideTitle || globalTemplate?.content.imageSideTitle || '',
      imageSideSubtitle: module.templateOverrides?.imageSideSubtitle || globalTemplate?.content.imageSideSubtitle || '',
      comments: module.templateOverrides?.comments || '',
      customButtons: (module.templateOverrides as any)?.customButtons || (globalTemplate?.content as any)?.customButtons || [],
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
      splitScreenWithImage: globalTemplate?.content.splitScreenWithImage || false,
      splitScreenImage: globalTemplate?.content.splitScreenImage || '',
      splitScreenImagePosition: globalTemplate?.content.splitScreenImagePosition || 'right',
      imageSideHasTitleSubtitle: globalTemplate?.content.imageSideHasTitleSubtitle || false,
      imageSideTitle: globalTemplate?.content.imageSideTitle || '',
      imageSideSubtitle: globalTemplate?.content.imageSideSubtitle || '',
      comments: '',
      customButtons: (globalTemplate?.content as any)?.customButtons || [],
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
        {/* Comments */}
        <div className="space-y-0">
          <div className="bg-indigo-50 rounded-lg px-2 pb-1 pt-1">
          <h3 className="text-xs font-medium text-gray-900 pl-1 py-1 mb-1">Comments</h3>
            <textarea
              value={localOverrides.comments}
              onChange={(e) => updateField('comments', e.target.value)}
              placeholder="Add comments/notes for this page..."
              rows={3}
              className="w-full px-3 py-2 text-sm  rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white resize-vertical"
            />
          </div>
        </div>

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

            {module.component !== 'VoiceScreeningStep' && (
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
            )}

            {module.component !== 'VoiceScreeningStep' && (
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
            )}

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localOverrides.splitScreenWithImage}
                  onChange={(e) => updateField('splitScreenWithImage', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Split screen with image</span>
              </label>
            </div>

            {/* Split Screen Image Configuration */}
            {localOverrides.splitScreenWithImage && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  <ImageUploadComponent
                    value={localOverrides.splitScreenImage || ''}
                    onChange={(value) => updateField('splitScreenImage', value)}
                    placeholder="https://example.com/split-screen-image.png"
                    label="Split Screen Image"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Position</label>
                  <div className="inline-flex space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => updateField('splitScreenImagePosition', 'left')}
                      className={`
                        px-3 py-1 text-sm rounded-md transition-colors duration-200
                        ${localOverrides.splitScreenImagePosition === 'left'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                        }
                      `}
                    >
                      Left
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('splitScreenImagePosition', 'right')}
                      className={`
                        px-3 py-1 text-sm rounded-md transition-colors duration-200
                        ${localOverrides.splitScreenImagePosition === 'right'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                        }
                      `}
                    >
                      Right
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom Buttons - Only for MultibuttonModule */}
        {module.component === 'MultibuttonModule' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Custom Buttons</h3>
              <button
                onClick={() => {
                  const currentButtons = localOverrides.customButtons || [];
                  const newButton = {
                    id: `button-${Date.now()}`,
                    label: `Button ${currentButtons.length + 1}`,
                    isPrimary: currentButtons.length === 0 // First button is primary by default
                  };
                  updateField('customButtons', [...currentButtons, newButton]);
                }}
                className="flex items-center text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Button
              </button>
            </div>
            
            <div className="space-y-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
              {(localOverrides.customButtons || [
                { id: 'button1', label: 'Button 1', isPrimary: true },
                { id: 'button2', label: 'Button 2', isPrimary: false }
              ]).map((button: { id: string; label: string; isPrimary: boolean }, index: number) => (
                <div key={button.id} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Button {index + 1}</span>
                    <div className="flex items-center space-x-2">
                      {/* Move Up Button */}
                      <button
                        onClick={() => {
                          const buttons = [...(localOverrides.customButtons || [])];
                          if (index > 0) {
                            [buttons[index], buttons[index - 1]] = [buttons[index - 1], buttons[index]];
                            updateField('customButtons', buttons);
                          }
                        }}
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
                      
                      {/* Move Down Button */}
                      <button
                        onClick={() => {
                          const buttons = [...(localOverrides.customButtons || [])];
                          if (index < buttons.length - 1) {
                            [buttons[index], buttons[index + 1]] = [buttons[index + 1], buttons[index]];
                            updateField('customButtons', buttons);
                          }
                        }}
                        disabled={index === (localOverrides.customButtons || []).length - 1}
                        className={`p-1 rounded transition-colors duration-200 ${
                          index === (localOverrides.customButtons || []).length - 1
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                        title="Move down"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          const buttons = (localOverrides.customButtons || []).filter((b: { id: string; label: string; isPrimary: boolean }) => b.id !== button.id);
                          updateField('customButtons', buttons);
                        }}
                        className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        title="Delete button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Button Label */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Button Label</label>
                      <input
                        type="text"
                        value={button.label}
                        onChange={(e) => {
                          const buttons = [...(localOverrides.customButtons || [])];
                          buttons[index] = { ...button, label: e.target.value };
                          updateField('customButtons', buttons);
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    {/* Primary Button Checkbox */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={button.isPrimary}
                          onChange={(e) => {
                            const buttons = [...(localOverrides.customButtons || [])];
                            if (e.target.checked) {
                              // If this button is being set as primary, uncheck all others
                              buttons.forEach((b, i) => {
                                buttons[i] = { ...b, isPrimary: i === index };
                              });
                            } else {
                              // If this button is being unchecked, make the first button primary
                              buttons[index] = { ...button, isPrimary: false };
                              if (buttons.length > 0) {
                                buttons[0] = { ...buttons[0], isPrimary: true };
                              }
                            }
                            updateField('customButtons', buttons);
                          }}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-xs text-gray-600">This is the primary button</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions */}
        {module.component !== 'VoiceScreeningStep' && (
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
    {question.type === 'message' && <AlignLeft className="w-4 h-4" />}
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
      {question.type === 'message' && 'Text Block'}
      {question.type === 'assessment' && 'Assessments'}
      {question.type === 'video-interview' && 'Video Interview'}
    </span>
  </div>
  <ChevronDown className="w-4 h-4 ml-2 text-indigo-700" />
</button>

                
                {/* Dropdown Menu */}
                {question.typeSelectorOpen && (
                  <div className="absolute w-60 top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-[70] max-h-48 overflow-y-auto">
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
                      <AlignLeft className="w-4 h-4" />
                      <span>Text Block</span>
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
                  <label className="block text-xs font-medium text-gray-600 mb-2">Text Block Content</label>
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
        )}

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