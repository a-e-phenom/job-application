# Flow-Level Module Template Editing

This feature allows users to customize module templates at the application flow level without affecting global module templates.

## Overview

Each step in an application flow can now have its own template configuration that overrides the global template settings. This provides flexibility to customize content, questions, and styling for specific flows while maintaining the global templates as a base.

## How It Works

### 1. Template Override System

- **Global Templates**: Base templates stored in the `module_templates` table
- **Flow-Specific Overrides**: Customizations stored in the `templateOverrides` field of each `FlowModule`
- **Effective Template**: The final template used by combining global template with flow-specific overrides

### 2. Configuration Access

- **Settings Icon**: A Settings2 icon (⚙️) appears next to the X button in each step header
- **Right Panel**: Clicking the settings icon opens a configuration panel on the right side
- **Pre-filled Values**: Title and subtitle are pre-filled with existing values (flow-specific or global)
- **Pre-filled Questions**: Questions are pre-filled with existing configuration

### 3. Override Fields

The following fields can be overridden per flow:

- **Title**: Custom title for the module (pre-filled with existing value)
- **Subtitle**: Custom subtitle/description (pre-filled with existing value)
- **Questions**: Custom question sets with full configuration (pre-filled with existing questions)

## Technical Implementation

### Database Schema

```sql
-- FlowModule now includes templateOverrides
interface FlowModule {
  id: string;
  name: string;
  description: string;
  component: string;
  isRequired?: boolean;
  templateOverrides?: {
    title?: string;
    subtitle?: string;
    questions?: Question[];
  };
}
```

### Component Structure

1. **ApplicationFlow.tsx**: Main component that renders steps and manages configuration
2. **ModuleConfigPanel.tsx**: Right-side panel for editing module configuration
3. **Template Merging**: Logic to combine global templates with flow-specific overrides

### Template Merging Logic

```typescript
const effectiveTemplate = moduleTemplate ? {
  ...moduleTemplate,
  content: {
    ...moduleTemplate.content,
    ...primaryModule.templateOverrides
  }
} : undefined;
```

## Usage

### For End Users

1. Navigate to any step in an application flow
2. Click the Settings2 icon (⚙️) next to the X button in the header
3. Configure the module in the right-side panel:
   - **Title**: Edit the module title (pre-filled with current value)
   - **Subtitle**: Edit the module subtitle (pre-filled with current value)
   - **Questions**: Add/remove/modify questions (pre-filled with current configuration)
4. Click "Save Changes" to apply modifications
5. **Changes are displayed immediately** while staying in the application flow

### Question Configuration

#### **Text & Textarea Questions**
- Basic text input configuration
- Half-size input option available

#### **Dropdown (Select) Questions**
- **Options Management**: Add options one by one with individual input fields
- **Individual Removal**: Remove specific options with X buttons
- **Dynamic Addition**: Click "+ Add Option" to add new choices
- Half-size input option available

#### **Radio Button Questions**
- **Options Management**: Same pattern as dropdowns - add/remove individually
- **Layout Selection**: Choose between Vertical and Horizontal layouts
- **Tab Interface**: Clean tab-style layout selector

#### **Checkbox Questions**
- **Options Management**: Same pattern as dropdowns - add/remove individually
- **Multiple Selection**: Configure multiple checkbox options

#### **File Upload Questions**
- Basic file upload configuration

#### **Phone Number Questions**
- Basic phone input configuration

### For Developers

1. **Adding New Override Fields**: Extend the `LocalOverrides` interface in `ModuleConfigPanel.tsx`
2. **Custom Question Types**: Add new question types to the configuration panel
3. **Validation**: Implement validation logic in the configuration panel
4. **Persistence**: Use the existing `updateFlow` function to save changes

## Key Features

### Pre-filled Values
- **Title**: Automatically populated with existing flow-specific title or global template title
- **Subtitle**: Automatically populated with existing flow-specific subtitle or global template subtitle
- **Questions**: Automatically populated with existing flow-specific questions or global template questions

### Options Management System
- **Individual Input Fields**: Each option has its own text input field
- **Dynamic Addition**: Add new options with the "+ Add Option" button
- **Individual Removal**: Remove specific options with X buttons
- **Consistent Pattern**: Same interface for select, radio, and checkbox questions

### Real-time Configuration
- **Immediate Feedback**: See changes as you type
- **Change Detection**: Save button is only enabled when there are actual changes
- **Reset Functionality**: Reset to global template values with one click

### Page Reload on Save
- **Immediate State Update**: Changes are applied to the flow state immediately
- **No Page Reload**: User stays in the application flow without interruption
- **Instant Display**: Changes are visible immediately after saving
- **Error Handling**: Panel stays open if save fails

## Benefits

1. **Flow Customization**: Each flow can have unique content and questions
2. **Template Reusability**: Global templates serve as a foundation
3. **Non-Destructive**: Changes don't affect other flows or global templates
4. **User-Friendly**: Pre-filled values reduce setup time
5. **Immediate Feedback**: Page reload ensures changes are visible
6. **Flexible Configuration**: Support for various question types and layouts
7. **Consistent UX**: Same interface patterns as ModuleTemplatesPage

## Example Use Cases

1. **Company-Specific Content**: Customize questions for different company locations
2. **Role-Specific Flows**: Different questions for different job positions
3. **Seasonal Campaigns**: Temporary content changes for specific time periods
4. **A/B Testing**: Test different question formulations across flows
5. **Localization**: Customize content for different regions or languages

## Future Enhancements

1. **Template Inheritance**: Chain multiple levels of template overrides
2. **Conditional Logic**: Show/hide questions based on previous answers
3. **Advanced Validation**: Custom validation rules per flow
4. **Template Versioning**: Track changes and allow rollbacks
5. **Bulk Operations**: Apply changes across multiple flows
