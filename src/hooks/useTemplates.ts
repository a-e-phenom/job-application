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
    centerTitle?: boolean;
    questions?: Array<{
      id: string;
      text: string;
      type: 'text' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file' | 'image' | 'phone' | 'interview-scheduler' | 'message' | 'assessment' | 'video-interview';
      options?: string[];
      required?: boolean;
      halfWidth?: boolean;
      layout?: 'vertical' | 'horizontal';
      content?: string;
      typeSelectorOpen?: boolean;
    }>;
    customButtons?: Array<{
      id: string;
      label: string;
      isPrimary: boolean;
    }>;
    customFields?: Record<string, any>;
  };
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Type for creating/updating templates without component (auto-generated)
export type CreateTemplateData = Omit<ModuleTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isDefault'> & {
  component: string; // Required since we're not auto-generating
};

export function useTemplates() {
  const [templates, setTemplates] = useState<ModuleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      
      // Default templates are already in the database from migrations
      // No need to check or insert them here
      
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
      // Component name is required since we're not auto-generating
      if (!templateData.component) {
        throw new Error('Component name is required');
      }
      
      const dbTemplate = convertToDatabaseTemplate(templateData);
      const { data, error } = await supabase
        .from('module_templates')
        .insert([{ ...dbTemplate, is_default: false }])
        .select()
        .single();

      if (error) {
        // Handle specific constraint violations
        if (error.code === '23505') {
          throw new Error(`A template with component name "${templateData.component}" already exists. Please choose a different component name.`);
        }
        throw error;
      }

      const newTemplate = convertToModuleTemplate(data);
      setTemplates(prev => [newTemplate, ...prev]);
      return newTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update existing template
  const updateTemplate = async (id: string, templateData: CreateTemplateData) => {
    try {
      // Component name is required since we're not auto-generating
      if (!templateData.component) {
        throw new Error('Component name is required');
      }
      
      const dbTemplate = convertToDatabaseTemplate(templateData);
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