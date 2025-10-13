# Many-to-Many Folders Implementation Guide

## Overview
Flows can now belong to multiple folders simultaneously. This was implemented using a junction table to create a many-to-many relationship between `application_flows` and `folders`.

## Database Changes

### New Junction Table: `flow_folders`
Created a new table to manage the many-to-many relationship:
- `id` (uuid, primary key)
- `flow_id` (uuid, foreign key to application_flows)
- `folder_id` (uuid, foreign key to folders)
- `created_at` (timestamp)
- Unique constraint on (flow_id, folder_id)

### Migration
Run the migration file: `supabase/migrations/20250104000000_add_flow_folders_junction.sql`

This migration:
1. Creates the `flow_folders` junction table
2. Adds indexes for performance
3. Sets up RLS policies
4. Migrates existing `folder_id` data to the junction table
5. Keeps the `folder_id` column in `application_flows` for backward compatibility

## Code Changes

### 1. Type Updates (`src/types/flow.ts`)
- Added `folderIds?: string[]` to `ApplicationFlow` interface
- Kept `folderId?: string` for backward compatibility

### 2. Database Types (`src/lib/supabase.ts`)
- Added `DatabaseFlowFolder` interface for the junction table

### 3. Hooks Updates

#### `useFlows` Hook (`src/hooks/useFlows.ts`)
- Modified `convertToApplicationFlow` to fetch folder associations from junction table
- Updated `createFlow` to handle `folderIds` array
- Updated `updateFlow` to sync folder associations
- Updated `duplicateFlow` to copy folder associations
- Added `updateFlowFolders` function to manage junction table entries
- Exported `updateFlowFolders` for use in components

#### `useFolders` Hook (`src/hooks/useFolders.ts`)
- Updated `fetchFolders` to count flows from junction table instead of using `folder_id`

### 4. Component Updates

#### `FolderModal` (`src/components/FolderModal.tsx`)
- Updated to use `folderIds` array when selecting flows
- Shows badge indicating if a flow is already in other folders
- Made buttons sticky at bottom with scrollable content area

#### `FlowCard` (`src/components/FlowCard.tsx`)
- Added `folders` prop to display folder badges
- Shows all folders a flow belongs to with amber-colored badges
- Each badge includes a folder icon

#### `FlowHomepage` (`src/components/FlowHomepage.tsx`)
- Updated `updateFlowsFolderAssociations` to add/remove flows from folders
- Flows can now be added to folders without removing them from existing ones
- Passes `folders` prop to FlowCard components

#### `FolderView` (`src/components/FolderView.tsx`)
- Updated to filter flows using `folderIds` array
- Updated `updateFlowsFolderAssociations` to manage many-to-many relationships
- Passes `folders` prop to FlowCard components

## User Experience Changes

### For Users:
1. **Multiple Folder Assignment**: Flows can now be added to multiple folders
2. **Visual Indicators**: 
   - Flow cards show badges for all folders they belong to
   - In the folder modal, flows show if they're already in other folders
3. **Non-Destructive Operations**: Adding a flow to a folder doesn't remove it from other folders

### Folder Modal Improvements:
- Sticky buttons at the bottom
- Scrollable content area
- Badge showing "In X other folder(s)" for flows already in multiple folders

## Migration Steps

1. **Backup your database** before running the migration
2. Run the migration: `supabase/migrations/20250104000000_add_flow_folders_junction.sql`
3. The migration automatically transfers existing `folder_id` data to the junction table
4. Test the application to ensure all flows appear in their correct folders
5. (Optional) After confirming everything works, you can remove the deprecated `folder_id` column

## Backward Compatibility

The implementation maintains backward compatibility:
- The `folder_id` column is kept in `application_flows` table
- The `folderId` property is kept in the TypeScript interface
- Old code that uses `folderId` will continue to work

## Future Enhancements

Potential improvements:
1. Add ability to filter flows by folder on the homepage
2. Add bulk operations (add multiple flows to folder at once)
3. Add folder hierarchy (nested folders)
4. Add folder colors or icons for better visual distinction
5. Remove the deprecated `folder_id` column after ensuring stability

