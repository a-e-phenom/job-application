import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Plus } from 'lucide-react';
import { FlowModule } from '../types/flow';
import { ModuleTemplate } from '../hooks/useTemplates';

interface LocalOverrides {
  title: string;
  subtitle: string;
  questions: Array<{
    id: string;
    text: string;
    type: 'text' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file' | 'phone' | 'interview-scheduler' | 'message';
    options?: string[];
    required?: boolean;
    halfWidth?: boolean;
    layout?: 'vertical' | 'horizontal';
    content?: string;
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
    questions: []
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local overrides with existing values or global template values
  useEffect(() => {
    const initialOverrides: LocalOverrides = {
      title: module.templateOverrides?.title || globalTemplate?.content.title || '',
      subtitle: module.templateOverrides?.subtitle || globalTemplate?.content.subtitle || '',
      questions: module.templateOverrides?.questions || globalTemplate?.content.questions || []
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
    const updatedQuestions = [...localOverrides.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    
    updateField('questions', updatedQuestions);
  };

  const addQuestion = () => {
    const newQuestion = {
      id: `question_${Date.now()}`,
      text: 'New Question',
      type: 'text' as const,
      required: false
    };
    
    const questions = [...localOverrides.questions, newQuestion];
    updateField('questions', questions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = localOverrides.questions.filter((_, i) => i !== index);
    updateField('questions', updatedQuestions);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Module Configuration</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">{module.name}</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Basic Fields */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900">Basic Configuration</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={localOverrides.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {globalTemplate?.content.title && !module.templateOverrides?.title && (
              <p className="text-xs text-gray-500 mt-1">
                Using global: "{globalTemplate.content.title}"
              </p>
            )}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {globalTemplate?.content.subtitle && !module.templateOverrides?.subtitle && (
              <p className="text-xs text-gray-500 mt-1">
                Using global: "{globalTemplate.content.subtitle}"
              </p>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium text-gray-900">Questions</h3>
            <button
              onClick={addQuestion}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Add Question
            </button>
          </div>

          {localOverrides.questions.map((question, index) => (
            <div key={question.id} className="border border-gray-200 rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Question {index + 1}</span>
                <button
                  onClick={() => removeQuestion(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>

              <input
                type="text"
                value={question.text}
                onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                placeholder="Question text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <select
                value={question.type}
                onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="text">Text Input</option>
                <option value="textarea">Text Area</option>
                <option value="select">Dropdown</option>
                <option value="radio">Radio Buttons</option>
                <option value="checkbox">Checkboxes</option>
                <option value="file">File Upload</option>
                <option value="phone">Phone Number</option>
              </select>

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

          {localOverrides.questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No questions configured</p>
              <p className="text-sm">Add custom questions or use global template questions</p>
            </div>
          )}
        </div>

        {/* Global Template Info */}
        {globalTemplate && (
          <div className="bg-gray-50 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Global Template</h4>
            <p className="text-sm text-gray-600">
              This module uses the "{globalTemplate.name}" template as a base.
              Changes here will only affect this flow and won't modify the global template.
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
                hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
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
