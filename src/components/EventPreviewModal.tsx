import { X, Calendar, MapPin } from 'lucide-react';
import { HiringEvent } from '../types/events';

interface EventPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: HiringEvent | null;
  isMobileView?: boolean;
}

export default function EventPreviewModal({
  isOpen,
  onClose,
  event,
  isMobileView = false
}: EventPreviewModalProps) {
  if (!isOpen || !event) return null;

  return (
    <div
      className={`${isMobileView ? 'absolute' : 'fixed'} inset-0 z-50 flex items-center justify-center bg-black/50 ${
        isMobileView ? 'px-2' : 'px-4'
      }`}
      onClick={onClose}
    >
      <div
        className={`flex max-h-[90vh] flex-col overflow-hidden bg-white shadow-2xl ${
          isMobileView ? 'mx-0 w-full max-w-none rounded-2xl' : 'mx-4 w-full max-w-2xl rounded-2xl'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div
          className={`flex shrink-0 items-center justify-between border-b border-gray-200 bg-white ${
            isMobileView ? 'px-4 py-4' : 'px-6 py-5'
          }`}
        >
          <h2 className={`font-medium text-[#353B46] ${isMobileView ? 'text-base' : 'text-lg'}`}>
            Event Preview
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full transition-colors hover:bg-gray-100 ${isMobileView ? 'p-0.5' : 'p-1'}`}
            aria-label="Close event preview"
          >
            <X className={`text-gray-600 ${isMobileView ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </button>
        </div>

        <div className={`min-h-0 flex-1 overflow-y-auto ${isMobileView ? 'px-4 py-4' : 'px-6 py-6'}`}>
          <img
            src={event.imageUrl}
            alt={event.title}
            className="mb-5 h-48 w-full rounded-xl object-cover md:h-56"
          />

          <h3 className={`mb-4 font-semibold text-[#353B46] ${isMobileView ? 'text-xl' : 'text-2xl'}`}>
            {event.title}
          </h3>

          <div className={`mb-5 grid gap-4 ${isMobileView ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="flex items-start gap-2 text-sm text-[#464F5E]">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#637085]" />
              <span>{event.modalDateTime}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-[#464F5E]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#637085]" />
              <span>{event.modalLocation}</span>
            </div>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-[#464F5E]">
            {event.description.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {event.bulletPoints && event.bulletPoints.length > 0 && (
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#464F5E]">
              {event.bulletPoints.map(point => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}

          {event.organizers.length > 0 && (
            <div className="mt-8">
              <h4 className="mb-4 text-base font-semibold text-[#353B46]">Organizers</h4>
              <div className="space-y-3">
                {event.organizers.map(organizer => (
                  <div
                    key={organizer.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 p-3"
                  >
                    <img
                      src={organizer.avatarUrl}
                      alt={organizer.name}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#353B46]">{organizer.name}</p>
                      <p className="truncate text-xs text-[#637085]">{organizer.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
