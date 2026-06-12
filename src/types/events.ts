export type EventsPhase = 'choose-event' | 'book-sessions' | 'thank-you';

export type EventSlotStatus = 'registered' | 'waitlisted';

export interface EventRegistrationSession {
  sectionTitle: string;
  slotTitle: string;
  timeRange: string;
  status: EventSlotStatus;
}

export interface InterviewSlot {
  id: string;
  title: string;
  timeRange: string;
  startMinutes: number;
  endMinutes: number;
  sectionTitle: string;
  confirmationDateTime: string;
  waitlistedOnConfirm?: boolean;
}

export interface EventBooth {
  id: string;
  title: string;
  imageUrl: string;
  slots: InterviewSlot[];
}

export interface ConfirmedEventSlot {
  slotId: string;
  sectionTitle: string;
  dateTime: string;
  status: EventSlotStatus;
}

export interface EventOrganizer {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}

export interface HiringEvent {
  id: string;
  title: string;
  imageUrl: string;
  locationLabel: string;
  locationType: 'in-person' | 'online';
  dateLabel: string;
  summary: string;
  modalDateTime: string;
  modalLocation: string;
  description: string[];
  bulletPoints?: string[];
  organizers: EventOrganizer[];
}

export const DEFAULT_BOOTHS: EventBooth[] = [
  {
    id: 'booth-1',
    title: 'Booth 1',
    imageUrl:
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=600&q=80',
    slots: [
      {
        id: 'booth-1-slot-1',
        title: 'Interview Slot 1',
        timeRange: '10:00 AM - 10:30 AM',
        startMinutes: 600,
        endMinutes: 630,
        sectionTitle: 'Benefits & Perks Overview',
        confirmationDateTime: 'Thursday, October 8, 2026, 10:00 AM – 10:30 AM'
      },
      {
        id: 'booth-1-slot-2',
        title: 'Interview Slot 2',
        timeRange: '10:30 AM - 11:00 AM',
        startMinutes: 630,
        endMinutes: 660,
        sectionTitle: 'Benefits & Perks Overview',
        confirmationDateTime: 'Thursday, October 8, 2026, 10:30 AM – 11:00 AM'
      },
      {
        id: 'booth-1-slot-3',
        title: 'Interview Slot 3',
        timeRange: '11:00 AM - 11:30 AM',
        startMinutes: 660,
        endMinutes: 690,
        sectionTitle: 'Q&A Session',
        confirmationDateTime: 'Thursday, October 8, 2026, 11:00 AM – 11:30 AM'
      }
    ]
  },
  {
    id: 'booth-2',
    title: 'Booth 2',
    imageUrl:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=600&q=80',
    slots: [
      {
        id: 'booth-2-slot-1',
        title: 'Interview Slot 1',
        timeRange: '10:00 AM - 10:30 AM',
        startMinutes: 600,
        endMinutes: 630,
        sectionTitle: 'Benefits & Perks Overview',
        confirmationDateTime: 'Thursday, October 8, 2026, 10:00 AM – 10:30 AM'
      },
      {
        id: 'booth-2-slot-2',
        title: 'Interview Slot 2',
        timeRange: '10:30 AM - 11:00 AM',
        startMinutes: 630,
        endMinutes: 660,
        sectionTitle: 'Q&A Session',
        confirmationDateTime: 'Thursday, October 8, 2026, 10:30 AM – 11:00 AM'
      },
      {
        id: 'booth-2-slot-3',
        title: 'Interview Slot 3',
        timeRange: '11:00 AM - 11:30 AM',
        startMinutes: 660,
        endMinutes: 690,
        sectionTitle: 'Q&A Session',
        confirmationDateTime: 'Thursday, October 8, 2026, 11:00 AM – 11:30 AM'
      }
    ]
  },
  {
    id: 'booth-3',
    title: 'Booth 3',
    imageUrl:
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80',
    slots: [
      {
        id: 'booth-3-slot-1',
        title: 'Interview Slot 1',
        timeRange: '10:30 AM - 11:00 AM',
        startMinutes: 630,
        endMinutes: 660,
        sectionTitle: 'Q&A Session',
        confirmationDateTime: 'Thursday, October 8, 2026, 10:30 AM – 11:00 AM'
      },
      {
        id: 'booth-3-slot-2',
        title: 'Interview Slot 2',
        timeRange: '11:00 AM - 11:30 AM',
        startMinutes: 660,
        endMinutes: 690,
        sectionTitle: 'Company Introduction',
        confirmationDateTime: 'Thursday, October 8, 2026, 11:00 AM – 11:30 AM'
      },
      {
        id: 'booth-3-slot-3',
        title: 'Interview Slot 3',
        timeRange: '11:30 AM - 12:00 PM',
        startMinutes: 690,
        endMinutes: 720,
        sectionTitle: 'Company Introduction',
        confirmationDateTime: 'Thursday, October 8, 2026, 11:30 AM – 12:00 PM',
        waitlistedOnConfirm: true
      }
    ]
  }
];

export const getAllInterviewSlots = (booths: EventBooth[] = DEFAULT_BOOTHS): InterviewSlot[] =>
  booths.flatMap(booth => booth.slots);

export const slotsOverlap = (a: InterviewSlot, b: InterviewSlot) =>
  a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;

export const buildConfirmedSlots = (
  selectedSlotIds: string[],
  booths: EventBooth[] = DEFAULT_BOOTHS
): ConfirmedEventSlot[] => {
  const allSlots = getAllInterviewSlots(booths);
  return selectedSlotIds
    .map(slotId => allSlots.find(slot => slot.id === slotId))
    .filter((slot): slot is InterviewSlot => Boolean(slot))
    .sort((a, b) => a.startMinutes - b.startMinutes)
    .map(slot => ({
      slotId: slot.id,
      sectionTitle: slot.sectionTitle,
      dateTime: slot.confirmationDateTime,
      status: slot.waitlistedOnConfirm ? 'waitlisted' : 'registered'
    }));
};
