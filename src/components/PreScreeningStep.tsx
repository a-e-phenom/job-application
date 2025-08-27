import React, { useState, useEffect } from 'react';
import { PreScreeningInfo } from '../types/application';
import { ModuleTemplate } from '../hooks/useTemplates';

interface PreScreeningStepProps {
  data: PreScreeningInfo;
  onUpdate: (data: PreScreeningInfo) => void;
  onValidate: (validateFn: () => boolean) => void;
  primaryColor: string;
  template?: ModuleTemplate;
}

const PreScreeningStep = React.memo(function PreScreeningStep({ data, onUpdate, onValidate, primaryColor, template }: PreScreeningStepProps) {
  // Local state to prevent parent updates on every change
  const [localData, setLocalData] = useState<PreScreeningInfo>(data);
  const [errors, setErrors] = useState<Partial<PreScreeningInfo>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Update local state when parent data changes (e.g., when navigating between steps)
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const validateForm = React.useCallback((): boolean => {
    // Always update parent state and return true (no validation)
    onUpdate(localData);
    return true;
  }, [localData, onUpdate]);

  useEffect(() => {
    onValidate(validateForm);
  }, [onValidate, validateForm]);

  useEffect(() => {
    if (hasAttemptedSubmit) {
      const newErrors: Partial<PreScreeningInfo> = {};
      let hasChanges = false;

      Object.keys(localData).forEach((key) => {
        const field = key as keyof PreScreeningInfo;
        if (localData[field] && errors[field]) {
          hasChanges = true;
        } else if (errors[field]) {
          newErrors[field] = errors[field];
        }
      });

      if (hasChanges) {
        setErrors(newErrors);
      }
    }
  }, [localData, errors, hasAttemptedSubmit]);

  const handleChange = React.useCallback((field: keyof PreScreeningInfo, value: string) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  }, []);

  const CustomRadioGroup = React.memo(({ 
    name, 
    question, 
    value, 
    onChange, 
    options = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
    error 
  }: {
    name: string;
    question: string;
    value: string;
    onChange: (value: string) => void;
    options?: { value: string; label: string }[];
    error?: string;
  }) => (
    <div className="mb-8">
      <p className="text-[16px] text-[#464F5E] mb-4 leading-relaxed">{question}</p>
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <div 
              key={option.value}
              onClick={() => onChange(option.value)}
              className="flex items-center cursor-pointer group"
            >
              <div className="relative flex items-center justify-center">
                <div 
                  className={`
                    w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                    ${isSelected
                      ? 'text-white'
                      : 'border-gray-300 bg-white'
                    }
                  `}
                  style={{
                    backgroundColor: isSelected ? primaryColor : undefined,
                    borderColor: isSelected ? primaryColor : undefined
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = `${primaryColor}66`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }
                  }}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <span className="ml-3 text-[16px] text-[#464F5E] select-none">
                {option.label}
              </span>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  ));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-[18px] font-semibold text-[#353B46] mb-1">
          {template?.content.title || 'Pre-application questionnaire'}
        </h2>
        {(template?.content.subtitle || 'This role has the following requirements:') && (
          <p className="text-[14px] text-[#464F5E]">
            {template?.content.subtitle || 'This role has the following requirements:'}
          </p>
        )}
      </div>

      <div className="space-y-6 text-lg">
        <CustomRadioGroup
          name="isAtLeast18"
          question="Are you at least 18 of age?"
          value={localData.isAtLeast18}
          onChange={React.useCallback((value) => handleChange('isAtLeast18', value), [handleChange])}
          error={errors.isAtLeast18}
        />

        <CustomRadioGroup
          name="workAuthorization"
          question="Are you legally authorized to work in the United States?"
          value={localData.workAuthorization}
          onChange={React.useCallback((value) => handleChange('workAuthorization', value), [handleChange])}
          error={errors.workAuthorization}
        />

        <CustomRadioGroup
          name="requiresSponsorship"
          question="Will you now or in the future require sponsorship to work in the US? (For example, H1B or TN visa?)"
          value={localData.requiresSponsorship}
          onChange={React.useCallback((value) => handleChange('requiresSponsorship', value), [handleChange])}
          error={errors.requiresSponsorship}
        />

        <CustomRadioGroup
          name="hasTransportation"
          question="Do you have reliable transportation?"
          value={localData.hasTransportation}
          onChange={React.useCallback((value) => handleChange('hasTransportation', value), [handleChange])}
          error={errors.hasTransportation}
        />

        <CustomRadioGroup
          name="travelDistance"
          question="How far are you willing to travel?"
          value={localData.travelDistance}
          onChange={React.useCallback((value) => handleChange('travelDistance', value), [handleChange])}
          options={[
            { value: 'short', label: 'Short (0 - 10 miles)' },
            { value: 'medium', label: 'Medium (11 - 25 miles)' },
            { value: 'long', label: 'Long (25 - 50+ miles)' }
          ]}
          error={errors.travelDistance}
        />
      </div>
    </div>
  );
});

export default PreScreeningStep;