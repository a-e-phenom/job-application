import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { ModuleTemplate } from '../hooks/useTemplates';

interface ScreeningData {
  workEligibility: string;
  department: string;
  services: string[];
  motivation: string;
  weekdayDayShift: boolean;
  weekdayNightShift: boolean;
  weekdayNightShift2: boolean;
  weekendDayShift: boolean;
  weekendNightShift: boolean;
  weekendNightShift2: boolean;
}

interface ScreeningStepProps {
  data: ScreeningData;
  onUpdate: (data: ScreeningData) => void;
  onValidate: (validateFn: () => boolean) => void;
  primaryColor: string;
  template?: ModuleTemplate;
}

const ScreeningStep = React.memo(function ScreeningStep({ data, onUpdate, onValidate, primaryColor, template }: ScreeningStepProps) {
  const [localData, setLocalData] = useState<ScreeningData>(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const validateForm = React.useCallback((): boolean => {
    onUpdate(localData);
    return true;
  }, [localData, onUpdate]);

  useEffect(() => {
    onValidate(validateForm);
  }, [onValidate, validateForm]);

  const handleChange = React.useCallback((field: keyof ScreeningData, value: string | boolean | string[]) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleServiceToggle = React.useCallback((service: string) => {
    setLocalData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  }, []);

  const CustomRadioGroup = React.memo(({ 
    name, 
    question, 
    value, 
    onChange, 
    options 
  }: {
    name: string;
    question: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
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
    </div>
  ));

  const CustomCheckbox = React.memo(({ 
    checked, 
    onChange, 
    label 
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
  }) => (
    <div 
      onClick={() => onChange(!checked)}
      className="flex items-center cursor-pointer group mb-3"
    >
      <div className="relative flex items-center justify-center">
        <div 
          className={`
            w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
            ${checked
              ? 'text-white'
              : 'border-gray-300 bg-white'
            }
          `}
          style={{
            backgroundColor: checked ? primaryColor : undefined,
            borderColor: checked ? primaryColor : '#D1D5DB'
          }}
          onMouseEnter={(e) => {
            if (!checked) {
              e.currentTarget.style.borderColor = `${primaryColor}66`;
            }
          }}
          onMouseLeave={(e) => {
            if (!checked) {
              e.currentTarget.style.borderColor = '#D1D5DB';
            }
          }}
        >
          {checked && (
            <Check className="w-3 h-3 text-white" />
          )}
        </div>
      </div>
      <span className="ml-3 text-[16px] text-[#464F5E] select-none">
        {label}
      </span>
    </div>
  ));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-[18px] font-semibold text-[#353B46] mb-1">
          {template?.content.title || 'Application questions'}
        </h2>
        {(template?.content.subtitle || 'This role has the following requirements:') && (
          <p className="text-[14px] text-[#464F5E]">
            {template?.content.subtitle || 'This role has the following requirements:'}
          </p>
        )}
      </div>

      <div className="space-y-6">
        <CustomRadioGroup
          name="workEligibility"
          question="Are you legally eligible to work in the United States?"
          value={localData.workEligibility}
          onChange={React.useCallback((value) => handleChange('workEligibility', value), [handleChange])}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]}
        />

        <CustomRadioGroup
          name="department"
          question="Which department interests you?"
          value={localData.department}
          onChange={React.useCallback((value) => handleChange('department', value), [handleChange])}
          options={[
            { value: 'management', label: 'Management' },
            { value: 'sales', label: 'Sales' }
          ]}
        />

        <div className="mb-8">
          <p className="text-[16px] text-[#464F5E] mb-4 leading-relaxed">Which services are you familiar with?</p>
          <div className="space-y-3">
            <CustomCheckbox
              checked={localData.services.includes('e-services')}
              onChange={() => handleServiceToggle('e-services')}
              label="E-Services"
            />
            <CustomCheckbox
              checked={localData.services.includes('convenience-store')}
              onChange={() => handleServiceToggle('convenience-store')}
              label="Convenience store and gas station"
            />
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[16px] text-[#464F5E] mb-4 leading-relaxed">What motivates you?</p>
          <textarea
            value={localData.motivation}
            onChange={(e) => handleChange('motivation', e.target.value)}
            placeholder="Type answer"
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-vertical text-[16px] text-[#464F5E] placeholder-[#9CA3AF]"
            style={{
              focusRingColor: `${primaryColor}33`,
              focusBorderColor: primaryColor
            }}
            onFocus={(e) => {
              e.target.style.borderColor = primaryColor;
              e.target.style.boxShadow = `0 0 0 3px ${primaryColor}33`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div className="mb-8">
          <p className="text-[16px] text-[#464F5E] mb-6 leading-relaxed">
            Please indicate which shifts you will be available to work.
          </p>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50">
              <div className="p-4 border-r border-gray-200"></div>
              <div className="p-4 border-r border-gray-200 text-center">
                <span className="text-[14px] font-medium text-[#464F5E]">Weekdays</span>
              </div>
              <div className="p-4 text-center">
                <span className="text-[14px] font-medium text-[#464F5E]">Weekends</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 border-t border-gray-200">
              <div className="p-4 border-r border-gray-200">
                <span className="text-[14px] text-[#464F5E]">Day Shift</span>
              </div>
              <div className="p-4 border-r border-gray-200 flex justify-center">
                <CustomCheckbox
                  checked={localData.weekdayDayShift}
                  onChange={(checked) => handleChange('weekdayDayShift', checked)}
                  label=""
                />
              </div>
              <div className="p-4 flex justify-center">
                <CustomCheckbox
                  checked={localData.weekendDayShift}
                  onChange={(checked) => handleChange('weekendDayShift', checked)}
                  label=""
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 border-t border-gray-200">
              <div className="p-4 border-r border-gray-200">
                <span className="text-[14px] text-[#464F5E]">Night Shift</span>
              </div>
              <div className="p-4 border-r border-gray-200 flex justify-center">
                <CustomCheckbox
                  checked={localData.weekdayNightShift}
                  onChange={(checked) => handleChange('weekdayNightShift', checked)}
                  label=""
                />
              </div>
              <div className="p-4 flex justify-center">
                <CustomCheckbox
                  checked={localData.weekendNightShift}
                  onChange={(checked) => handleChange('weekendNightShift', checked)}
                  label=""
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 border-t border-gray-200">
              <div className="p-4 border-r border-gray-200">
                <span className="text-[14px] text-[#464F5E]">Night Shift</span>
              </div>
              <div className="p-4 border-r border-gray-200 flex justify-center">
                <CustomCheckbox
                  checked={localData.weekdayNightShift2}
                  onChange={(checked) => handleChange('weekdayNightShift2', checked)}
                  label=""
                />
              </div>
              <div className="p-4 flex justify-center">
                <CustomCheckbox
                  checked={localData.weekendNightShift2}
                  onChange={(checked) => handleChange('weekendNightShift2', checked)}
                  label=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ScreeningStep;