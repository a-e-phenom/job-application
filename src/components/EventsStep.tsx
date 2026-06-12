import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, MapPin, Monitor, Check, HelpCircle } from 'lucide-react';
import { EventsData } from '../types/application';
import {
  ConfirmedEventSlot,
  DEFAULT_BOOTHS,
  EventBooth,
  HiringEvent,
  InterviewSlot,
  getAllInterviewSlots,
  slotsOverlap
} from '../types/events';
import { ModuleTemplate } from '../hooks/useTemplates';
import EventPreviewModal from './EventPreviewModal';

interface EventsStepProps {
  data: EventsData;
  onUpdate: (data: EventsData) => void;
  onValidate: (validateFn: () => boolean) => void;
  primaryColor: string;
  template?: ModuleTemplate;
  isMobileView?: boolean;
  candidateFirstName?: string;
}

export const DEFAULT_EVENTS: HiringEvent[] = [
  {
    id: 'tech-talent-connect',
    title: 'Tech Talent Connect Job Fair',
    imageUrl:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    locationLabel: 'INNOVATION & STARTUP CENTER, ALEXANDERPLATZ 5, BERLIN',
    locationType: 'in-person',
    dateLabel: 'THURSDAY, SEPTEMBER 12, 2026',
    summary: 'The concept is simple: no traditional interviews or hiring process....',
    modalDateTime: 'Thursday, September 12, 2026, 10:00 AM (GMT+2) – 4:00 PM (GMT+2)',
    modalLocation: 'Innovation & Startup Center, Alexanderplatz 5, Berlin, Germany, 10178',
    description: [
      'Tech Talent Connect is designed to help you meet companies in a natural, low-pressure environment. Instead of formal interviews, you can walk through the event, explore booths, and have real conversations with hiring teams about the work they do.',
      'Whether you are actively looking or just exploring what is out there, this event gives you a chance to understand team culture, technology stacks, and growth opportunities before committing to a formal process.',
      'Throughout the day, you will also find short talks, portfolio review corners, and informal Q&A sessions with engineers and recruiters.'
    ],
    bulletPoints: [
      'Meet multiple companies in one place',
      'Learn about real projects and technologies they are working with',
      'Understand team cultures and growth opportunities',
      'Get immediate feedback and guidance from hiring teams'
    ],
    organizers: [
      {
        id: 'david-anderson',
        name: 'David Anderson',
        role: 'Hiring Manager at T-Drive',
        avatarUrl:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&q=80'
      },
      {
        id: 'sarah-mitchell',
        name: 'Sarah Mitchell',
        role: 'Talent Partner at NovaTech',
        avatarUrl:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80'
      },
      {
        id: 'james-chen',
        name: 'James Chen',
        role: 'Engineering Lead at CloudBase',
        avatarUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80'
      }
    ]
  },
  {
    id: 'innovate-sphere-hiring-day',
    title: 'Innovate Sphere Tech Hiring Day',
    imageUrl:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    locationLabel: 'ONLINE EVENT',
    locationType: 'online',
    dateLabel: 'FRIDAY, SEPTEMBER 13, 2026',
    summary:
      'Attend our on-site hiring event to connect with leading child care centers looking for passionate educators and support staff.',
    modalDateTime: 'Friday, September 13, 2026, 9:00 AM (GMT+2) – 3:00 PM (GMT+2)',
    modalLocation: 'Online Event — join from anywhere with a stable internet connection',
    description: [
      'Innovate Sphere Tech Hiring Day brings together fast-growing startups and established tech companies in a single virtual venue. Drop into live sessions, visit digital booths, and schedule short intro chats with recruiters.',
      'The event is structured so you can move at your own pace — spend five minutes at a booth or stay for a deeper conversation. Every company shares open roles, team structure, and what success looks like in the first 90 days.',
      'You will leave with a clearer picture of which teams align with your skills and career goals, plus direct contacts for follow-up conversations.'
    ],
    bulletPoints: [
      'Join from anywhere with live video booths',
      'Explore roles across engineering, product, and design',
      'Book short intro chats with hiring managers',
      'Receive follow-up resources after the event'
    ],
    organizers: [
      {
        id: 'emma-wright',
        name: 'Emma Wright',
        role: 'Recruiting Lead at Innovate Sphere',
        avatarUrl:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&q=80'
      },
      {
        id: 'marcus-lee',
        name: 'Marcus Lee',
        role: 'Campus Recruiter at BrightPath',
        avatarUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80'
      }
    ]
  }
];

