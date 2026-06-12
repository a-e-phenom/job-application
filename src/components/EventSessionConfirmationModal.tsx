import { X, Calendar, HelpCircle } from 'lucide-react';
import { ConfirmedEventSlot } from '../types/events';

interface EventSessionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  slots: ConfirmedEventSlot[];
  primaryColor?: string;
  isMobileView?: boolean;
}

export default function EventSessionConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  slots,
  primaryColor = '#6366F1',
  isMobileView = false
}: EventSessionConfirmationModalProps) {
  if (!isOpen || slots.length === 0) return null;

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
            Confirm Interview Details
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
          <p className={`mb-5 text-[#464F5E] ${isMobileView ? 'text-sm' : ''}`}>
            We&apos;re looking forward to meeting you! Please review your interview time and confirm.
          </p>

          <div className="space-y-4">
            {slots.map((slot, index) => (
              <div key={slot.slotId} className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  {index === 0 ? (
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#637085]" />
                  ) : (
                    <span className="w-4 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#637085]">
                      {slot.sectionTitle}
                    </p>
                    <p className="mt-1 text-sm text-[#353B46]">{slot.dateTime}</p>
                  </div>
                </div>
                {slot.status === 'waitlisted' && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#FFF4E5] px-2 py-1 text-xs font-medium text-[#B76E00]">
                    <HelpCircle className="h-3.5 w-3.5" />
                    Waitlisted
                  </span>
                )}
              </div>
            ))}
          </div>
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
