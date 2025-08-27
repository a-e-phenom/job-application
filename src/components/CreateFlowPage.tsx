import React, { useState } from 'react';
import { ArrowLeft, Plus, Check, Trash2, GripVertical, Upload, X, ChevronRight, ChevronLeft, ChevronUp, ChevronDown } from 'lucide-react';
import { FlowModule, ApplicationFlow, FlowStep, PRESET_COLORS } from '../types/flow';
import { useTemplates } from '../hooks/useTemplates';
import { useFlows } from '../hooks/useFlows';
import { uploadLogoImage } from '../lib/supabase';

interface CreateFlowPageProps {
  onBack: () => void;
  onFlowCreated?: (flow: ApplicationFlow) => void;
  editingFlow?: ApplicationFlow | null;
}

export default function CreateFlowPage({ onBack, onFlowCreated, editingFlow }: CreateFlowPageProps) {
  const { templates, loading: templatesLoading } = useTemplates();
  const { createFlow, updateFlow } = useFlows();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  
  // Form data
  const [name, setName] = useState(editingFlow?.name || '');
  const [description, setDescription] = useState(editingFlow?.description || '');
  const [logoUrl, setLogoUrl] = useState(editingFlow?.logoUrl || 'https://mms.businesswire.com/media/20240122372572/en/1546931/5/Phenom_Lockup_RGB_Black.jpg?download=1');
  const [logoUploadMode, setLogoUploadMode] = useState<'url' | 'upload'>('url');
  const [uploadedLogoFile, setUploadedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [steps, setSteps] = useState<FlowStep[]>(
    editingFlow?.steps || [{ id: '1', name: 'Step 1', modules: [] }]
  );
  const [isActive, setIsActive] = useState(editingFlow?.isActive || false);
  const [primaryColor, setPrimaryColor] = useState(editingFlow?.primaryColor || '#6366F1');
  const [isSaving, setIsSaving] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorFormat, setColorFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [tempColor, setTempColor] = useState(primaryColor);

  // Drag and drop state
  const [draggedModule, setDraggedModule] = useState<FlowModule | null>(null);
  const [dragOverStep, setDragOverStep] = useState<string | null>(null);
  const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);
  const [draggedFromStep, setDraggedFromStep] = useState<string | null>(null);
  const [dragOverModuleIndex, setDragOverModuleIndex] = useState<number | null>(null);

  // Convert templates to available modules
  const availableModules: FlowModule[] = templates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    component: template.component
  }));

  // Update state when editingFlow changes
  React.useEffect(() => {
    if (editingFlow) {
      setName(editingFlow.name);
      setDescription(editingFlow.description);
      setLogoUrl(editingFlow.logoUrl || 'https://mms.businesswire.com/media/20240122372572/en/1546931/5/Phenom_Lockup_RGB_Black.jpg?download=1');
      setSteps(editingFlow.steps);
      setIsActive(editingFlow.isActive);
      setPrimaryColor(editingFlow.primaryColor || '#6366F1');
    } else {
      setName('');
      setDescription('');
      setLogoUrl('https://mms.businesswire.com/media/20240122372572/en/1546931/5/Phenom_Lockup_RGB_Black.jpg?download=1');
      setSteps([{ id: '1', name: 'Step 1', modules: [] }]);
      setIsActive(false);
      setPrimaryColor('#6366F1');
    }
  }, [editingFlow]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPEG, PNG, GIF, or SVG)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      setUploadedLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setUploadedLogoFile(null);
    setLogoPreview(null);
  };

  const addStep = () => {
    const newStep: FlowStep = {
      id: Date.now().toString(),
      name: `Step ${steps.length + 1}`,
      modules: []
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepId: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter(s => s.id !== stepId));
    }
  };

  const updateStepName = (stepId: string, name: string) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, name } : s));
  };

  const isModuleInStep = (stepId: string, moduleId: string) => {
    const step = steps.find(s => s.id === stepId);
    return step?.modules.some(m => m.id === moduleId) || false;
  };

  const getTotalModules = () => {
    return steps.reduce((total, step) => total + step.modules.length, 0);
  };

  const isModuleUsed = (moduleId: string) => {
    return steps.some(step => step.modules.some(m => m.id === moduleId));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, module: FlowModule) => {
    setDraggedModule(module);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleStepDragOver = (e: React.DragEvent, stepId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverStep(stepId);
  };

  const handleStepDragLeave = () => {
    setDragOverStep(null);
  };

  const handleStepDrop = (e: React.DragEvent, stepId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStep(null);
    
    if (draggedModule) {
      // If module is already in the target step, don't do anything
      if (isModuleInStep(stepId, draggedModule.id)) {
        setDraggedModule(null);
        return;
      }
      
      // Update steps in a single operation
      setSteps(prevSteps => prevSteps.map(step => {
        if (step.id === stepId) {
          // Add module to target step
          return { ...step, modules: [...step.modules, draggedModule] };
        } else {
          // Remove module from other steps
          return { ...step, modules: step.modules.filter(m => m.id !== draggedModule.id) };
        }
      }));
    }
    
    setDraggedModule(null);
  };

  const removeModuleFromStep = (stepId: string, moduleId: string) => {
    setSteps(steps.map(step => {
      if (step.id === stepId) {
        return { ...step, modules: step.modules.filter(m => m.id !== moduleId) };
      }
      return step;
    }));
  };

  const moveModuleUp = (stepId: string, moduleIndex: number) => {
    if (moduleIndex === 0) return; // Can't move up if already at top
    
    setSteps(steps.map(step => {
      if (step.id === stepId) {
        const newModules = [...step.modules];
        const temp = newModules[moduleIndex];
        newModules[moduleIndex] = newModules[moduleIndex - 1];
        newModules[moduleIndex - 1] = temp;
        return { ...step, modules: newModules };
      }
      return step;
    }));
  };

  const moveModuleDown = (stepId: string, moduleIndex: number) => {
    const step = steps.find(s => s.id === stepId);
    if (!step || moduleIndex === step.modules.length - 1) return; // Can't move down if already at bottom
    
    setSteps(steps.map(step => {
      if (step.id === stepId) {
        const newModules = [...step.modules];
        const temp = newModules[moduleIndex];
        newModules[moduleIndex] = newModules[moduleIndex + 1];
        newModules[moduleIndex + 1] = temp;
        return { ...step, modules: newModules };
      }
      return step;
    }));
  };

  // Module reordering within steps
  const handleModuleDragStart = (e: React.DragEvent, module: FlowModule, moduleIndex: number, stepId: string) => {
    setDraggedModule(module);
    setDraggedModuleIndex(moduleIndex);
    setDraggedFromStep(stepId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleModuleDragOver = (e: React.DragEvent, moduleIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverModuleIndex(moduleIndex);
  };

  const handleModuleDragLeave = () => {
    setDragOverModuleIndex(null);
  };

  const handleModuleDrop = (e: React.DragEvent, dropIndex: number, stepId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverModuleIndex(null);
    
    if (draggedModuleIndex === null || !draggedFromStep || !draggedModule) return;
    
    setSteps(prevSteps => prevSteps.map(step => {
      if (draggedFromStep === stepId && step.id === stepId) {
        // Reordering within the same step
        const newModules = [...step.modules];
        const draggedModuleItem = newModules[draggedModuleIndex];
        
        // Remove the dragged module
        newModules.splice(draggedModuleIndex, 1);
        
        // Insert at new position - adjust for removal
        const insertIndex = draggedModuleIndex < dropIndex ? dropIndex - 1 : dropIndex;
        newModules.splice(insertIndex, 0, draggedModuleItem);
        
        return { ...step, modules: newModules };
      } else if (draggedFromStep !== stepId && step.id === stepId) {
        // Moving to a different step - add at specific position
        const newModules = [...step.modules];
        newModules.splice(dropIndex, 0, draggedModule);
        return { ...step, modules: newModules };
      } else if (step.id === draggedFromStep) {
        // Remove from source step (only if moving to different step)
        if (step.id === stepId) {
          return step; // Don't modify if it's the same step (handled above)
        } else {
          return { ...step, modules: step.modules.filter((_, index) => index !== draggedModuleIndex) };
        }
      }
      return step;
    }));
    
    setDraggedModule(null);
    setDraggedModuleIndex(null);
    setDraggedFromStep(null);
  };

  const handleModuleDragEnd = () => {
    setDraggedModule(null);
    setDraggedModuleIndex(null);
    setDraggedFromStep(null);
    setDragOverModuleIndex(null);
  };

  const handleColorSelect = (color: string) => {
    setPrimaryColor(color);
  };

  const handleCustomColorChange = (color: string) => {
    setPrimaryColor(color);
    setTempColor(color);
  };

  // Color conversion utilities
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
  };

  const getCurrentColorValues = () => {
    const rgb = hexToRgb(tempColor);
    const hsl = hexToHsl(tempColor);
    
    return {
      hex: tempColor,
      rgb: rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '0, 0, 0',
      hsl: hsl ? `${hsl.h}°, ${hsl.s}%, ${hsl.l}%` : '0°, 0%, 0%'
    };
  };

  const handleColorInputChange = (value: string, format: 'hex' | 'rgb' | 'hsl') => {
    try {
      let newColor = tempColor;
      
      if (format === 'hex') {
        if (/^#[0-9A-F]{6}$/i.test(value)) {
          newColor = value;
        }
      } else if (format === 'rgb') {
        const match = value.match(/(\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const r = Math.min(255, Math.max(0, parseInt(match[1])));
          const g = Math.min(255, Math.max(0, parseInt(match[2])));
          const b = Math.min(255, Math.max(0, parseInt(match[3])));
          newColor = rgbToHex(r, g, b);
        }
      } else if (format === 'hsl') {
        const match = value.match(/(\d+)°?,\s*(\d+)%?,\s*(\d+)%?/);
        if (match) {
          const h = Math.min(360, Math.max(0, parseInt(match[1])));
          const s = Math.min(100, Math.max(0, parseInt(match[2])));
          const l = Math.min(100, Math.max(0, parseInt(match[3])));
          newColor = hslToHex(h, s, l);
        }
      }
      
      setTempColor(newColor);
    } catch (error) {
      // Invalid input, ignore
    }
  };

  const applyColor = () => {
    setPrimaryColor(tempColor);
    setShowColorPicker(false);
  };

  // Helper functions for color wheel positioning
  const getCurrentHueColor = () => {
    const hsl = hexToHsl(tempColor);
    if (!hsl) return '#ff0000';
    return hslToHex(hsl.h, 100, 50);
  };

  const getHuePosition = () => {
    const hsl = hexToHsl(tempColor);
    if (!hsl) return 0;
    return (hsl.h / 360) * 100;
  };

  const getSaturationPosition = () => {
    const hsl = hexToHsl(tempColor);
    if (!hsl) return 0;
    return hsl.s;
  };

  const getLightnessPosition = () => {
    const hsl = hexToHsl(tempColor);
    if (!hsl) return 50;
    return 100 - hsl.l;
  };

  const handleSave = async () => {
    if (!name.trim() || getTotalModules() === 0) return;

    setIsSaving(true);
    try {
      let finalLogoUrl = logoUrl;
      
      // If user uploaded a file, upload it and get the data URL
      if (logoUploadMode === 'upload' && uploadedLogoFile) {
        try {
          finalLogoUrl = await uploadLogoImage(uploadedLogoFile);
        } catch (error) {
          console.error('Failed to upload logo:', error);
          alert('Failed to upload logo. Please try again.');
          setIsSaving(false);
          return;
        }
      }

      const flowData = {
        name: name.trim(),
        description: description.trim(),
        steps,
        isActive,
        primaryColor,
        logoUrl: finalLogoUrl.trim()
      };

      if (editingFlow) {
        await updateFlow(editingFlow.id, flowData);
        onBack();
      } else {
        const newFlow = await createFlow(flowData);
        if (onFlowCreated && newFlow) {
          onFlowCreated(newFlow);
        } else {
          onBack();
        }
      }
    } catch (error) {
      console.error('Failed to save flow:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return name.trim().length > 0;
    }
    return getTotalModules() > 0;
  };

  const canSave = () => {
    return name.trim().length > 0 && getTotalModules() > 0;
  };

  const allColors = PRESET_COLORS.map(c => c.value.toLowerCase());
  const isCustomColor = !allColors.includes(primaryColor.toLowerCase());
  const displayColors = [...PRESET_COLORS];

  if (isCustomColor) {
    displayColors.push({
      name: 'Custom',
      value: primaryColor,
    });
  }

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-md font-semibold text-gray-700">Basic Information</h2>
            
            <div>
              <label htmlFor="flowName" className="block text-sm font-medium text-gray-700 mb-2">
                Flow Name
              </label>
              <input
                type="text"
                id="flowName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Software Engineer Application"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="flowDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="flowDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this application flow..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical"
              />
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Primary Color
              </label>
              <div className="space-y-4">
                
                {/* Color Picker Row */}
                <div className="flex flex-row gap-2">
                  {displayColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleColorSelect(color.value)}
                      className={`
                        w-8 h-8 rounded-lg border-2 transition-all duration-200 relative
                        ${primaryColor === color.value 
                          ? 'border-gray-400 ring-2 ring-offset-2 ring-gray-300' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {primaryColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow-sm" />
                        </div>
                      )}
                    </button>
                  ))}

                  {/* HTML5 Color Picker */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setTempColor(primaryColor);
                        setShowColorPicker(!showColorPicker);
                      }}
                      className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      title="Choose custom color"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    
                    {showColorPicker && (
                      <div className="absolute top-10 left-0 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
                        {/* Tabs */}
                        <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
                          {(['hex', 'rgb', 'hsl'] as const).map((format) => (
                            <button
                              key={format}
                              type="button"
                              onClick={() => setColorFormat(format)}
                              className={`
                                flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                                ${colorFormat === format
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900'
                                }
                              `}
                            >
                              {format.toUpperCase()}
                            </button>
                          ))}
                        </div>
                        
                        {/* Color Wheel */}
                        <div className="mb-4">
                          {/* Main Color Area */}
                          <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
                            <div 
                              className="w-full h-full cursor-crosshair relative"
                              style={{
                                background: `linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, ${getCurrentHueColor()})`
                              }}
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = (e.clientX - rect.left) / rect.width;
                                const y = (e.clientY - rect.top) / rect.height;
                                const currentHsl = hexToHsl(tempColor);
                                if (currentHsl) {
                                  const saturation = x * 100;
                                  const lightness = Math.max(0, Math.min(100, (1 - y) * 100));
                                  const newColor = hslToHex(currentHsl.h, saturation, lightness);
                                  setTempColor(newColor);
                                }
                              }}
                            >
                              {/* Color picker dot */}
                              <div 
                                className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none transform -translate-x-2 -translate-y-2"
                                style={{
                                  left: `${getSaturationPosition()}%`,
                                  top: `${100 - getLightnessPosition()}%`,
                                  boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Hue Slider */}
                          <div className="relative w-full h-4 mb-4 rounded-full overflow-hidden">
                            <div 
                              className="w-full h-full cursor-pointer"
                              style={{
                                background: 'linear-gradient(to right, #ff0000 0%, #ffff00 16.66%, #00ff00 33.33%, #00ffff 50%, #0000ff 66.66%, #ff00ff 83.33%, #ff0000 100%)'
                              }}
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = (e.clientX - rect.left) / rect.width;
                                const hue = x * 360;
                                const currentHsl = hexToHsl(tempColor);
                                if (currentHsl) {
                                  const newColor = hslToHex(hue, currentHsl.s, currentHsl.l);
                                  setTempColor(newColor);
                                }
                              }}
                            >
                              {/* Hue slider handle */}
                              <div 
                                className="absolute w-4 h-4 bg-white border-2 border-gray-300 rounded-full shadow-lg pointer-events-none transform -translate-x-2 -translate-y-0"
                                style={{
                                  left: `${getHuePosition()}%`,
                                  top: '0px',
                                  boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Color Input */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {colorFormat.toUpperCase()} Value
                          </label>
                          <input
                            type="text"
                            value={colorFormat === 'hex' ? tempColor : getCurrentColorValues()[colorFormat]}
                            onChange={(e) => {
                              if (colorFormat === 'hex') {
                                const value = e.target.value;
                                if (value.startsWith('#') && value.length <= 7) {
                                  setTempColor(value);
                                } else if (!value.startsWith('#') && value.length <= 6) {
                                  setTempColor('#' + value);
                                }
                              } else {
                                handleColorInputChange(e.target.value, colorFormat);
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                            placeholder={
                              colorFormat === 'hex' ? '#6366F1' :
                              colorFormat === 'rgb' ? '99, 102, 241' :
                              '248°, 85%, 67%'
                            }
                          />
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowColorPicker(false)}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={applyColor}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Logo
              </label>
              
              {/* Logo Upload Mode Toggle */}
              <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
                <button
                  type="button"
                  onClick={() => setLogoUploadMode('url')}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${logoUploadMode === 'url'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setLogoUploadMode('upload')}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${logoUploadMode === 'upload'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  Upload
                </button>
              </div>

              {logoUploadMode === 'url' ? (
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <div className="space-y-4">
                  {!uploadedLogoFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors duration-200">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-600 mb-2">
                          Drop logo here or <span className="text-indigo-600 font-medium">click to upload</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports JPEG, PNG, GIF, SVG (max 5MB)
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {logoPreview && (
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="w-12 h-12 object-contain rounded border"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{uploadedLogoFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {(uploadedLogoFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Step 2: Flow Steps
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-semibold text-gray-700">
            Flow Steps ({getTotalModules()} modules total)
          </h2>
          <button
            type="button"
            onClick={addStep}
            className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Step</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Left Column - Available Modules */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Available Modules</h3>
            <div className="space-y-3 max-h-[550px] overflow-y-auto">
              {templatesLoading ? (
                <div className="text-center py-8 text-gray-500">Loading modules...</div>
              ) : availableModules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No modules available</div>
              ) : (
                availableModules.map((module) => (
                  <div
                    key={module.id}
                    draggable={!isModuleUsed(module.id)}
                    onDragStart={(e) => handleDragStart(e, module)}
                    className={`
                      p-4 border rounded-lg transition-all duration-200 cursor-grab active:cursor-grabbing
                      ${isModuleUsed(module.id)
                        ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                      ${draggedModule?.id === module.id ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <GripVertical className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm">{module.name}</h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{module.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Flow Steps */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Flow Steps</h3>
            <div className="space-y-4 max-h-[550px] overflow-y-auto">
              {steps.map((step, stepIndex) => (
                <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => updateStepName(step.id, e.target.value)}
                      className="text-lg font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0 flex-1"
                      placeholder="Step name"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {step.modules.length} modules
                      </span>
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(step.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => handleStepDragOver(e, step.id)}
                    onDragLeave={handleStepDragLeave}
                    onDrop={(e) => handleStepDrop(e, step.id)}
                    onDragEnter={(e) => e.preventDefault()}
                    className={`
                      min-h-[120px] border-2 border-dashed rounded-lg p-4 transition-all duration-200
                      ${dragOverStep === step.id
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-300'
                      }
                    `}
                  >
                    {step.modules.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        Drag modules here to add them to this step
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {step.modules.map((module, moduleIndex) => (
                          <div
                            key={module.id}
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-sm"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex flex-col space-y-1">
                                <button
                                  type="button"
                                  onClick={() => moveModuleUp(step.id, moduleIndex)}
                                  disabled={moduleIndex === 0}
                                  className={`
                                    p-1 rounded transition-colors duration-200
                                    ${moduleIndex === 0
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    }
                                  `}
                                  title="Move up"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveModuleDown(step.id, moduleIndex)}
                                  disabled={moduleIndex === step.modules.length - 1}
                                  className={`
                                    p-1 rounded transition-colors duration-200
                                    ${moduleIndex === step.modules.length - 1
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    }
                                  `}
                                  title="Move down"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900 text-sm">{module.name}</h5>
                                <p className="text-xs text-gray-600">{module.description}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeModuleFromStep(step.id, module.id)}
                              className="text-red-500 hover:text-red-700 transition-colors duration-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
     {/* Header */}
{/* Header */}
<div className="bg-white shadow-sm">
  <div className="w-full px-6 py-6 flex items-center justify-between">
    {/* Left: Back Button + Title */}
    <div className="flex items-center space-x-3">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <span className="text-md font-medium text-gray-700">
        {editingFlow ? 'Edit Flow' : 'Create Flow'}
      </span>
    </div>

    {/* Center: Stepper */}
    <div className="flex-1 flex justify-center">
      <div className="flex items-center">
        {[1, 2].map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex items-center">
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300
                  ${
                    step < currentStep
                      ? 'bg-indigo-600 text-white'
                      : step === currentStep
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                      : 'bg-gray-200 text-gray-600'
                  }
                `}
              >
                {step < currentStep ? <Check className="w-4 h-4" /> : <span>{step}</span>}
              </div>
              <span
                className={`
                  ml-3 text-sm font-medium transition-colors duration-300
                  ${step <= currentStep ? 'text-indigo-600' : 'text-gray-500'}
                `}
              >
                {step === 1 ? 'General Details' : 'Flow Steps'}
              </span>
            </div>
            {index < 1 && (
              <div
                className={`w-16 h-0.5 mx-6 transition-colors duration-300 ${
                  step < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>

    {/* Right: Close Button */}
    <button
      onClick={onBack}
      className="p-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
</div>



     

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {renderStepContent()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="w-full flex items-right justify-between">
          <div className="flex items-center space-x-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToNextStep()}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200
                  ${canProceedToNextStep()
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!canSave() || templatesLoading || isSaving}
                className={`
                  px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2
                  ${canSave() && !templatesLoading && !isSaving
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                <span>
                  {isSaving ? 'Saving...' : editingFlow ? 'Update flow' : 'Create flow'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}