export default function EventsStep({
  data,
  onUpdate,
  onValidate,
  primaryColor,
  template,
  isMobileView = false,
  candidateFirstName = 'Jane'
}: EventsStepProps) {
  const [previewEventId, setPreviewEventId] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [hoveredConflictSlotId, setHoveredConflictSlotId] = useState<string | null>(null);

  const firstName = candidateFirstName.trim() || 'Jane';
  const title = template?.content?.title || 'Hiring Events';
  const chooseEventSubtitle =
    template?.content?.subtitle ||
    'Select the most comfortable date for you, and book interview';
  const bookSessionsSubtitle =
    template?.content?.customFields?.bookSessionsSubtitle ||
    'Please select a session you would like to book.';
  const thankYouTitle =
    template?.content?.customFields?.thankYouTitle?.replace('{firstName}', firstName) ||
    `Thank you for registration, ${firstName}! 🎉`;
  const thankYouMessage =
    template?.content?.customFields?.thankYouMessage ||
    "You've successfully booked an interview session. We will send you an email with more details shortly. See you soon.";

  const events: HiringEvent[] = useMemo(() => {
    const templateEvents = template?.content?.customFields?.events;
    return Array.isArray(templateEvents) && templateEvents.length > 0
      ? templateEvents
      : DEFAULT_EVENTS;
  }, [template]);

  const booths: EventBooth[] = useMemo(() => {
    const templateBooths = template?.content?.customFields?.booths;
    return Array.isArray(templateBooths) && templateBooths.length > 0
      ? templateBooths
      : DEFAULT_BOOTHS;
  }, [template]);

  const allSlots = useMemo(() => getAllInterviewSlots(booths), [booths]);
  const previewEvent = events.find(event => event.id === previewEventId) ?? null;
  const selectedEvent = events.find(event => event.id === data.selectedEventId) ?? null;

  const selectedSlots = useMemo(
    () =>
      data.selectedSlotIds
        .map(slotId => allSlots.find(slot => slot.id === slotId))
        .filter((slot): slot is InterviewSlot => Boolean(slot)),
    [allSlots, data.selectedSlotIds]
  );

  const conflictingSlotIds = useMemo(() => {
    const conflicts = new Set<string>();
    for (const slot of allSlots) {
      if (data.selectedSlotIds.includes(slot.id)) continue;
      if (selectedSlots.some(selected => slotsOverlap(selected, slot))) {
        conflicts.add(slot.id);
      }
    }
    return conflicts;
  }, [allSlots, data.selectedSlotIds, selectedSlots]);

  const validateForm = useCallback((): boolean => {
    setHasAttemptedSubmit(true);
    if (data.phase === 'thank-you') return true;
    if (data.phase === 'book-sessions') return data.selectedSlotIds.length > 0;
    return Boolean(data.selectedEventId);
  }, [data.phase, data.selectedEventId, data.selectedSlotIds.length]);

  useEffect(() => {
    onValidate(validateForm);
  }, [onValidate, validateForm]);

  const handleSelectEvent = (eventId: string) => {
    onUpdate({
      ...data,
      selectedEventId: eventId,
      selectedSlotIds: [],
      confirmedSlots: [],
      phase: 'choose-event'
    });
  };

  const handleSelectSlot = (booth: EventBooth, slot: InterviewSlot) => {
    if (conflictingSlotIds.has(slot.id)) return;

    const boothSlotIds = new Set(booth.slots.map(item => item.id));
    const nextSelectedSlotIds = data.selectedSlotIds.filter(id => !boothSlotIds.has(id));

    if (!data.selectedSlotIds.includes(slot.id)) {
      nextSelectedSlotIds.push(slot.id);
    }

    onUpdate({
      ...data,
      selectedSlotIds: nextSelectedSlotIds.sort(
        (a, b) =>
          (allSlots.find(item => item.id === a)?.startMinutes ?? 0) -
          (allSlots.find(item => item.id === b)?.startMinutes ?? 0)
      )
    });
  };

  const renderLocationIcon = (locationType: HiringEvent['locationType']) =>
    locationType === 'online' ? (
      <Monitor className="h-4 w-4 shrink-0 text-[#637085]" />
    ) : (
      <MapPin className="h-4 w-4 shrink-0 text-[#637085]" />
    );

  const renderStatusBadge = (status: ConfirmedEventSlot['status']) => {
    if (status === 'registered') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#E6F4EA] px-2 py-1 text-xs font-medium text-[#1E7E34]">
          <Check className="h-3.5 w-3.5" />
          Registered
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-[#FFF4E5] px-2 py-1 text-xs font-medium text-[#B76E00]">
        <HelpCircle className="h-3.5 w-3.5" />
        Waitlisted
      </span>
    );
  };

  const renderThankYou = () => (
    <div className="w-full bg-white">
      <h1 className="mb-3 text-xl font-semibold text-[#353B46] md:text-[28px]">{thankYouTitle}</h1>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-[#464F5E] md:text-base">
        {thankYouMessage}
      </p>

      <div className="space-y-6">
        {data.confirmedSlots.map(slot => (
          <section key={slot.slotId}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#637085] md:text-base">
              {slot.sectionTitle}
            </h2>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-[#353B46] md:text-base">{slot.dateTime}</p>
              {renderStatusBadge(slot.status)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );

  const renderBookSessions = () => (
    <div className="w-full">
      <h1 className="mb-2 text-xl font-semibold text-[#353B46] md:text-2xl">{title}</h1>
      <p className="mb-6 text-sm text-[#637085] md:text-base">{bookSessionsSubtitle}</p>

      {hasAttemptedSubmit && data.selectedSlotIds.length === 0 && (
        <p className="mb-4 text-sm text-red-600">Please select at least one session to continue.</p>
      )}

      <div className={`grid gap-4 ${isMobileView ? 'grid-cols-1' : 'grid-cols-3'}`}>
        {booths.map(booth => (
          <article
            key={booth.id}
            className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <img src={booth.imageUrl} alt={booth.title} className="h-36 w-full object-cover" />
            <div className="flex flex-1 flex-col p-4">
              <h2 className="mb-4 text-base font-semibold text-[#353B46]">{booth.title}</h2>
              <div className="space-y-3">
                {booth.slots.map(slot => {
                  const isSelected = data.selectedSlotIds.includes(slot.id);
                  const isConflict = conflictingSlotIds.has(slot.id);

                  return (
                    <div key={slot.id} className="relative">
                      <button
                        type="button"
                        disabled={isConflict}
                        onClick={() => handleSelectSlot(booth, slot)}
                        onMouseEnter={() => isConflict && setHoveredConflictSlotId(slot.id)}
                        onMouseLeave={() => setHoveredConflictSlotId(null)}
                        className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                          isConflict
                            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                            : isSelected
                            ? 'border-2 border-[#353B46] bg-white text-[#353B46]'
                            : 'border-gray-200 bg-white text-[#353B46] hover:border-gray-300'
                        }`}
                        style={
                          isSelected && !isConflict
                            ? { borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }
                            : undefined
                        }
                      >
                        <p className="text-sm font-medium">{slot.title}</p>
                        <p className={`mt-1 text-sm ${isConflict ? 'text-gray-400' : 'text-[#637085]'}`}>
                          {slot.timeRange}
                        </p>
                      </button>

                      {isConflict && hoveredConflictSlotId === slot.id && (
                        <div className="absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-lg bg-[#353B46] px-3 py-2 text-center text-xs leading-snug text-white shadow-lg">
                          This session conflicts with another session that you have chosen.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );

  const renderEventSelection = () => (
    <div className="w-full">
      <h1 className="mb-2 text-xl font-semibold text-[#353B46] md:text-2xl">{title}</h1>
      <p className="mb-6 text-sm text-[#637085] md:text-base">{chooseEventSubtitle}</p>

      {hasAttemptedSubmit && !data.selectedEventId && (
        <p className="mb-4 text-sm text-red-600">Please select an event to continue.</p>
      )}

      <div className={`grid gap-4 ${isMobileView ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {events.map(event => {
          const isSelected = data.selectedEventId === event.id;

          return (
            <article
              key={event.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectEvent(event.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectEvent(event.id);
                }
              }}
              className={`flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white text-left transition-shadow hover:shadow-md ${
                isSelected ? 'shadow-md' : 'border-gray-200'
              }`}
              style={
                isSelected
                  ? { borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }
                  : undefined
              }
            >
              <img
                src={event.imageUrl}
                alt={event.title}
                className="h-40 w-full object-cover md:h-44"
              />

              <div className="flex flex-1 flex-col p-4">
                <h2 className="mb-3 text-base font-semibold leading-snug text-[#353B46]">
                  {event.title}
                </h2>

                <div className="mb-2 flex items-start gap-2 text-xs uppercase tracking-wide text-[#637085]">
                  {renderLocationIcon(event.locationType)}
                  <span className="line-clamp-2">{event.locationLabel}</span>
                </div>

                <div className="mb-3 flex items-start gap-2 text-xs uppercase tracking-wide text-[#637085]">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>{event.dateLabel}</span>
                </div>

                <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-[#464F5E]">
                  {event.summary}
                </p>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setPreviewEventId(event.id);
                  }}
                  className="self-start text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ color: primaryColor }}
                >
                  Learn More &gt;
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );

  const renderPhase = () => {
    if (data.phase === 'thank-you') return renderThankYou();
    if (data.phase === 'book-sessions') return renderBookSessions();
    return renderEventSelection();
  };

  return (
    <>
      {renderPhase()}

      <EventPreviewModal
        isOpen={Boolean(previewEventId)}
        onClose={() => setPreviewEventId(null)}
        event={previewEvent}
        isMobileView={isMobileView}
      />
    </>
  );
}
