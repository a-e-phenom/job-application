# Voice Screening Agent Module

## Overview
The Voice Screening Agent module enables AI-powered voice screening interviews within your application flow. Candidates can have a conversation with a virtual agent named "Rachel" who will ask them questions about their experience and qualifications.

## Features

### Welcome Screen
- Clear instructions for candidates
- Guidelines for preparing for the voice interview
- Professional layout with supporting imagery

### Voice Interview Screen
- Split-screen interface showing:
  - **Rachel (Virtual Agent)**: Displays an animated audio waveform during the call
  - **Candidate**: Shows their participant card
- Real-time call duration counter
- "Start Call" button to initiate the interview
- Clean, modern UI that matches your application's design

## Files Added/Modified

### New Files
1. **`src/components/VoiceScreeningStep.tsx`**
   - Main component for the voice screening module
   - Handles the welcome screen and voice call interface
   - Includes state management for call duration and progress

2. **`supabase/migrations/20250125000000_add_voice_screening_module.sql`**
   - Database migration to add the voice screening module template
   - Registers the module as a default template

### Modified Files
1. **`src/types/application.ts`**
   - Added `VoiceScreeningData` interface
   - Updated `ApplicationData` to include `voiceScreening` field

2. **`src/components/ApplicationFlow.tsx`**
   - Imported `VoiceScreeningStep` component
   - Added initial state for voice screening
   - Added `updateVoiceScreening` callback
   - Added case handler for 'voice-screening' module
   - Updated `handleStartNew` to reset voice screening data

## How to Use

### Adding to a Flow
1. Go to the Create Flow page
2. Add a new step or select an existing step
3. Click "Add Module"
4. Select "Voice Screening Agent" from the available modules
5. The module will be added to your flow

### Module Configuration
The module uses these default configurations:
- **Title**: "Voice Screening Interview"
- **Subtitle**: "Complete a voice interview with our AI agent"
- **Instructions**: Displayed on the welcome screen

### For Candidates
1. Candidates will see a welcome screen with instructions
2. They click "Start Interview" to proceed
3. The voice interview interface appears showing both participants
4. They click "Start Call" to begin the conversation
5. An animated waveform appears during the call
6. Once complete, they click "Complete" to proceed to the next step

## Data Captured

The module tracks:
- `introCompleted`: Boolean - whether the welcome screen was completed
- `callStarted`: Boolean - whether the call was initiated
- `completed`: Boolean - whether the voice screening is complete
- `callDuration`: Number (optional) - duration of the call in seconds
- `transcript`: String (optional) - transcript of the conversation (for future integration)

## Technical Details

### Component Props
```typescript
interface VoiceScreeningStepProps {
  data: VoiceScreeningData;
  onUpdate: (data: VoiceScreeningData) => void;
  onValidate: (validateFn: () => boolean) => void;
  primaryColor: string;
  onNext: () => void;
  template?: ModuleTemplate;
}
```

### Sub-steps
The module has two sub-steps:
1. **Introduction (index 0)**: Welcome screen with instructions
2. **Voice Interview (index 1)**: The actual call interface

## Future Enhancements
Potential features that could be added:
- Real AI voice agent integration (e.g., with ElevenLabs, OpenAI, or similar)
- Live transcription display
- Recording and playback functionality
- Automatic scoring/evaluation
- Multiple question screens
- Language selection options

## Integration Notes
- The module seamlessly integrates with your existing flow system
- It follows the same patterns as other modules (Assessment, Interview Scheduling, etc.)
- The UI automatically adapts to your flow's primary color
- All data is stored in the application state and can be persisted to your backend

## Support
If you need to customize the module further, the main component is located at:
`src/components/VoiceScreeningStep.tsx`

The module follows React best practices with:
- Memoization for performance
- Proper state management
- TypeScript for type safety
- Responsive design for mobile and desktop

