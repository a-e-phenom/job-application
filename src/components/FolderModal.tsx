import React, { useState, useEffect } from 'react';
import { X, Folder } from 'lucide-react';
import { Folder as FolderType } from '../types/folder';
import { ApplicationFlow } from '../types/flow';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (folder: Omit<FolderType, 'id' | 'createdAt' | 'updatedAt' | 'flowCount'>, selectedFlowIds: string[]) => Promise<void>;
  folder?: FolderType | null; // For editing existing folder
  flows?: ApplicationFlow[]; // Available flows to select from
}

export default function FolderModal({ isOpen, onClose, onSave, folder, flows = [] }: FolderModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFlowIds, setSelectedFlowIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes or folder changes
  useEffect(() => {
    if (isOpen) {
      if (folder) {
        setName(folder.name);
        setDescription(folder.description || '');
        // For editing, pre-select flows that are already in this folder
        const flowsInFolder = flows.filter(flow => flow.folderId === folder.id).map(flow => flow.id);
        setSelectedFlowIds(flowsInFolder);
      } else {
        setName('');
        setDescription('');
        setSelectedFlowIds([]);
      }
    }
  }, [isOpen, folder, flows]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      console.log('Creating folder with data:', { name: name.trim(), description: description.trim(), selectedFlowIds });
      await onSave({
        name: name.trim(),
        description: description.trim()
      }, selectedFlowIds);
      console.log('Folder created successfully');
      onClose();
    } catch (error) {
      console.error('Failed to save folder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleFlowToggle = (flowId: string) => {
    setSelectedFlowIds(prev => 
      prev.includes(flowId) 
        ? prev.filter(id => id !== flowId)
        : [...prev, flowId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFlowIds.length === flows.length) {
      setSelectedFlowIds([]);
    } else {
      setSelectedFlowIds(flows.map(flow => flow.id));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Folder className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {folder ? 'Edit Folder' : 'Create Folder'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Folder Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter folder description (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Flow Selection */}
            {flows.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Flows
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    disabled={isLoading}
                    className="text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                  >
                    {selectedFlowIds.length === flows.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {flows.length === 0 ? (
                    <p className="text-gray-500 text-sm">No flows available</p>
                  ) : (
                    <div className="space-y-2">
                      {flows.map((flow) => (
                        <label key={flow.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedFlowIds.includes(flow.id)}
                            onChange={() => handleFlowToggle(flow.id)}
                            disabled={isLoading}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{flow.name}</div>
                            {flow.description && (
                              <div className="text-xs text-gray-500">{flow.description}</div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {selectedFlowIds.length} of {flows.length} flows selected
                </p>
              </div>
            )}
          </div>

          {/* Sticky Footer Buttons */}
          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-white">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : folder ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
