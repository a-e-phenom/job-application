import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { ModuleTemplate } from '../hooks/useTemplates';

interface InterviewSchedulingData {
  selectedDate: string;
  selectedTime: string;
  timezone: string;
}

interface InterviewSchedulingStepProps {
  data: InterviewSchedulingData;
  onUpdate: (data: InterviewSchedulingData) => void;
  onValidate: (validateFn: () => boolean) => void;
  primaryColor: string;
  template?: ModuleTemplate;
  isMobileView?: boolean;
}

const TIMEZONES = [
  { value: 'UTC+05:30', label: '(UTC + 05:30) Asia / Calcutta' },
  { value: 'UTC-08:00', label: '(UTC - 08:00) America / Los_Angeles' },
  { value: 'UTC-05:00', label: '(UTC - 05:00) America / New_York' },
  { value: 'UTC+00:00', label: '(UTC + 00:00) Europe / London' },
];

const TIME_SLOTS = [
  '10:00 AM',
  '11:00 am',
  '12:00 AM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function InterviewSchedulingStep({ data, onUpdate, onValidate, primaryColor, template, isMobileView = false }: InterviewSchedulingStepProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [errors, setErrors] = useState<{ date?: string; time?: string }>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('InterviewSchedulingStep data:', data);
    console.log('Primary color:', primaryColor);
    console.log('Current month/year:', currentMonth, currentYear);
    console.log('Today:', today.toISOString().split('T')[0]);
  }, [data, primaryColor, currentMonth, currentYear]);

  const validateForm = React.useCallback((): boolean => {
    const newErrors: { date?: string; time?: string } = {};

    if (!data.selectedDate) newErrors.date = 'Please select a date';
    if (!data.selectedTime) newErrors.time = 'Please select a time';

    setErrors(newErrors);
    setHasAttemptedSubmit(true);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  useEffect(() => {
    onValidate(validateForm);
  }, [onValidate, validateForm]);

  useEffect(() => {
    if (hasAttemptedSubmit) {
      const newErrors = { ...errors };
      let hasChanges = false;

      if (data.selectedDate && errors.date) {
        delete newErrors.date;
        hasChanges = true;
      }
      if (data.selectedTime && errors.time) {
        delete newErrors.time;
        hasChanges = true;
      }

      if (hasChanges) {
        setErrors(newErrors);
      }
    }
  }, [data, errors, hasAttemptedSubmit]);

  const handleChange = (field: keyof InterviewSchedulingData, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday (0) to be last (6)
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const isDateSelected = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return data.selectedDate === dateStr;
  };

  const isDateAvailable = (day: number) => {
    // Mock availability - in real app this would come from API
    const unavailableDates = [9, 16]; // Example unavailable dates
    return !unavailableDates.includes(day);
  };

  const selectDate = (day: number) => {
    console.log('Date clicked:', day);
    if (!isDateAvailable(day)) {
      console.log('Date not available:', day);
      return;
    }
    
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    console.log('Setting date to:', dateStr);
    handleChange('selectedDate', dateStr);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={isMobileView ? "w-10 h-10" : "w-12 h-12"}></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = isDateSelected(day);
      const isAvailable = isDateAvailable(day);
      
      days.push(
        <button
          key={day}
          onClick={() => selectDate(day)}
          disabled={!isAvailable}
          className={`
            rounded-full flex items-center justify-center font-medium transition-all duration-200 border-2
            ${isMobileView ? 'w-10 h-10 text-xs' : 'w-12 h-12 text-sm'}
            ${isSelected
              ? 'text-white ring-4 ring-offset-2'
              : isAvailable
              ? 'text-gray-700 hover:bg-gray-100 border-gray-200'
              : 'text-gray-300 cursor-not-allowed border-gray-200'
            }
          `}
          style={{
            backgroundColor: isSelected ? primaryColor : undefined,
            borderColor: isSelected ? primaryColor : undefined
          }}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-[18px] font-semibold text-[#353B46] mb-1">
          {template?.content.title || 'Select date and time'}
        </h2>
        {template?.content.subtitle && (
          <p className="text-[14px] text-[#464F5E]">
            {template.content.subtitle}
          </p>
        )}
        {/* Debug info */}
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <p>Selected Date: {data.selectedDate || 'None'}</p>
          <p>Selected Time: {data.selectedTime || 'None'}</p>
          <p>Current Month/Year: {MONTHS[currentMonth]} {currentYear}</p>
        </div>
      </div>

      <div className={`grid gap-8 ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {/* Left side - Calendar */}
        <div className={isMobileView ? "space-y-4" : "space-y-6"}>
          {/* Timezone and Duration */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <select
                value={data.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className={`appearance-none bg-white border border-gray-300 rounded-lg pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${isMobileView ? 'px-3 py-1.5' : 'px-4 py-2'}`}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            
          </div>

          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <h3 className={isMobileView ? "text-base font-medium text-gray-900" : "text-lg font-medium text-gray-900"}>
              {MONTHS[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className={isMobileView ? "p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200" : "p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"}
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className={isMobileView ? "p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200" : "p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"}
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className={isMobileView ? "bg-white p-2 rounded-lg" : "bg-white"}>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((day) => (
                <div key={day} className={`flex items-center justify-center font-medium text-gray-500 ${isMobileView ? 'w-10 h-6 text-xs' : 'w-12 h-8 text-sm'}`}>
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>

          {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
        </div>

        {/* Right side - Time slots */}
        <div className="space-y-4">
        <div className="text-sm text-gray-600">
              Meeting duration | 60 min
            </div>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {TIME_SLOTS.map((time) => {
              const isSelected = data.selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => {
                    console.log('Time clicked:', time);
                    handleChange('selectedTime', time);
                  }}
                  style={{
                    backgroundColor: isSelected ? primaryColor : 'white',
                    borderColor: isSelected ? primaryColor : '#D1D5DB',
                    color: isSelected ? 'white' : '#374151'
                  }}
                  className={`
                    w-full rounded-lg border text-left transition-all duration-200
                    ${isMobileView ? 'px-3 py-2 text-sm' : 'px-4 py-3'}
                    ${isSelected
                      ? ''
                      : 'hover:border-gray-400 hover:bg-gray-50'
                    }
                  `}
                >
                  {time}
                </button>
              );
            })}
          </div>
          {errors.time && <p className="text-sm text-red-600">{errors.time}</p>}
        </div>
      </div>
    </div>
  );
}