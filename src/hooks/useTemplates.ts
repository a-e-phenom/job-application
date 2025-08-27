import { useState, useEffect } from 'react';
import { supabase, DatabaseTemplate } from '../lib/supabase';

export interface ModuleTemplate {
  id: string;
  name: string;
  description: string;
  component: string;
  content: {
    title?: string;
    subtitle?: string;
    instructions?: string;
    questions?: Array<{
      id: string;
      text: string;
      type: 'text' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file' | 'phone' | 'interview-scheduler' | 'message';
      options?: string[];
      required?: boolean;
      halfWidth?: boolean;
      layout?: 'vertical' | 'horizontal';
      content?: string;
    }>;
    customFields?: Record<string, any>;
  };
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Type for creating/updating templates without component (auto-generated)
export type CreateTemplateData = Omit<ModuleTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isDefault' | 'component'> & {
  component?: string; // Optional, will be auto-generated if not provided
};

export function useTemplates() {
  const [templates, setTemplates] = useState<ModuleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate unique component name based on template name
  const generateUniqueComponentName = async (templateName: string): Promise<string> => {
    // Convert template name to component name (remove spaces, special chars, etc.)
    let baseComponentName = templateName
      .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters and spaces
      .replace(/^[0-9]/, '') // Remove leading numbers
      || 'CustomStep'; // Fallback if name is empty or only special chars
    
    // Check if component name already exists
    let componentName = baseComponentName;
    let counter = 1;
    
    while (true) {
      const { data: existingTemplate, error: selectError } = await supabase
        .from('module_templates')
        .select('id')
        .eq('component', componentName);
      
      if (selectError) {
        console.warn('Failed to check existing component name:', componentName, selectError);
        break;
      }
      
      if (!existingTemplate || existingTemplate.length === 0) {
        break; // Component name is unique
      }
      
      // Component name exists, try with counter
      componentName = `${baseComponentName}${counter}`;
      counter++;
    }
    
    return componentName;
  };

  // Default templates to ensure they exist
  const defaultTemplates: Omit<ModuleTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'Thank You Screen',
      description: 'Final completion screen with customizable message',
      component: 'ThankYouStep',
      content: {
        title: 'Thank you! 🎉',
        subtitle: 'We received your submission and will get back to you as soon as possible.\nGood luck!'
      },
      isDefault: true
    }
  ];

  // Convert database template to module template
  const convertToModuleTemplate = (dbTemplate: DatabaseTemplate): ModuleTemplate => ({
    id: dbTemplate.id,
    name: dbTemplate.name,
    description: dbTemplate.description,
    component: dbTemplate.component,
    content: dbTemplate.content,
    isDefault: dbTemplate.is_default,
    createdAt: new Date(dbTemplate.created_at),
    updatedAt: new Date(dbTemplate.updated_at)
  });

  // Convert module template to database format
  const convertToDatabaseTemplate = (template: CreateTemplateData): Omit<DatabaseTemplate, 'id' | 'created_at' | 'updated_at' | 'is_default'> => ({
    name: template.name,
    description: template.description,
    component: template.component || 'CustomStep', // Fallback to CustomStep if not provided
    content: template.content
  });

  // Fetch all templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      
      // First, ensure default templates exist
      for (const defaultTemplate of defaultTemplates) {
        // Check if template already exists
        const { data: existingTemplate, error: selectError } = await supabase
          .from('module_templates')
          .select('id')
          .eq('component', defaultTemplate.component);
        
        if (selectError) {
          console.warn('Failed to check existing template:', defaultTemplate.name, selectError);
          continue;
        }

        // Only insert if template doesn't exist
        if (!existingTemplate || existingTemplate.length === 0) {
          const { error: insertError } = await supabase
            .from('module_templates')
            .insert([{
              name: defaultTemplate.name,
              description: defaultTemplate.description,
              component: defaultTemplate.component,
              content: defaultTemplate.content,
              is_default: defaultTemplate.isDefault
            }]);
          
          if (insertError) {
            console.warn('Failed to insert default template:', defaultTemplate.name, insertError);
          }
        }
      }
      
      const { data, error } = await supabase
        .from('module_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const convertedTemplates = data.map(convertToModuleTemplate);
      setTemplates(convertedTemplates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  // Create new template
  const createTemplate = async (templateData: CreateTemplateData) => {
    try {
      // Generate unique component name if not provided
      let finalTemplateData = { ...templateData };
      if (!templateData.component || templateData.component === 'CustomStep') {
        finalTemplateData.component = await generateUniqueComponentName(templateData.name);
      }
      
      const dbTemplate = convertToDatabaseTemplate(finalTemplateData);
      const { data, error } = await supabase
        .from('module_templates')
        .insert([{ ...dbTemplate, is_default: false }])
        .select()
        .single();

      if (error) throw error;

      const newTemplate = convertToModuleTemplate(data);
      setTemplates(prev => [newTemplate, ...prev]);
      return newTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
      throw err;
    }
  };

  // Update existing template
  const updateTemplate = async (id: string, templateData: CreateTemplateData) => {
    try {
      // Find existing template to check if name changed
      const existingTemplate = templates.find(t => t.id === id);
      
      // Generate new component name if template name changed
      let finalTemplateData = { ...templateData };
      if (existingTemplate && existingTemplate.name !== templateData.name) {
        finalTemplateData.component = await generateUniqueComponentName(templateData.name);
      }
      
      const dbTemplate = convertToDatabaseTemplate(finalTemplateData);
      const { data, error } = await supabase
        .from('module_templates')
        .update(dbTemplate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTemplate = convertToModuleTemplate(data);
      setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
      return updatedTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      throw err;
    }
  };

  // Delete template (only custom templates)
  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('module_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    }
  };

  // Reset template to default (only for default templates)
  const resetTemplate = async (id: string) => {
    try {
      // This would require storing original default values
      // For now, we'll just refetch the template
      await fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset template');
      throw err;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    resetTemplate,
    refetch: fetchTemplates
  };
}