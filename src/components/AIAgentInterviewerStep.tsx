import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Check,
  ChevronDown,
  AudioLines,
  MoreVertical
} from 'lucide-react';
import { AIAgentInterviewerData } from '../types/application';
import { ModuleTemplate } from '../hooks/useTemplates';

interface AIAgentInterviewerStepProps {
  data: AIAgentInterviewerData;
  onUpdate: (data: AIAgentInterviewerData) => void;
  onValidate: (validateFn: () => boolean) => void;
  primaryColor: string;
  onNext: () => void;
  template?: ModuleTemplate;
  isMobileView?: boolean;
  onFooterRender?: (footer: JSX.Element) => void;
  candidateFirstName?: string;
  candidateLastName?: string;
}

const DEFAULT_LEFT_IMAGE = '/aivideocallagent.png';
const DEFAULT_RIGHT_IMAGE = '/aivideocallcandidate.png';

const CALL_TAGS_ABOVE_FOOTER = 40;
const CALL_FOOTER_HEIGHT = 72;
const DEMO_WORD_INTERVAL_MS = 240;
const DEMO_UTTERANCE_PAUSE_MS = 750;
const OVERLAY_CHUNK_SIZE = 4;
const OVERLAY_CHUNK_BLANK_MS = 300;

type DemoSpeaker = 'agent' | 'candidate';

interface DemoUtterance {
  speaker: DemoSpeaker;
  text: string;
}

interface CompletedUtterance {
  id: string;
  speaker: DemoSpeaker;
  text: string;
  elapsedSeconds: number;
}

const buildDemoConversation = (firstName: string): DemoUtterance[] => [
  {
    speaker: 'agent',
    text: `Hi ${firstName}, thanks for joining today. I'm your AI interviewer, and we'll spend a few minutes getting to know each other.`
  },
  {
    speaker: 'candidate',
    text: `Thanks for having me! I'm excited to be here and happy to walk you through my experience.`
  },
  {
    speaker: 'agent',
    text: 'Great. To start, can you tell me about a recent project you are most proud of?'
  },
  {
    speaker: 'candidate',
    text: 'Recently I led a frontend rebuild that improved page load times by forty percent and made the experience much smoother for users.'
  }
];

