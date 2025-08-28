import React, { useState, useEffect, useRef } from 'react';
import { X, Save, RotateCcw, Plus, Type, FileText, ChevronDown, Circle, CheckSquare, FolderOpen, Image, Phone, Calendar, MessageSquare, ChevronUp, ChevronDown as ChevronDownIcon } from 'lucide-react';
import { FlowModule } from '../types/flow';
import { ModuleTemplate } from '../hooks/useTemplates';

interface LocalOverrides {
  title: string;
  subtitle: string;
  centerTitle: boolean;
  questions: Array<{
    id: string;
    text: string;
    type: 'text' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file' | 'image' | 'phone' | 'interview-scheduler' | 'message';
    options?: string[];
    required?: boolean;
    halfWidth?: boolean;
    layout?: 'vertical' | 'horizontal';
    content?: string;
    typeSelectorOpen?: boolean; // Added for custom dropdown
  }>;
}

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
        {/* Basic Fields */}
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
             
              {/* Element Text Input - Hidden for image and message types */}
              {question.type !== 'image' && question.type !== 'message' && (
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                  placeholder="Element text"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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