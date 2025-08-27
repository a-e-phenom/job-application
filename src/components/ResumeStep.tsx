import React, { useState, useEffect, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { ModuleTemplate } from '../hooks/useTemplates';

interface ResumeData {
  resumeFile: File | null;
  previouslyWorked: string;
  howDidYouHear: string;
}

interface ResumeStepProps {
  data: ResumeData;
  onUpdate: (data: ResumeData) => void;
  onValidate: (validateFn: () => boolean) => void;
  primaryColor: string;
  template?: ModuleTemplate;
}

const HOW_DID_YOU_HEAR_OPTIONS = [
  'Please Select',
  'Job Board (Indeed, LinkedIn, etc.)',
  'Company Website',
  'Referral from Employee',
  'Referral from Friend/Family',
  'Social Media',
  'Career Fair',
  'Recruiter',
  'Other'
];

const ResumeStep = React.memo(function ResumeStep({ data, onUpdate, onValidate, primaryColor, template }: ResumeStepProps) {
  const [localData, setLocalData] = useState<ResumeData>(data);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Partial<ResumeData>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const validateForm = React.useCallback((): boolean => {
    onUpdate(localData);
    return true; // No validation required for this step
  }, [localData, onUpdate]);

  useEffect(() => {
    onValidate(validateForm);
  }, [onValidate, validateForm]);

  const handleChange = React.useCallback((field: keyof ResumeData, value: string | File | null) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        handleChange('resumeFile', file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        handleChange('resumeFile', file);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
      'text/html',
      'image/png',
      'image/jpeg'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid file format (.pdf, .doc, .docx, .txt, .rtf, .html, .png, .jpg)');
      return false;
    }
    
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return false;
    }
    
    return true;
  };

  const removeFile = () => {
    handleChange('resumeFile', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const CustomRadioGroup = React.memo(({ 
    name, 
    question, 
    value, 
    onChange, 
    options = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
  }: {
    name: string;
    question: string;
    value: string;
    onChange: (value: string) => void;
    options?: { value: string; label: string }[];
  }) => (
    <div className="mb-8">
      <p className="text-[16px] text-[#464F5E] mb-4 leading-relaxed">{question}</p>
      <div className="flex items-center space-x-6">
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-[18px] font-semibold text-[#353B46] mb-1">
          {template?.content.title || 'Resume and additional info'}
        </h2>
        {(template?.content.subtitle || "Let's make sure you're not a secret agent. Or are you?") && (
          <p className="text-[14px] text-[#464F5E]">
            {template?.content.subtitle || "Let's make sure you're not a secret agent. Or are you?"}
          </p>
        )}
      </div>

      <div className="space-y-8">
        {/* Resume Upload Section */}
        <div>
          <p className="text-[16px] text-[#464F5E] mb-2 leading-relaxed">
            To help us understand your past experience better, please upload your resume.
          </p>
          <p className="text-[14px] text-[#637085] mb-4">
            File format: .pdf, .doc, .docx, .txt, .rtf, .html, .png | File size limit: 10MB
          </p>
          
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
              ${dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.rtf,.html,.png,.jpg,.jpeg"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {localData.resumeFile ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                  <span className="text-[14px] text-[#464F5E]">{localData.resumeFile.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <p className="text-[16px] text-[#464F5E] mb-2">
                  Drop file here or <span 
                    className="font-medium cursor-pointer"
                    style={{ color: primaryColor }}
                  >
                    select a file to upload
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Previously Worked Question */}
        <CustomRadioGroup
          name="previouslyWorked"
          question='Have you previously worked for us? If "yes", please provide information below as accurately as possible. CURRENT WORKERS: Please apply internally.'
          value={localData.previouslyWorked}
          onChange={React.useCallback((value) => handleChange('previouslyWorked', value), [handleChange])}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]}
        />

        {/* How Did You Hear About Us */}
        <div>
          <p className="text-[16px] text-[#464F5E] mb-4 leading-relaxed">
            How did you hear about us?
          </p>
          <div className="relative">
            <select
              value={localData.howDidYouHear}
              onChange={(e) => handleChange('howDidYouHear', e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 text-[16px] text-[#464F5E] focus:outline-none focus:ring-2 focus:border-transparent"
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
            >
              {HOW_DID_YOU_HEAR_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            
            {/* Custom dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
              <svg
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 011.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ResumeStep;