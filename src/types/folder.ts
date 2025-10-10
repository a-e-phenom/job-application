export interface Folder {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  flowCount?: number; // Computed field for UI display
}

export interface DatabaseFolder {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}
