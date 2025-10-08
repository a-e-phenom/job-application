import React, { useState } from 'react';
import { ArrowLeft, Check, Upload, X, ChevronUp, ChevronDown, Plus, Edit } from 'lucide-react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { FlowModule, FlowStep, PRESET_COLORS } from '../types/flow';
import { useTemplates } from '../hooks/useTemplates';
import { useFlows } from '../hooks/useFlows';
import { uploadLogoImage } from '../lib/supabase';
import { generateUniqueSlug } from '../lib/utils';
import FeedbackModal from './FeedbackModal';

export default function CreateFlowPage() {
  const { templates, loading: templatesLoading } = useTemplates();
  const { createFlow, updateFlow, flows, loading: flowsLoading } = useFlows();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Determine if we're editing an existing flow
  const editingFlow = slug ? flows.find(f => f.slug === slug) : null;
  
  // Remove step management - everything on one page
  
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
  const [collectFeedback, setCollectFeedback] = useState(editingFlow?.collectFeedback || false);
  const [isSaving, setIsSaving] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorFormat, setColorFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [tempColor, setTempColor] = useState(primaryColor);
  const [showModuleSelector, setShowModuleSelector] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<{[stepId: string]: FlowModule[]}>({});
  const [editingStepName, setEditingStepName] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Remove drag and drop state - no longer needed

  // Update state when editingFlow changes
  React.useEffect(() => {
    if (editingFlow) {
      setName(editingFlow.name);
      setDescription(editingFlow.description);
      setLogoUrl(editingFlow.logoUrl || 'https://mms.businesswire.com/media/20240122372572/en/1546931/5/Phenom_Lockup_RGB_Black.jpg?download=1');
      setSteps(editingFlow.steps);
      setIsActive(editingFlow.isActive);
      setPrimaryColor(editingFlow.primaryColor || '#6366F1');
      setCollectFeedback(editingFlow.collectFeedback || false);
      
      // Initialize selectedModules for each step
      const modulesByStep: {[stepId: string]: FlowModule[]} = {};
      editingFlow.steps.forEach(step => {
        modulesByStep[step.id] = step.modules || [];
      });
      setSelectedModules(modulesByStep);
    } else {
      setName('');
      setDescription('');
      setLogoUrl('https://mms.businesswire.com/media/20240122372572/en/1546931/5/Phenom_Lockup_RGB_Black.jpg?download=1');
      setSteps([{ id: '1', name: 'Step 1', modules: [] }]);
      setIsActive(false);
      setPrimaryColor('#6366F1');
      setCollectFeedback(false);
      setSelectedModules({ '1': [] });
    }
  }, [editingFlow]);

  // Sync selectedModules with steps
  React.useEffect(() => {
    setSteps(prevSteps => prevSteps.map(step => ({
      ...step,
      modules: selectedModules[step.id] || []
    })));
  }, [selectedModules]);

  // Close module selector when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showModuleSelector && !target.closest('.module-selector')) {
        setShowModuleSelector(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModuleSelector]);

  // Show loading state while flows are being fetched (only when editing)
  if (slug && flowsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Loading flow...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }
  
  // Redirect to homepage if editing flow not found
  if (slug && !editingFlow) {
    return <Navigate to="/" replace />;
  }

  // Convert templates to available modules
  const availableModules: FlowModule[] = templates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    component: template.component
  }));

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

  const getTotalModules = () => {
    return Object.values(selectedModules).reduce((total, modules) => total + modules.length, 0);
  };

  const isModuleUsedAsButtonTarget = (moduleId: string, stepId: string) => {
    const stepModules = getStepModules(stepId);
    return stepModules.some(module => 
      module.component === 'MultibuttonModule' && 
      module.templateOverrides?.customButtons?.some(button => button.targetModule === moduleId)
    );
  };

  const addStep = () => {
    const newStepId = Date.now().toString();
    const newStep: FlowStep = {
      id: newStepId,
      name: `Step ${steps.length + 1}`,
      modules: []
    };
    setSteps([...steps, newStep]);
    setSelectedModules(prev => ({
      ...prev,
      [newStepId]: []
    }));
  };

  const removeStep = (stepId: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter(s => s.id !== stepId));
      setSelectedModules(prev => {
        const newModules = { ...prev };
        delete newModules[stepId];
        return newModules;
      });
    }
  };

  const updateStepName = (stepId: string, name: string) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, name } : s));
  };

  const getStepModules = (stepId: string) => {
    return selectedModules[stepId] || [];
  };

  const updateStepModules = (stepId: string, modules: FlowModule[]) => {
    setSelectedModules(prev => ({
      ...prev,
      [stepId]: modules
    }));
  };

  const moveModuleUp = (stepId: string, moduleIndex: number) => {
    if (moduleIndex === 0) return; // Can't move up if already at top
    
    const stepModules = getStepModules(stepId);
    const newModules = [...stepModules];
    const temp = newModules[moduleIndex];
    newModules[moduleIndex] = newModules[moduleIndex - 1];
    newModules[moduleIndex - 1] = temp;
    updateStepModules(stepId, newModules);
  };

  const moveModuleDown = (stepId: string, moduleIndex: number) => {
    const stepModules = getStepModules(stepId);
    if (moduleIndex === stepModules.length - 1) return; // Can't move down if already at bottom
    
    const newModules = [...stepModules];
    const temp = newModules[moduleIndex];
    newModules[moduleIndex] = newModules[moduleIndex + 1];
    newModules[moduleIndex + 1] = temp;
    updateStepModules(stepId, newModules);
  };

  const handleColorSelect = (color: string) => {
    setPrimaryColor(color);
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

  const handleFeedbackSubmit = (rating: number, comment: string) => {
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', { rating, comment });
    // For now, just show an alert
    
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

      // Generate a unique slug for the flow
      const existingSlugs = flows.map(f => f.slug);
      const slug = editingFlow ? editingFlow.slug : generateUniqueSlug(name.trim(), existingSlugs);

      const flowData = {
        name: name.trim(),
        description: description.trim(),
        slug,
        steps,
        isActive,
        primaryColor,
        logoUrl: finalLogoUrl.trim(),
        collectFeedback
      };

      if (editingFlow) {
        await updateFlow(editingFlow.id, flowData);
        navigate('/');
      } else {
        const newFlow = await createFlow(flowData);
        if (newFlow) {
          navigate(`/flow/${newFlow.slug}`);
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Failed to save flow:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Remove step navigation functions

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

  const renderContent = () => {
    return (
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
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
              className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical"
            />
          </div>
        </div>

        {/* Appearance */}
        <div className="space-y-4">
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
                  px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200
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
                  px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200
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
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
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

        {/* Flow Steps - Multiple Steps with Multiselect */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Flow Steps</h3>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Step</span>
            </button>
          </div>
          
          {/* Steps List */}
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="border border-gray-200 rounded-xl p-4 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {editingStepName === step.id ? (
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => updateStepName(step.id, e.target.value)}
                        onBlur={() => setEditingStepName(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingStepName(null);
                          }
                        }}
                        className="text-sm font-medium text-gray-800 bg-transparent border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                    ) : (
                      <h4 
                        className="text-sm font-medium text-gray-800 cursor-pointer hover:text-indigo-600"
                        onClick={() => setEditingStepName(step.id)}
                      >
                        {step.name}
                      </h4>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingStepName(step.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {getStepModules(step.id).length} modules
                    </span>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(step.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Module Selection */}
                <div className="space-y-3">
                  <div className="relative module-selector">
                    <button
                      type="button"
                      onClick={() => setShowModuleSelector(showModuleSelector === step.id ? null : step.id)}
                      className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <span className="text-sm text-gray-700">
                        {getStepModules(step.id).length > 0 
                          ? `${getStepModules(step.id).length} modules selected`
                          : 'Add modules to this step'
                        }
                      </span>
                      <ChevronDown className="w-4 h-4 float-right mt-0.5" />
                    </button>
                    
                    {showModuleSelector === step.id && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {availableModules.map((module) => (
                          <label
                            key={module.id}
                            className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={getStepModules(step.id).some(m => m.id === module.id)}
                              onChange={(e) => {
                                const currentModules = getStepModules(step.id);
                                if (e.target.checked) {
                                  updateStepModules(step.id, [...currentModules, module]);
                                } else {
                                  updateStepModules(step.id, currentModules.filter(m => m.id !== module.id));
                                }
                              }}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="ml-3 text-sm text-gray-700">{module.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Modules Display */}
                  {getStepModules(step.id).length > 0 && (
                    <div className="space-y-2">
                      {getStepModules(step.id).map((module, index) => (
                        <div key={module.id}>
                          <div className={`p-3 border border-gray-200 rounded-lg ${module.component === 'MultibuttonModule' ? 'bg-gray-50' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="flex flex-col space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => moveModuleUp(step.id, index)}
                                    disabled={index === 0}
                                    className={`
                                      p-1 rounded transition-colors duration-200
                                      ${index === 0
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
                                    onClick={() => moveModuleDown(step.id, index)}
                                    disabled={index === getStepModules(step.id).length - 1}
                                    className={`
                                      p-1 rounded transition-colors duration-200
                                      ${index === getStepModules(step.id).length - 1
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
                                  <div className="flex items-center space-x-2">
                                    <h5 className="font-medium text-gray-900 text-sm">{module.name}</h5>
                                    {isModuleUsedAsButtonTarget(module.id, step.id) && (
                                      <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                                        Custom Button Target
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600">{module.description}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentModules = getStepModules(step.id);
                                  updateStepModules(step.id, currentModules.filter(m => m.id !== module.id));
                                }}
                                className="text-red-500 hover:text-red-700 transition-colors duration-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {/* Multi-button Module Configuration */}
                            {module.component === 'MultibuttonModule' && (
                              <div className="p-4 bg-indigo-50  rounded-lg">
                                <h6 className="text-sm font-medium text-indigo-700 mb-1">Button Configuration</h6>
                                <h3 className="text-xs text-gray-700 mb-1">Select target modules for each button. These modules will be automatically added to your flow and can be accessed when users click the buttons.</h3>
                                <h3 className="text-xs text-gray-700 mb-3">Target modules will be grouped together in the stepper since only one will be visited based on button selection.</h3>
                             
                                <div className="space-y-3">
                                  {(module.templateOverrides?.customButtons || [
                                    { id: 'button1', label: 'Button 1', isPrimary: true },
                                    { id: 'button2', label: 'Button 2', isPrimary: false }
                                  ]).map((button, buttonIndex) => (
                                    <div key={button.id} className="flex items-center space-x-3">
                                      <div className="flex-1">
                                        <input
                                          type="text"
                                          value={button.label}
                                          onChange={(e) => {
                                            const currentModules = getStepModules(step.id);
                                            const updatedModules = currentModules.map(m => 
                                              m.id === module.id 
                                                ? {
                                                    ...m,
                                                    templateOverrides: {
                                                      ...m.templateOverrides,
                                                      customButtons: (m.templateOverrides?.customButtons || []).map(b => 
                                                        b.id === button.id ? { ...b, label: e.target.value } : b
                                                      )
                                                    }
                                                  }
                                                : m
                                            );
                                            updateStepModules(step.id, updatedModules);
                                          }}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                          placeholder={`Button ${buttonIndex + 1}`}
                                        />
                                      </div>
                                      <div className="flex-1">
                                      <select
                                        value={button.targetModule || ''}
                                        onChange={(e) => {
                                          const currentModules = getStepModules(step.id);
                                          const selectedTargetModuleId = e.target.value;
                                          
                                          // Update the button configuration
                                          const updatedModules = currentModules.map(m => 
                                            m.id === module.id 
                                              ? {
                                                  ...m,
                                                  templateOverrides: {
                                                    ...m.templateOverrides,
                                                    customButtons: (m.templateOverrides?.customButtons || []).map(b => 
                                                      b.id === button.id ? { ...b, targetModule: selectedTargetModuleId } : b
                                                    )
                                                  }
                                                }
                                              : m
                                          );
                                          
                                          // If a target module is selected, add it to the flow
                                          if (selectedTargetModuleId) {
                                            const targetModule = availableModules.find(m => m.id === selectedTargetModuleId);
                                            if (targetModule && !currentModules.some(m => m.id === selectedTargetModuleId)) {
                                              // Add the target module to the current step
                                              updatedModules.push(targetModule);
                                            }
                                          }
                                          
                                          // Clean up: Remove target modules that are no longer referenced by any button
                                          const allButtonTargets = updatedModules
                                            .filter(m => m.component === 'MultibuttonModule')
                                            .flatMap(m => m.templateOverrides?.customButtons || [])
                                            .map(b => b.targetModule)
                                            .filter(Boolean);
                                          
                                          // Remove modules that are not referenced by any button and are not the Multi-button Module itself
                                          const cleanedModules = updatedModules.filter(m => 
                                            m.component === 'MultibuttonModule' || 
                                            allButtonTargets.includes(m.id)
                                          );
                                          
                                          updateStepModules(step.id, cleanedModules);
                                        }}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                      >
                                        <option value="">Select target module</option>
                                        {availableModules.map(targetModule => (
                                          <option key={targetModule.id} value={targetModule.id}>
                                            {targetModule.name}
                                          </option>
                                        ))}
                                      </select>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <label className="flex items-center">
                                          <input
                                            type="checkbox"
                                            checked={button.isPrimary}
                                            onChange={(e) => {
                                              const currentModules = getStepModules(step.id);
                                              const updatedModules = currentModules.map(m => 
                                                m.id === module.id 
                                                  ? {
                                                      ...m,
                                                      templateOverrides: {
                                                        ...m.templateOverrides,
                                                        customButtons: (m.templateOverrides?.customButtons || []).map(b => 
                                                          b.id === button.id ? { ...b, isPrimary: e.target.checked } : b
                                                        )
                                                      }
                                                    }
                                                  : m
                                              );
                                              updateStepModules(step.id, updatedModules);
                                            }}
                                            className="w-4 h-4 text-indigo-700 border-gray-300 rounded focus:ring-indigo-500"
                                          />
                                          <span className="ml-2 text-xs text-gray-600">Primary</span>
                                        </label>
                                        {(module.templateOverrides?.customButtons || []).length > 2 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const currentModules = getStepModules(step.id);
                                              const updatedModules = currentModules.map(m => 
                                                m.id === module.id 
                                                  ? {
                                                      ...m,
                                                      templateOverrides: {
                                                        ...m.templateOverrides,
                                                        customButtons: (m.templateOverrides?.customButtons || []).filter(b => b.id !== button.id)
                                                      }
                                                    }
                                                  : m
                                              );
                                              
                                              // Clean up: Remove target modules that are no longer referenced by any button
                                              const allButtonTargets = updatedModules
                                                .filter(m => m.component === 'MultibuttonModule')
                                                .flatMap(m => m.templateOverrides?.customButtons || [])
                                                .map(b => b.targetModule)
                                                .filter(Boolean);
                                              
                                              // Remove modules that are not referenced by any button and are not the Multi-button Module itself
                                              const cleanedModules = updatedModules.filter(m => 
                                                m.component === 'MultibuttonModule' || 
                                                allButtonTargets.includes(m.id)
                                              );
                                              
                                              updateStepModules(step.id, cleanedModules);
                                            }}
                                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentModules = getStepModules(step.id);
                                      const updatedModules = currentModules.map(m => 
                                        m.id === module.id 
                                          ? {
                                              ...m,
                                              templateOverrides: {
                                                ...m.templateOverrides,
                                                customButtons: [
                                                  ...(m.templateOverrides?.customButtons || []),
                                                  { 
                                                    id: `button${Date.now()}`, 
                                                    label: `Button ${(m.templateOverrides?.customButtons || []).length + 1}`, 
                                                    isPrimary: false 
                                                  }
                                                ]
                                              }
                                            }
                                          : m
                                      );
                                      updateStepModules(step.id, updatedModules);
                                    }}
                                    className="flex items-center space-x-1 text-sm text-indigo-700 hover:text-indigo-800"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Button</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Collection */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={collectFeedback}
                onChange={(e) => setCollectFeedback(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Collect feedback from candidates at the end of the job application flow
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              When enabled, candidates will see a feedback modal after completing the application
            </p>
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
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <span className="text-md font-medium text-gray-700">
        {editingFlow ? 'Edit Flow' : 'Create Flow'}
      </span>
    </div>

    {/* Center: Title */}
    <div className="flex-1 flex justify-center">
      
    </div>

    {/* Right: Close Button */}
    <button
      onClick={() => navigate('/')}
      className="p-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
</div>



     

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="w-full flex justify-end">
          <button
            onClick={handleSave}
            disabled={!canSave() || templatesLoading || isSaving}
            className={`
              px-4 py-2 rounded-[10px] transition-colors duration-200 flex items-center space-x-2
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
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
        primaryColor={primaryColor}
      />
    </div>
  );
}