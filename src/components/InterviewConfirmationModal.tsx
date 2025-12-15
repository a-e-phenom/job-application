import { X, Video, Calendar, Globe } from 'lucide-react';

interface InterviewConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobTitle?: string;
  selectedDate: string;
  selectedTime: string;
  timezone: string;
  primaryColor?: string;
  isMobileView?: boolean;
}

export default function InterviewConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  jobTitle = 'Interview',
  selectedDate,
  selectedTime,
  timezone,
  primaryColor = '#6366F1',
  isMobileView = false
}: InterviewConfirmationModalProps) {
  console.log('InterviewConfirmationModal - isOpen:', isOpen);
  console.log('InterviewConfirmationModal - selectedDate:', selectedDate);
  console.log('InterviewConfirmationModal - selectedTime:', selectedTime);
  
  if (!isOpen) return null;

  // Format the date to a more readable format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Format timezone label
  const formatTimezone = (tz: string) => {
    const timezoneMap: { [key: string]: string } = {
      'UTC+05:30': '(UTC + 05:30) Asia / Calcutta',
      'UTC-08:00': '(UTC - 08:00) America / Los_Angeles',
      'UTC-05:00': '(UTC - 05:00) America / New_York',
      'UTC+00:00': '(UTC + 00:00) Europe / London',
    };
    return timezoneMap[tz] || tz;
  };

  return (
    <div className={`${isMobileView ? 'absolute' : 'fixed'} inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isMobileView ? 'px-2' : 'px-4'}`}>
      <div className={`bg-white rounded-2xl shadow-2xl ${isMobileView ? 'w-full max-w-none' : 'max-w-2xl w-full'} ${isMobileView ? 'mx-0' : 'mx-4'} overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b border-gray-200 bg-white ${isMobileView ? 'px-4 py-4' : 'px-6 py-5'}`}>
          <h2 className={isMobileView ? "text-[16px] font-medium text-[#353B46]" : "text-[18px] font-medium text-[#353B46]"}>Confirm interview</h2>
          <button
            onClick={onClose}
            className={`hover:bg-gray-100 rounded-full transition-colors duration-200 ${isMobileView ? 'p-0.5' : 'p-1'}`}
          >
            <X className={isMobileView ? "w-4 h-4 text-gray-600" : "w-5 h-5 text-gray-600"} />
          </button>
        </div>

        {/* Content */}
        <div className={`${isMobileView ? 'px-4 py-4' : 'px-6 py-6'}`} style={{ backgroundColor: '#F8F9FB' }}>
          {/* Interview Details Card */}
          <div className={`bg-white rounded-xl border border-gray-200 ${isMobileView ? 'p-3 mb-3' : 'p-4 mb-4'}`}>
            {/* Job Title */}
            <h3 className={isMobileView ? "text-md font-medium text-[#353B46] mb-2" : "text-md font-medium text-[#353B46] mb-2"}>
              Sales Manager
            </h3>

            {/* Meeting Platform */}
            <div className={`flex items-center space-x-2 text-gray-600 ${isMobileView ? 'mb-3' : 'mb-4'}`}>
              <Video className={isMobileView ? "w-4 h-4" : "w-4 h-4"} />
              <span className={isMobileView ? "text-sm" : "text-sm"}>Google Meet</span>
            </div>

            {/* Date and Time */}
            <div className={`flex items-center space-x-2 text-gray-600 ${isMobileView ? 'mb-3' : 'mb-4'}`}>
              <Calendar className={isMobileView ? "w-4 h-4" : "w-4 h-4"} />
              <span className={isMobileView ? "text-sm" : "text-sm"}>
                {selectedTime}, {formatDate(selectedDate)}
              </span>
            </div>

            {/* Timezone */}
            <div className="flex items-center space-x-2 text-gray-600">
              <Globe className={isMobileView ? "w-4 h-4" : "w-4 h-4"} />
              <span className={isMobileView ? "text-sm" : "text-sm"}>{formatTimezone(timezone)}</span>
            </div>
          </div>

          {/* Confirmation Question */}
          <p className={`text-[#464F5E] mb-0 ${isMobileView ? 'text-sm' : ''}`}>
            Are you sure about the selected date and time?
          </p>
        </div>

        {/* Footer with Action Buttons */}
        <div className={`bg-white border-t border-gray-200 ${isMobileView ? 'px-4 py-3' : 'px-6 py-4'}`}>
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-5 h-[44px] rounded-xl border border-gray-300 text-[#353B46] text-sm hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Back to Edit
            </button>
            <button
              onClick={onConfirm}
              className="px-5 h-[44px] rounded-xl text-white text-sm font-medium transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

