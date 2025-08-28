import React, { useState } from 'react';
import { ArrowLeft, Save, RotateCcw, X, Check, Plus, GripVertical, Airplay } from 'lucide-react';
import { useTemplates, ModuleTemplate } from '../hooks/useTemplates';
import GenericModuleRenderer from './GenericModuleRenderer';

interface ModuleTemplatesPageProps {
  onBack: () => void;
}

export default function ModuleTemplatesPage({ onBack }: ModuleTemplatesPageProps) {
  const { templates, loading, error, createTemplate, updateTemplate, deleteTemplate, resetTemplate } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<ModuleTemplate | null>(null);
  const [editedTemplate, setEditedTemplate] = useState<ModuleTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('edit');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [saveFeedback, setSaveFeedback] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

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
        await createTemplate({
          name: editedTemplate.name,
          description: editedTemplate.description,
          content: editedTemplate.content
        });
        setIsCreatingNew(false);
      } else {
        await updateTemplate(editedTemplate.id, {
          name: editedTemplate.name,
          description: editedTemplate.description,
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

  const handleResetTemplate = async () => {
    if (isCreatingNew) {
      // Reset to blank template for new modules
      const blankTemplate: ModuleTemplate = {
        id: '',
        name: 'New Module',
        description: 'Custom module description',
        component: '', // Will be auto-generated
        content: {
          title: 'New Module Title',
          subtitle: 'Module subtitle',
          questions: []
        },
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setEditedTemplate(blankTemplate);
      return;
    }
    
    if (!selectedTemplate) return;
    
    if (selectedTemplate.isDefault) {
      try {
        await resetTemplate(selectedTemplate.id);
      } catch (error) {
        console.error('Failed to reset template:', error);
      }
    }
  };

  const handleCreateNew = () => {
    const newTemplate: ModuleTemplate = {
      id: '',
      name: 'New Module',
      description: 'Custom module description',
      component: '', // Will be auto-generated
      content: {
        title: 'New Module Title',
        subtitle: 'Module subtitle',
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

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this module template?')) {
      try {
        await deleteTemplate(templateId);
        
        // Clear selection if deleted template was selected
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate(null);
          setEditedTemplate(null);
          setIsCreatingNew(false);
        }
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
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
    if (!editedTemplate) return;
    
    const newQuestion = {
      id: `question_${Date.now()}`,
      text: 'New Question',
      type: 'text' as const,
      required: false
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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || !editedTemplate) return;
    
    const questions = [...(editedTemplate.content.questions || [])];
    const draggedQuestion = questions[draggedIndex];
    
    // Remove the dragged question
    questions.splice(draggedIndex, 1);
    
    // Insert at new position - adjust for removal
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    questions.splice(insertIndex, 0, draggedQuestion);
    
    setEditedTemplate(prev => ({
      ...prev!,
      content: {
        ...prev!.content,
        questions
      }
    }));
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border border-b border-gray-200">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
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
                        className="cursor-pointer"
                      >
                        <h4 className="font-medium text-sm text-gray-900">{template.name}</h4>
                       
                      </div>
                      
                      {/* Delete button for custom templates */}
                      {!template.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id);
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700"
                          title="Delete template"
                        >
                          <X className="w-4 h-4" />
                        </button>
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

                        {/* Questions */}
                        {(editedTemplate?.content.questions !== undefined || editedTemplate?.component === 'InterviewSchedulingStep' || editedTemplate?.component === 'AssessmentStep') && (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-medium text-gray-700">Questions</h5>
                              <button
                                onClick={addQuestion}
                                className="text-sm text-indigo-600 hover:text-indigo-700"
                              >
                                + Add Question
                              </button>
                            </div>
                            
                            <div className="space-y-3">
                              {(editedTemplate.content.questions || []).map((question, index) => (
                                <React.Fragment key={question.id}>
                                  {/* Drop zone before first element or between elements */}
                                  <div
                                    className={`
                                      h-2 transition-all duration-200 rounded
                                      ${draggedIndex !== null && draggedIndex !== index
                                        ? 'bg-indigo-200 border-2 border-dashed border-indigo-400'
                                        : draggedIndex !== null 
                                        ? 'bg-gray-100 border-2 border-dashed border-gray-300'
                                        : 'transparent'
                                      }
                                    `}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, index)}
                                  />
                                  
                                  <div 
                                    className={`
                                      border rounded-lg p-3 transition-all duration-200
                                      ${draggedIndex === index
                                        ? 'border-gray-300 bg-gray-50 opacity-50'
                                        : 'border-gray-200'
                                      }
                                    `}
                                    draggable={isEditing}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragEnd={handleDragEnd}
                                  >
                                  <div className="flex items-start space-x-3">
                                    {/* Drag Handle */}
                                    {isEditing && (
                                      <div className="flex-shrink-0 mt-2 cursor-grab active:cursor-grabbing">
                                        <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                      </div>
                                    )}
                                    

                                  {/* Layout selection for radio questions */}
                                 
                                  {/* Half-width option for text and select inputs */}
                                  
                                    <div className="flex-1">
                                    {/* Question Type Dropdown - Above other configurations */}
                                    <div className="mb-3">
                                      <select
                                        value={question.type}
                                        onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                                        className="w-[340px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      >
                                        <option value="text">Text</option>
                                        <option value="textarea">Textarea</option>
                                        <option value="select">Select</option>
                                        <option value="radio">Radio</option>
                                        <option value="checkbox">Checkbox</option>
                                        <option value="file">File</option>
                                        <option value="phone">Phone Number</option>
                                        <option value="interview-scheduler">Interview Scheduler</option>
                                        <option value="message">Message</option>
                                      </select>
                                    </div>
                                    
                                    {/* Question Text and Delete Button */}
                                    <div className="flex items-center space-x-3">
                                      <div className="flex-1">
                                        {question.type === 'interview-scheduler' ? (
                                          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                                            The calendar widget will be displayed
                                          </div>
                                        ) : (
                                          <input
                                            type="text"
                                            value={question.text}
                                            onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                                            placeholder="Question text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          />
                                        )}
                                      </div>
                                      <button
                                        onClick={() => removeQuestion(question.id)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                    
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

                                </div>
                                  </div>
                                  
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
                                
                                {/* Drop zone after last element */}
                                {index === (editedTemplate.content.questions || []).length - 1 && (
                                  <div
                                    className={`
                                      h-2 transition-all duration-200 rounded
                                      ${draggedIndex !== null
                                        ? 'bg-indigo-200 border-2 border-dashed border-indigo-400'
                                        : 'transparent'
                                      }
                                      ${dragOverIndex === (editedTemplate.content.questions || []).length && draggedIndex !== null
                                        ? 'bg-indigo-200 border-2 border-dashed border-indigo-400'
                                        : ''
                                      }
                                    `}
                                    onDragOver={(e) => handleDragOver(e, (editedTemplate.content.questions || []).length)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, (editedTemplate.content.questions || []).length)}
                                  />
                                )}
                              </React.Fragment>
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