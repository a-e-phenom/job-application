import { X, Calendar, MapPin, Monitor } from 'lucide-react';
import { HiringEvent } from '../types/events';

interface EventRegistrationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  event: HiringEvent | null;
  primaryColor?: string;
  isMobileView?: boolean;
}

export default function EventRegistrationConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  event,
  primaryColor = '#6366F1',
  isMobileView = false
}: EventRegistrationConfirmationModalProps) {
  if (!isOpen || !event) return null;

  const LocationIcon = event.locationType === 'online' ? Monitor : MapPin;

  return (
    <div
      className={`${isMobileView ? 'absolute' : 'fixed'} inset-0 z-50 flex items-center justify-center bg-black/50 ${
        isMobileView ? 'px-2' : 'px-4'
      }`}
      onClick={onClose}
    >
      <div
        className={`overflow-hidden bg-white shadow-2xl ${
          isMobileView ? 'mx-0 w-full max-w-none rounded-2xl' : 'mx-4 w-full max-w-2xl rounded-2xl'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between border-b border-gray-200 bg-white ${
            isMobileView ? 'px-4 py-4' : 'px-6 py-5'
          }`}
        >
          <h2 className={`font-medium text-[#353B46] ${isMobileView ? 'text-base' : 'text-lg'}`}>
            Confirm registration
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full transition-colors hover:bg-gray-100 ${isMobileView ? 'p-0.5' : 'p-1'}`}
            aria-label="Close confirmation"
          >
            <X className={`text-gray-600 ${isMobileView ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </button>
        </div>

        <div className={`${isMobileView ? 'px-4 py-4' : 'px-6 py-6'}`} style={{ backgroundColor: '#F8F9FB' }}>
          <div className={`rounded-xl border border-gray-200 bg-white ${isMobileView ? 'mb-3 p-3' : 'mb-4 p-4'}`}>
            <h3 className="mb-3 text-base font-medium text-[#353B46]">{event.title}</h3>

            <div className={`mb-3 flex items-start gap-2 text-sm text-[#464F5E] ${isMobileView ? '' : ''}`}>
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#637085]" />
              <span>{event.modalDateTime}</span>
            </div>

            <div className="flex items-start gap-2 text-sm text-[#464F5E]">
              <LocationIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#637085]" />
              <span>{event.modalLocation}</span>
            </div>
          </div>

          <p className={`text-[#464F5E] ${isMobileView ? 'text-sm' : ''}`}>
            Are you sure you want to register for this event?
          </p>
        </div>

        <div className={`border-t border-gray-200 bg-white ${isMobileView ? 'px-4 py-3' : 'px-6 py-4'}`}>
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="h-[44px] rounded-xl border border-gray-300 px-5 text-sm font-medium text-[#353B46] transition-colors hover:bg-gray-50"
            >
              Back to Edit
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="h-[44px] rounded-xl px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
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