const formatTranscriptTime = (seconds: number) => {
  if (seconds < 5) return 'Just now';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} sec`;
  return `${mins} min`;
};

const SpeakingIndicator = () => (
  <div className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
    <AudioLines className="h-4 w-4 text-[#637085]" />
  </div>
);

const EndCallIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
  </svg>
);

const activeSpeakerCardClass =
  'ring-4 ring-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]';

const DEVICE_FIELDS = [
  {
    id: 'microphone' as const,
    label: 'Microphone',
    options: [
      'MacBook Microphone (Built-in)',
      'AirPods Pro',
      'External USB Microphone',
      'iPhone Microphone'
    ]
  },
  {
    id: 'camera' as const,
    label: 'Camera',
    options: [
      'MacBook Camera (Built-in)',
      'iPhone Camera',
      'External Webcam'
    ]
  },
  {
    id: 'audio' as const,
    label: 'Audio',
    options: [
      'MacBook Speakers (Built-in)',
      'AirPods Pro',
      'External Speakers'
    ]
  }
];

const AIAgentInterviewerStep = React.memo(function AIAgentInterviewerStep({
  data,
  onUpdate,
  onValidate,
  primaryColor,
  onNext,
  template,
  isMobileView = false,
  onFooterRender,
  candidateFirstName = 'Chris',
  candidateLastName = ''
}: AIAgentInterviewerStepProps) {
  const [localData, setLocalData] = useState<AIAgentInterviewerData>(data);
  const [phase, setPhase] = useState<'setup' | 'call'>(data.callStarted ? 'call' : 'setup');
  const [consentChecked, setConsentChecked] = useState(data.consentGiven ?? true);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(data.callDuration ?? 0);
  const [transcriptPanelOpen, setTranscriptPanelOpen] = useState(false);
  const [transcriptOverlayEnabled, setTranscriptOverlayEnabled] = useState(true);
  const [callSettingsOpen, setCallSettingsOpen] = useState(false);
  const [videoFocus, setVideoFocus] = useState<'agent' | 'candidate'>('agent');
  const [utteranceIndex, setUtteranceIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [completedUtterances, setCompletedUtterances] = useState<CompletedUtterance[]>([]);
  const [demoFinished, setDemoFinished] = useState(false);
  const [overlayBlank, setOverlayBlank] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const callDurationRef = useRef(callDuration);
  const [deviceSelections, setDeviceSelections] = useState({
    microphone: DEVICE_FIELDS[0].options[0],
    camera: DEVICE_FIELDS[1].options[0],
    audio: DEVICE_FIELDS[2].options[0]
  });

  const firstName = candidateFirstName.trim() || 'Chris';
  const lastInitial = (candidateLastName.trim().charAt(0) || firstName.charAt(1) || 'R').toUpperCase();
  const initials = `${firstName.charAt(0).toUpperCase()}${lastInitial}`;

  const title =
    template?.content?.title?.replace('{firstName}', firstName) ||
    `Hi ${firstName}, time to get ready for your interview`;

  const consentText =
    template?.content?.consentText ||
    'I consent to participate in this interview and understand it may be recorded for evaluation.';

  const leftVideoImage = DEFAULT_LEFT_IMAGE;
  const rightVideoImage = DEFAULT_RIGHT_IMAGE;

  const demoConversation = useMemo(() => buildDemoConversation(firstName), [firstName]);
  const currentUtterance = demoConversation[utteranceIndex];
  const currentWords = currentUtterance?.text.split(/\s+/).filter(Boolean) ?? [];
  const spokenWords = currentWords.slice(0, wordIndex);
  const liveTranscriptText = spokenWords.join(' ');
  const overlayChunkStart =
    wordIndex === 0 ? 0 : Math.floor((wordIndex - 1) / OVERLAY_CHUNK_SIZE) * OVERLAY_CHUNK_SIZE;
  const overlaySnippet = overlayBlank
    ? ''
    : spokenWords.slice(overlayChunkStart, wordIndex).join(' ');
  const activeSpeaker =
    demoFinished || !currentUtterance || wordIndex === 0 ? null : currentUtterance.speaker;
  const showTranscriptOverlay = isMobileView
    ? transcriptOverlayEnabled
    : !transcriptPanelOpen;

  useEffect(() => {
    callDurationRef.current = callDuration;
  }, [callDuration]);

  useEffect(() => {
    if (phase !== 'call') return;
    setUtteranceIndex(0);
    setWordIndex(0);
    setCompletedUtterances([]);
    setDemoFinished(false);
    setOverlayBlank(false);
    setTranscriptOverlayEnabled(true);
    setTranscriptPanelOpen(false);
    setCallSettingsOpen(false);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'call' || demoFinished || !currentUtterance) return;

    if (wordIndex >= currentWords.length) {
      setOverlayBlank(false);
      const pauseTimer = window.setTimeout(() => {
        setCompletedUtterances(prev => [
          ...prev,
          {
            id: `${utteranceIndex}-${Date.now()}`,
            speaker: currentUtterance.speaker,
            text: currentUtterance.text,
            elapsedSeconds: callDurationRef.current
          }
        ]);

        if (utteranceIndex >= demoConversation.length - 1) {
          setDemoFinished(true);
          return;
        }

        setUtteranceIndex(prev => prev + 1);
        setWordIndex(0);
      }, DEMO_UTTERANCE_PAUSE_MS);

      return () => window.clearTimeout(pauseTimer);
    }

    const isChunkComplete =
      wordIndex > 0 && wordIndex % OVERLAY_CHUNK_SIZE === 0 && wordIndex < currentWords.length;

    if (isChunkComplete) {
      let blankTimer: number | undefined;
      const chunkPauseTimer = window.setTimeout(() => {
        setOverlayBlank(true);
        blankTimer = window.setTimeout(() => {
          setOverlayBlank(false);
          setWordIndex(prev => prev + 1);
        }, OVERLAY_CHUNK_BLANK_MS);
      }, OVERLAY_CHUNK_BLANK_MS);

      return () => {
        window.clearTimeout(chunkPauseTimer);
        if (blankTimer !== undefined) window.clearTimeout(blankTimer);
      };
    }

    const wordTimer = window.setTimeout(() => {
      setWordIndex(prev => prev + 1);
    }, DEMO_WORD_INTERVAL_MS);

    return () => window.clearTimeout(wordTimer);
  }, [
    phase,
    demoFinished,
    currentUtterance,
    currentWords.length,
    wordIndex,
    utteranceIndex,
    demoConversation.length
  ]);

  useEffect(() => {
    if (!transcriptPanelOpen) return;
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptPanelOpen, completedUtterances, liveTranscriptText, utteranceIndex]);

  useEffect(() => {
    setLocalData(data);
    if (data.callStarted) setPhase('call');
  }, [data]);

  const handleChange = useCallback(
    (updates: Partial<AIAgentInterviewerData>) => {
      const next = { ...localData, ...updates };
      setLocalData(next);
      onUpdate(next);
    },
    [localData, onUpdate]
  );

  const validateForm = useCallback((): boolean => {
    if (phase === 'setup') return consentChecked;
    return true;
  }, [phase, consentChecked]);

  useEffect(() => {
    onValidate(validateForm);
  }, [onValidate, validateForm]);

  useEffect(() => {
    if (phase !== 'call') return;
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartCall = useCallback(() => {
    if (!consentChecked) return;
    setPhase('call');
    handleChange({ callStarted: true, consentGiven: true, setupCompleted: true });
  }, [consentChecked, handleChange]);

  const handleEndCall = useCallback(() => {
    handleChange({ completed: true, callDuration });
    onNext();
  }, [handleChange, callDuration, onNext]);

  const renderEndCallButton = (extraClassName = '', showLabel = false) => (
    <button
      type="button"
      onClick={handleEndCall}
      className={`flex shrink-0 items-center justify-center gap-2 bg-red-500 text-white transition-colors hover:bg-red-600 ${
        showLabel
          ? 'rounded-[10px] px-6 py-2.5 text-sm font-medium'
          : 'h-10 w-10 rounded-xl'
      } ${extraClassName}`}
      aria-label="End call"
    >
      <EndCallIcon className={showLabel ? 'h-4 w-4' : 'h-5 w-5'} />
      {showLabel && 'End Call'}
    </button>
  );

  const renderMediaToggleButton = (
    kind: 'mic' | 'camera',
    isOff: boolean,
    onToggle: () => void
  ) => {
    const Icon = kind === 'mic' ? (isOff ? MicOff : Mic) : isOff ? VideoOff : Video;
    const label =
      kind === 'mic'
        ? isOff
          ? 'Turn microphone on'
          : 'Turn microphone off'
        : isOff
          ? 'Turn camera on'
          : 'Turn camera off';

    return (
      <button
        type="button"
        onClick={onToggle}
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
          isOff
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'bg-gray-100 text-[#353B46] hover:bg-gray-200'
        }`}
        aria-label={label}
        aria-pressed={isOff}
      >
        <Icon className="w-5 h-5" />
      </button>
    );
  };

  const renderDeviceField = (field: (typeof DEVICE_FIELDS)[number]) => (
    <div key={field.id} className="min-w-0">
      <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[#637085]">
        <span>{field.label}</span>
        {isMobileView && (
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium leading-none"
            style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor }}
          >
            Active
          </span>
        )}
      </label>
      <div className="relative h-8 min-w-0 rounded-lg border border-gray-400 bg-white">
        {!isMobileView && (
          <span className="pointer-events-none absolute left-2.5 top-1/2 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-[#36B37E]">
            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
          </span>
        )}
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#637085]" />
        <span
          aria-hidden
          className={`pointer-events-none absolute top-1/2 z-[1] -translate-y-1/2 truncate text-sm text-[#353B46] ${
            isMobileView ? 'left-3 right-8' : 'left-9 right-8'
          }`}
        >
          {deviceSelections[field.id]}
        </span>
        <select
          value={deviceSelections[field.id]}
          onChange={e =>
            setDeviceSelections(prev => ({ ...prev, [field.id]: e.target.value }))
          }
          className={`absolute inset-0 z-[2] h-full w-full min-w-0 cursor-pointer appearance-none rounded-lg bg-transparent pr-8 text-sm text-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isMobileView ? 'pl-3' : 'pl-9'
          }`}
          title={deviceSelections[field.id]}
        >
          {field.options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderFocusField = () => (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-medium text-[#637085]">
        Focus in main video is on
      </label>
      <div className="relative h-8 min-w-0 rounded-lg border border-gray-400 bg-white">
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#637085]" />
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 right-8 top-1/2 z-[1] -translate-y-1/2 truncate text-sm text-[#353B46]"
        >
          {videoFocus === 'agent' ? 'Agent' : 'You'}
        </span>
        <select
          value={videoFocus}
          onChange={e => setVideoFocus(e.target.value as 'agent' | 'candidate')}
          className="absolute inset-0 z-[2] h-full w-full min-w-0 cursor-pointer appearance-none rounded-lg bg-transparent pl-3 pr-8 text-sm text-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="agent">Agent</option>
          <option value="candidate">You</option>
        </select>
      </div>
    </div>
  );

  const renderMobileCallSettings = () => (
    <div className="flex min-h-0 flex-1 flex-col px-1">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <h2 className="mb-4 text-base font-semibold text-[#353B46]">Call Settings</h2>
        <div className="space-y-4">
          {DEVICE_FIELDS.map(renderDeviceField)}
          {renderFocusField()}
        </div>
      </div>
      <div className="shrink-0 pb-6 pt-4">
        <button
          type="button"
          onClick={() => {
            setTranscriptOverlayEnabled(true);
            setCallSettingsOpen(false);
          }}
          className="w-full rounded-lg border border-gray-600 py-2 text-sm font-medium text-[#353B46] transition-colors hover:bg-gray-50"
        >
          Show Live Transcript
        </button>
        <button
          type="button"
          onClick={() => setCallSettingsOpen(false)}
          className="mt-4 w-full py-2 text-center text-sm font-semibold text-[#353B46]"
        >
          Close Settings
        </button>
      </div>
    </div>
  );

  const renderMobileCallVideos = () => (
    <div
      className={`relative min-h-0 w-full flex-1 overflow-hidden rounded-2xl transition-shadow duration-200 ${
        activeSpeaker === 'agent' ? activeSpeakerCardClass : ''
      }`}
    >
      <img src={leftVideoImage} alt="Interviewer" className="h-full w-full object-cover" />
      {activeSpeaker === 'agent' && <SpeakingIndicator />}
      <div
        className={`absolute bottom-3 right-3 z-20 w-[34%] max-w-[132px] transition-shadow duration-200 ${
          activeSpeaker === 'candidate' ? 'shadow-[0_8px_24px_rgba(0,0,0,0.18)]' : ''
        }`}
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-xl ring-2 ring-white shadow-lg">
          {cameraOff ? (
            <div className="flex h-full w-full items-center justify-center bg-[#E5E7EB]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                <span className="text-sm font-semibold text-[#353B46]">{initials}</span>
              </div>
            </div>
          ) : (
            <img src={rightVideoImage} alt="Candidate" className="h-full w-full object-cover" />
          )}
          {activeSpeaker === 'candidate' && (
            <div className="absolute bottom-1.5 left-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
              <AudioLines className="h-3 w-3 text-[#637085]" />
            </div>
          )}
          {micMuted && (
            <div className="absolute right-1.5 top-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-[4px] bg-[#353B46]/80 text-white">
              <MicOff className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
      {showTranscriptOverlay && overlaySnippet && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center justify-center">
          <div className="flex h-6 items-center justify-center bg-[#353B46]/90 px-2">
            <p className="whitespace-nowrap text-xs leading-none text-white">{overlaySnippet}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderSetup = () => (
    <div
      className={`flex h-full flex-col items-center overflow-hidden ${
        isMobileView ? 'bg-white px-4 pb-0 pt-4' : 'px-4 pb-32 pt-6 md:px-8'
      }`}
      style={
        isMobileView
          ? undefined
          : { height: 'calc(100vh - 80px)', backgroundColor: '#F3F4F6' }
      }
    >
      <h1
        className={`max-w-2xl shrink-0 text-center font-semibold text-[#353B46] ${
          isMobileView ? 'mb-3 text-base leading-snug' : 'mb-4 text-xl md:text-2xl'
        }`}
      >
        {title}
      </h1>

      <div
        className={`relative mb-4 min-h-0 w-full flex-1 overflow-hidden rounded-2xl ${
          isMobileView ? 'max-w-none bg-[#E5E7EB]' : 'max-w-3xl'
        }`}
      >
        {cameraOff ? (
          <div className="flex h-full w-full items-center justify-center bg-[#E5E7EB]">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm md:h-28 md:w-28">
              <span className="text-2xl font-semibold text-[#353B46] md:text-3xl">{initials}</span>
            </div>
          </div>
        ) : (
          <img
            src={rightVideoImage}
            alt="Camera preview"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div
        className={`mb-4 grid w-full shrink-0 grid-cols-1 gap-3 ${
          isMobileView ? 'max-w-none' : 'max-w-3xl md:grid-cols-3 md:gap-4'
        }`}
      >
        {DEVICE_FIELDS.map(renderDeviceField)}
      </div>

      <div className={`mb-4 flex w-full shrink-0 items-start ${isMobileView ? '' : 'max-w-3xl'}`}>
        <input
          type="checkbox"
          id="ai-interview-consent"
          checked={consentChecked}
          onChange={e => setConsentChecked(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 focus:ring-2"
          style={{ accentColor: primaryColor }}
          onFocus={e => {
            e.currentTarget.style.boxShadow = `0 0 0 2px ${primaryColor}33`;
          }}
          onBlur={e => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <label
          htmlFor="ai-interview-consent"
          className="ml-3 cursor-pointer text-sm leading-snug text-[#464F5E]"
        >
          {consentText}
        </label>
      </div>

      {!isMobileView && (
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
          <span className="rounded-[6px] bg-[#E8EAEE] px-[6px] py-1 text-xs text-gray-800">
            Your Microphone is {micMuted ? 'Off' : 'On'}
          </span>
          <span className="rounded-[6px] bg-[#E8EAEE] px-[6px] py-1 text-xs text-gray-800">
            Your Camera is {cameraOff ? 'Off' : 'On'}
          </span>
        </div>
      )}
    </div>
  );

  const renderTranscriptBubble = (
    speaker: DemoSpeaker,
    text: string,
    timeLabel: string,
    isLive = false,
    messageId?: string
  ) => (
    <div
      key={messageId ?? `${speaker}-${timeLabel}-${text.slice(0, 12)}`}
      className={`flex flex-col ${speaker === 'candidate' ? 'items-end' : 'items-start'}`}
    >
      <span className="mb-1 text-xs font-medium text-[#637085]">
        {speaker === 'agent' ? 'Agent' : 'You'}
        {isLive ? ' · speaking' : ''}
      </span>
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-snug ${
          speaker === 'candidate'
            ? 'bg-[#353B46] text-white'
            : 'bg-[#E8EAEE] text-[#353B46]'
        }`}
      >
        {text}
        {isLive && <span className="ml-0.5 inline-block animate-pulse">|</span>}
      </div>
      <span className="mt-1 text-xs text-[#8C95A8]">{timeLabel}</span>
    </div>
  );

  const renderCall = () => (
    <div
      className={`flex h-full w-full overflow-hidden ${
        isMobileView ? 'relative flex-col bg-white' : ''
      }`}
      style={
        isMobileView
          ? undefined
          : { height: 'calc(100vh - 80px)', backgroundColor: '#F3F4F6' }
      }
    >
      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${
          isMobileView ? 'px-3 py-3' : 'justify-between px-4 pt-6 md:px-8'
        }`}
        style={
          isMobileView
            ? undefined
            : { paddingBottom: CALL_TAGS_ABOVE_FOOTER + CALL_FOOTER_HEIGHT }
        }
      >
        <div
          className={`mx-auto w-full min-h-0 ${
            isMobileView ? 'relative flex flex-1 flex-col gap-3' : 'relative max-w-5xl shrink-0'
          }`}
        >
          {isMobileView && callSettingsOpen ? (
            renderMobileCallSettings()
          ) : isMobileView ? (
            renderMobileCallVideos()
          ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div
              className={`relative aspect-square w-full overflow-hidden rounded-2xl transition-shadow duration-200 ${
                activeSpeaker === 'agent' ? activeSpeakerCardClass : ''
              }`}
            >
              <img
                src={leftVideoImage}
                alt="Interviewer"
                className="h-full w-full object-cover"
              />
              {activeSpeaker === 'agent' && <SpeakingIndicator />}
            </div>
            <div
              className={`relative aspect-square w-full overflow-hidden rounded-2xl transition-shadow duration-200 ${
                activeSpeaker === 'candidate' ? activeSpeakerCardClass : ''
              }`}
            >
              {cameraOff ? (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{ backgroundColor: '#E5E7EB' }}
                >
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm md:h-28 md:w-28">
                    <span className="text-2xl font-semibold text-[#353B46] md:text-3xl">{initials}</span>
                  </div>
                </div>
              ) : (
                <img
                  src={rightVideoImage}
                  alt="Candidate"
                  className="h-full w-full object-cover"
                />
              )}
              {activeSpeaker === 'candidate' && <SpeakingIndicator />}
              {micMuted && (
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-[6px] bg-[#353B46]/80 px-2 py-1 text-xs text-white">
                  <MicOff className="h-3.5 w-3.5" />
                  <span>Mic off</span>
                </div>
              )}
            </div>
          </div>
          )}
          {!isMobileView && showTranscriptOverlay && overlaySnippet && (
            <div
              className="absolute left-1/2 z-10 flex h-6 -translate-x-1/2 items-center justify-center bg-[#353B46]/90 px-1"
              style={{ bottom: 60 }}
            >
              <p className="whitespace-nowrap text-xs leading-none text-white">{overlaySnippet}</p>
            </div>
          )}
        </div>

        {!isMobileView && (
          <div className="mx-auto flex w-full max-w-5xl shrink-0 flex-wrap items-center justify-center gap-3">
            <span className="rounded-[6px] bg-[#E8EAEE] px-[6px] py-1 text-xs text-gray-800">
              Your Microphone is {micMuted ? 'Off' : 'On'}
            </span>
            <span className="rounded-[6px] bg-[#E8EAEE] px-[6px] py-1 text-xs text-gray-800">
              Your Camera is {cameraOff ? 'Off' : 'On'}
            </span>
            <span className="rounded-[6px] bg-[#E8EAEE] px-[6px] py-1 text-xs text-gray-800">
              {transcriptPanelOpen ? 'Transcript in the panel' : 'Transcript Overlay'}
            </span>
          </div>
        )}
      </div>

      {transcriptPanelOpen && !isMobileView && (
        <aside
          className="flex w-80 max-w-sm shrink-0 flex-col border-l border-gray-200 bg-white"
          style={{ height: 'calc(100vh - 80px)' }}
        >
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-[#353B46]">Live Transcript</h2>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {completedUtterances.map(message =>
              renderTranscriptBubble(
                message.speaker,
                message.text,
                formatTranscriptTime(Math.max(0, callDuration - message.elapsedSeconds)),
                false,
                message.id
              )
            )}
            {!demoFinished && liveTranscriptText && currentUtterance &&
              renderTranscriptBubble(
                currentUtterance.speaker,
                liveTranscriptText,
                'Just now',
                true,
                'live-utterance'
              )}
            <div ref={transcriptEndRef} />
          </div>
        </aside>
      )}

    </div>
  );

  const footerShellClass = isMobileView
    ? 'w-full border-t border-gray-200 bg-white py-1'
    : 'fixed bottom-0 left-0 right-0 z-50 w-full border-t border-gray-200 bg-white px-4 py-4 md:px-6';

  const footer = useMemo(() => {
    if (phase === 'setup') {
      if (isMobileView) {
        return (
          <div className={footerShellClass}>
            <div className="px-4 py-4">
              <p className="mb-3 text-sm text-[#637085]">Interview Setup</p>
              <div className="flex items-center gap-3">
                <div className="flex shrink-0 items-center gap-2">
                  {renderMediaToggleButton('mic', micMuted, () => setMicMuted(v => !v))}
                  {renderMediaToggleButton('camera', cameraOff, () => setCameraOff(v => !v))}
                </div>
                <button
                  type="button"
                  onClick={handleStartCall}
                  disabled={!consentChecked}
                  className="min-w-0 flex-1 rounded-lg py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ backgroundColor: primaryColor }}
                >
                  Start Call
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className={footerShellClass}>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="justify-self-start text-sm text-[#637085]">Interview Setup</span>
            <div className="flex items-center justify-center gap-2 justify-self-center">
              {renderMediaToggleButton('mic', micMuted, () => setMicMuted(v => !v))}
              {renderMediaToggleButton('camera', cameraOff, () => setCameraOff(v => !v))}
            </div>
            <button
              type="button"
              onClick={handleStartCall}
              disabled={!consentChecked}
              className="justify-self-end shrink-0 rounded-[10px] px-6 py-2.5 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: primaryColor }}
            >
              Start Call
            </button>
          </div>
        </div>
      );
    }

    if (isMobileView) {
      return (
        <div className={footerShellClass}>
          <div className="flex flex-col gap-2.5 px-4 pb-3 pt-2.5">
            <div className="text-left text-sm text-[#637085]">
              Call Duration: {formatDuration(callDuration)} |{' '}
              <span className="font-medium text-gray-700">Recording in progress</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
              {renderMediaToggleButton('mic', micMuted, () => setMicMuted(v => !v))}
              {renderMediaToggleButton('camera', cameraOff, () => setCameraOff(v => !v))}
              <button
                type="button"
                onClick={() => setTranscriptOverlayEnabled(enabled => !enabled)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  transcriptOverlayEnabled
                    ? 'text-white'
                    : 'bg-gray-100 text-[#353B46] hover:bg-gray-200'
                }`}
                style={transcriptOverlayEnabled ? { backgroundColor: primaryColor } : undefined}
                aria-label={transcriptOverlayEnabled ? 'Turn transcript overlay off' : 'Turn transcript overlay on'}
                aria-pressed={transcriptOverlayEnabled}
              >
                <MessageSquare className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setCallSettingsOpen(open => !open)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  callSettingsOpen
                    ? 'text-white'
                    : 'bg-gray-100 text-[#353B46] hover:bg-gray-200'
                }`}
                style={callSettingsOpen ? { backgroundColor: primaryColor } : undefined}
                aria-label={callSettingsOpen ? 'Close call settings' : 'Open call settings'}
                aria-pressed={callSettingsOpen}
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
            {renderEndCallButton()}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={footerShellClass}>
        <div className="grid grid-cols-3 items-center gap-2 md:gap-4">
        <span className="justify-self-start truncate text-sm text-[#637085]">
  Call Duration: {formatDuration(callDuration)} |{" "}
  <span className="text-gray-700 font-medium">Recording in progress</span>
</span>
          <div className="flex items-center justify-center gap-2 justify-self-center">
            {renderMediaToggleButton('mic', micMuted, () => setMicMuted(v => !v))}
            {renderMediaToggleButton('camera', cameraOff, () => setCameraOff(v => !v))}
            <button
              type="button"
              onClick={() => setTranscriptPanelOpen(open => !open)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                transcriptPanelOpen
                  ? 'text-white'
                  : 'bg-gray-100 text-[#353B46] hover:bg-gray-200'
              }`}
              style={transcriptPanelOpen ? { backgroundColor: primaryColor } : undefined}
              aria-label={transcriptPanelOpen ? 'Close live transcript' : 'Open live transcript'}
              aria-pressed={transcriptPanelOpen}
            >
              <MessageSquare className="h-5 w-5" />
            </button>
          </div>
          {renderEndCallButton('justify-self-end', true)}
        </div>
      </div>
    );
  }, [
    phase,
    isMobileView,
    consentChecked,
    callDuration,
    primaryColor,
    micMuted,
    cameraOff,
    transcriptPanelOpen,
    transcriptOverlayEnabled,
    callSettingsOpen,
    handleStartCall,
    handleEndCall
  ]);

  useEffect(() => {
    if (isMobileView && onFooterRender) {
      onFooterRender(footer);
    }
  }, [isMobileView, onFooterRender, footer]);

  return (
    <div className={`m-0 w-full overflow-hidden ${isMobileView ? 'flex h-full flex-col bg-white' : 'bg-[#F3F4F6]'}`}>
      <div className={isMobileView ? 'min-h-0 flex-1 overflow-hidden' : undefined}>
        {phase === 'setup' ? renderSetup() : renderCall()}
      </div>
      {!isMobileView || !onFooterRender ? footer : null}
    </div>
  );
});

export default AIAgentInterviewerStep;
