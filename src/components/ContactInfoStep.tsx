import React, { useState, useEffect } from 'react';
import { ContactInfo } from '../types/application';
import { ModuleTemplate } from '../hooks/useTemplates';

interface ContactInfoStepProps {
  data: ContactInfo;
  onUpdate: (data: ContactInfo) => void;
  onValidate: (validateFn: () => boolean) => void;
  template?: ModuleTemplate;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

export default function ContactInfoStep({ data, onUpdate, onValidate, template }: ContactInfoStepProps) {
  const [errors, setErrors] = useState<Partial<ContactInfo>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const validateForm = React.useCallback((): boolean => {
    const newErrors: Partial<ContactInfo> = {};

    // Only validate email format if provided
    if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    setHasAttemptedSubmit(true);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  useEffect(() => {
    onValidate(validateForm);
  }, [onValidate, validateForm]);

  useEffect(() => {
    if (!hasAttemptedSubmit) return;

    const newErrors = { ...errors };
    let changed = false;

    // Clear email error if valid format or empty
    if ((!data.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) && errors.email) {
      delete newErrors.email;
      changed = true;
    }

    if (changed) setErrors(newErrors);
  }, [data, errors, hasAttemptedSubmit]);

  const handleChange = (field: keyof ContactInfo, value: string | boolean) => {
    onUpdate({ ...data, [field]: value });
  };

  // If template has questions, use dynamic rendering
  if (template?.content.questions && template.content.questions.length > 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-[18px] font-semibold text-[#353B46] mb-1">
            {template.content.title || 'Contact Information'}
          </h2>
          {template.content.subtitle && (
            <p className="text-[14px] text-[#464F5E]">
              {template.content.subtitle}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {(() => {
            const questions = template.content.questions || [];
            const elements: JSX.Element[] = [];
            let i = 0;
            
            while (i < questions.length) {
              const question = questions[i];
              const nextQuestion = questions[i + 1];
              
              // Check if current and next questions are both half-width text/select
              const isCurrentHalfWidth = question.halfWidth && (question.type === 'text' || question.type === 'select');
              const isNextHalfWidth = nextQuestion?.halfWidth && (nextQuestion.type === 'text' || nextQuestion.type === 'select');
              
              if (isCurrentHalfWidth && isNextHalfWidth) {
                // Render two half-width inputs in one row
                elements.push(
                  <div key={`${question.id}-${nextQuestion.id}`} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] text-[#464F5E] mb-1">{question.text}</label>
                      {question.type === 'text' ? (
                        <input
                          type="text"
                          placeholder={`Type ${question.text.toLowerCase()}`}
                          value={data[question.id as keyof ContactInfo] as string || ''}
                          onChange={(e) => handleChange(question.id as keyof ContactInfo, e.target.value)}
                          className="w-full text-[14px] text-[#464F5E] placeholder-[#637085] px-4 py-2 border border-gray-300 rounded-[10px] transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <select
                          value={data[question.id as keyof ContactInfo] as string || ''}
                          onChange={(e) => handleChange(question.id as keyof ContactInfo, e.target.value)}
                          className="w-full text-[14px] text-[#464F5E] px-4 py-2 border border-gray-300 rounded-[10px] appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select {question.text.toLowerCase()}</option>
                          {question.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-[14px] text-[#464F5E] mb-1">{nextQuestion.text}</label>
                      {nextQuestion.type === 'text' ? (
                        <input
                          type="text"
                          placeholder={`Type ${nextQuestion.text.toLowerCase()}`}
                          value={data[nextQuestion.id as keyof ContactInfo] as string || ''}
                          onChange={(e) => handleChange(nextQuestion.id as keyof ContactInfo, e.target.value)}
                          className="w-full text-[14px] text-[#464F5E] placeholder-[#637085] px-4 py-2 border border-gray-300 rounded-[10px] transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <select
                          value={data[nextQuestion.id as keyof ContactInfo] as string || ''}
                          onChange={(e) => handleChange(nextQuestion.id as keyof ContactInfo, e.target.value)}
                          className="w-full text-[14px] text-[#464F5E] px-4 py-2 border border-gray-300 rounded-[10px] appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select {nextQuestion.text.toLowerCase()}</option>
                          {nextQuestion.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
                i += 2; // Skip next question since we processed it
              } else {
                // Render single question (full width or half width but no consecutive half)
                elements.push(
                  <div key={question.id} className={isCurrentHalfWidth ? "w-1/2" : "w-full"}>
                    <label className="block text-[14px] text-[#464F5E] mb-1">{question.text}</label>
                    {question.type === 'text' ? (
                      <input
                        type="text"
                        placeholder={`Type ${question.text.toLowerCase()}`}
                        value={data[question.id as keyof ContactInfo] as string || ''}
                        onChange={(e) => handleChange(question.id as keyof ContactInfo, e.target.value)}
                        className="w-full text-[14px] text-[#464F5E] placeholder-[#637085] px-4 py-2 border border-gray-300 rounded-[10px] transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <select
                        value={data[question.id as keyof ContactInfo] as string || ''}
                        onChange={(e) => handleChange(question.id as keyof ContactInfo, e.target.value)}
                        className="w-full text-[14px] text-[#464F5E] px-4 py-2 border border-gray-300 rounded-[10px] appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select {question.text.toLowerCase()}</option>
                        {question.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                  </div>
                );
                i += 1;
              }
            }
            
            return elements;
          })()}
        </div>
      </div>
    );
  }

  // Fallback to hardcoded layout if no template questions
  const inputBaseClass = `w-full text-[14px] text-[#464F5E] placeholder-[#637085] px-4 py-2 border rounded-[10px] transition focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-[18px] font-semibold text-[#353B46] mb-1">
          {template?.content.title || 'Contact Information'}
        </h2>
        {(template?.content.subtitle || "Let's make sure you're not a secret agent. Or are you?") && (
          <p className="text-[14px] text-[#464F5E]">
            {template?.content.subtitle || "Let's make sure you're not a secret agent. Or are you?"}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-[14px] text-[#464F5E] mb-1">First name</label>
            <input
              id="firstName"
              type="text"
              placeholder="Type first name"
              value={data.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={`${inputBaseClass} ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-[14px] text-[#464F5E] mb-1">Last name</label>
            <input
              id="lastName"
              type="text"
              placeholder="Type last name"
              value={data.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={`${inputBaseClass} ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="addressLine1" className="block text-[14px] text-[#464F5E] mb-1">Address Line 1</label>
          <input
            id="addressLine1"
            type="text"
            placeholder="Type address"
            value={data.addressLine1}
            onChange={(e) => handleChange('addressLine1', e.target.value)}
            className={`${inputBaseClass} ${errors.addressLine1 ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.addressLine1 && <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>}
        </div>

        <div>
          <label htmlFor="state" className="block text-[14px] text-[#464F5E] mb-1">State</label>
          <select
            id="state"
            value={data.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className={`${inputBaseClass} appearance-none bg-white ${errors.state ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          >
            <option value="">Select state</option>
            {US_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-[14px] text-[#464F5E] mb-1">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="Type email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`${inputBaseClass} ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-[14px] text-[#464F5E] mb-1">Phone number</label>
          <div className="flex space-x-2">
          <div className="relative w-28 max-w-xs">
  <select
    value={data.countryCode}
    onChange={(e) => handleChange('countryCode', e.target.value)}
    className="appearance-none w-28 text-[14px] text-[#464F5E] border border-gray-300 rounded-[10px] py-2 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    <option value="+1">🇺🇸 +1</option>
    <option value="+44">🇬🇧 +44</option>
    <option value="+33">🇫🇷 +33</option>
    <option value="+49">🇩🇪 +49</option>
  </select>

  {/* Custom arrow */}
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

            <input
              type="tel"
              placeholder="Type phone number"
              value={data.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              className={`${inputBaseClass} flex-1 ${errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            />
          </div>
          {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="optIn"
            checked={data.optInCommunications}
            onChange={(e) => handleChange('optInCommunications', e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="optIn" className="ml-3 text-sm text-[#464F5E]">I would like to opt-in to both SMS & Email</label>
        </div>
      </div>
    </div>
  );
}
