# Unique URLs for Application Flows

This update adds unique, shareable URLs for each application flow in the system.

## Features

### 1. **Unique URLs for Each Flow**
- Each application flow now has a unique URL based on its name
- URLs are automatically generated and are URL-friendly (e.g., "Software Engineer Application" becomes `/flow/software-engineer-application`)
- URLs are persistent and can be shared directly

### 2. **Direct Access to Flows**
- Users can access any flow directly by navigating to its URL
- No need to go through the homepage to find a specific flow
- Perfect for sharing flows with candidates or team members

### 3. **Copy URL Feature**
- Each flow card now has a "Copy URL" option in the dropdown menu
- Click to copy the direct link to the clipboard
- Visual feedback shows when the URL has been copied

### 4. **URL Preview During Creation**
- When creating or editing a flow, users can see what the final URL will be
- URL preview updates in real-time as the flow name is typed
- Helps users choose descriptive names for better URLs

## How to Use

### **Accessing a Flow Directly**
1. Navigate to `/flow/[flow-slug]` in your browser
2. Replace `[flow-slug]` with the actual slug of the flow
3. The flow will load directly without going through the homepage

### **Sharing a Flow**
1. Go to the flow homepage
2. Find the flow you want to share
3. Click the three-dot menu (⋮) on the flow card
4. Select "Copy URL"
5. Share the copied URL with others

### **Creating SEO-Friendly Flow Names**
- Use descriptive names that will create good URLs
- Avoid special characters (they'll be automatically removed)
- Consider using hyphens between words for better readability

## Technical Details

### **URL Structure**
- Base URL: `/flow/[slug]`
- Edit URL: `/edit/[slug]`
- Create URL: `/create`
- Homepage: `/`
- Modules: `/modules`

### **Slug Generation**
- Slugs are automatically generated from flow names
- Special characters are removed
- Spaces are converted to hyphens
- Multiple hyphens are collapsed to single hyphens
- Leading/trailing hyphens are removed
- If a duplicate slug exists, a number is appended

### **Database Changes**
- New `slug` field added to `application_flows` table
- Unique index on slug field for performance
- Existing flows automatically get slugs generated

## Migration

If you have existing flows, run the database migration to add the slug field:

```sql
-- This migration will be automatically applied
-- It adds the slug field and generates slugs for existing flows
```

## Benefits

1. **Better User Experience**: Users can bookmark specific flows
2. **Improved Sharing**: Direct links make it easier to share flows
3. **SEO Friendly**: Clean URLs are better for search engines
4. **Professional Appearance**: Clean URLs look more professional
5. **Easier Navigation**: Users can navigate directly to flows they know

## Future Enhancements

- Custom slug editing for advanced users
- Slug validation to ensure uniqueness
- URL analytics and tracking
- QR code generation for mobile sharing
