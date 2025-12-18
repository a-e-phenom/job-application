import React, { useState, useEffect } from 'react';
import { ModuleTemplate } from '../hooks/useTemplates';
import { Edit } from 'lucide-react';

interface ScreeningSummaryStepProps {
  data?: Record<string, any>;
  onUpdate?: (data: Record<string, any>) => void;
  onValidate?: (validateFn: () => boolean) => void;
  primaryColor: string;
  template?: ModuleTemplate;
  isMobileView?: boolean;
}

interface Section {
  id: string;
  title: string;
  fields: Array<{
    label: string;
    value: string;
  }>;
}

const ScreeningSummaryStep = React.memo(function ScreeningSummaryStep({ 
  data = {}, 
  onUpdate, 
  onValidate, 
  primaryColor, 
  template,
  isMobileView = false
}: ScreeningSummaryStepProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Get sections from template content
  const sections: Section[] = (template?.content as any)?.sections || [];

  const handleEdit = (sectionId: string) => {
    setEditingSection(sectionId);
    // In a real implementation, this would navigate back to the relevant step
    // For now, we'll just show the edit state
  };

  useEffect(() => {
    if (onValidate) {
      onValidate(() => true); // Always valid for summary page
    }
  }, [onValidate]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Title and Subtitle */}
      <div className="mb-8">
        <h2 className="text-[18px] font-semibold text-[#353B46] mb-1">
          {template?.content.title || 'Well done,'}
        </h2>
        {template?.content.subtitle && (
          <p className="text-[14px] text-[#464F5E]">
            {template.content.subtitle}
          </p>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.id} className="space-y-4">
            {/* Section Header with Edit Button */}
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[#353B46]">
                {section.title}
              </h3>
              <button
                onClick={() => handleEdit(section.id)}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-[#353B46] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                style={{
                  borderColor: '#D1D5DB'
                }}
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>

            {/* Section Fields */}
            <div className="space-y-4 pl-0">
              {section.fields.map((field, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-[14px] font-semibold text-[#353B46]">
                    {field.label}
                  </p>
                  <p className="text-[14px] text-[#464F5E]">
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ScreeningSummaryStep;
