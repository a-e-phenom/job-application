import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Settings, HelpCircle, MoreVertical, Edit, Trash2, ArrowLeft } from 'lucide-react';
import FlowCard from './FlowCard';
import FolderModal from './FolderModal';
import HowItWorksModal from './HowItWorksModal';
import { ApplicationFlow } from '../types/flow';
import { Folder as FolderType } from '../types/folder';
import { useFlows } from '../hooks/useFlows';
import { useFolders } from '../hooks/useFolders';

export default function FolderView() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { flows, loading, error, deleteFlow, duplicateFlow, updateFlow } = useFlows();
  const { folders, loading: foldersLoading, updateFolder, deleteFolder } = useFolders();
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Find the current folder
  const currentFolder = folders.find(f => f.id === folderId);

  // Filter flows for this folder using the new folderIds array
  const folderFlows = flows.filter(flow => 
    flow.folderIds && flow.folderIds.includes(folderId || '')
  );

  const handleDeleteFlow = async (flowId: string) => {
    try {
      await deleteFlow(flowId);
    } catch (error) {
      console.error('Failed to delete flow:', error);
    }
  };

  const handlePreviewFlow = (flow: ApplicationFlow) => {
    navigate(`/flow/${flow.slug}`);
  };

  const handleCreateFlow = () => {
    navigate('/create');
  };

  const handleEditFlow = (flow: ApplicationFlow) => {
    navigate(`/edit/${flow.slug}`);
  };

  const handleDuplicateFlow = async (flow: ApplicationFlow) => {
    try {
      await duplicateFlow(flow);
    } catch (error) {
      console.error('Failed to duplicate flow:', error);
    }
  };

  const handleViewModuleTemplates = () => {
    navigate('/modules');
  };

  const handleEditFolder = () => {
    setShowFolderModal(true);
    setShowFolderMenu(false);
  };

  const handleDeleteFolder = async () => {
    if (!currentFolder) return;
    try {
      await deleteFolder(currentFolder.id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const handleSaveFolder = async (folderData: Omit<FolderType, 'id' | 'createdAt' | 'updatedAt' | 'flowCount'>, selectedFlowIds: string[]) => {
    if (!currentFolder) return;
    await updateFolder(currentFolder.id, folderData);
    // Update flows to add/remove them from this folder
    await updateFlowsFolderAssociations(currentFolder.id, selectedFlowIds);
  };

  const updateFlowsFolderAssociations = async (folderId: string, selectedFlowIds: string[]) => {
    try {
      // For each selected flow, add this folder to its folder list
      for (const flowId of selectedFlowIds) {
        const flow = flows.find(f => f.id === flowId);
        if (flow) {
          const currentFolderIds = flow.folderIds || [];
          if (!currentFolderIds.includes(folderId)) {
            const newFolderIds = [...currentFolderIds, folderId];
            await updateFlow(flow.id, { ...flow, folderIds: newFolderIds });
          }
        }
      }

      // Remove flows that were unselected from this folder
      const flowsCurrentlyInFolder = flows.filter(flow => 
        flow.folderIds && flow.folderIds.includes(folderId)
      );
      
      for (const flow of flowsCurrentlyInFolder) {
        if (!selectedFlowIds.includes(flow.id)) {
          const newFolderIds = (flow.folderIds || []).filter(id => id !== folderId);
          await updateFlow(flow.id, { ...flow, folderIds: newFolderIds });
        }
      }
    } catch (error) {
      console.error('Failed to update flows folder assignment:', error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowFolderMenu(false);
        setShowDeleteConfirm(false);
      }
    };

    if (showFolderMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFolderMenu]);

  // Redirect if folder not found (after loading is complete)
  useEffect(() => {
    if (!foldersLoading && folders.length > 0 && !currentFolder) {
      navigate('/');
    }
  }, [foldersLoading, folders, currentFolder, navigate]);

  // Show loading state while folders are being fetched
  if (foldersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">Loading folder...</div>
        </div>
      </div>
    );
  }

  // Show not found only after loading is complete
  if (!currentFolder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Folder not found</div>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Same as homepage */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmwMiGjHLid5I4XmLxqLD-Ig5Rn0cLUVZLcA&s.png"
                alt="Phenom logo"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-700">Application Flows</h1>
                <p className="text-[#637085] text-sm mt-0">Create and manage your job application workflows</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHowItWorksModal(true)}
                className="flex items-center space-x-2 bg-white border border-gray-400 text-gray-600 px-4 py-2 rounded-[10px] hover:bg-gray-200 transition-colors duration-200"
              >
                <HelpCircle className="w-4 h-4" />
                <span>How it works</span>
              </button>
              <button
                onClick={handleViewModuleTemplates}
                className="flex items-center space-x-2 bg-white border border-gray-400 text-gray-600 px-4 py-2 rounded-[10px] hover:bg-gray-200 transition-colors duration-200"
              >
                <Settings className="w-4 h-4" />
                <span>Module Templates</span>
              </button>
              <button
                onClick={handleCreateFlow}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-[10px] hover:bg-indigo-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Create flow</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Folder Name and Menu */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-600 bg-white border border-gray-200 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Back to Homepage"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">{currentFolder.name}</h2>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFolderMenu(!showFolderMenu)}
              className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Folder options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showFolderMenu && (
              <div ref={menuRef} className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {!showDeleteConfirm ? (
                  // Action Menu
                  <>
                    <button
                      onClick={handleEditFolder}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </>
                ) : (
                  // Delete Confirmation Overlay
                  <>
                    <div className="px-3 py-2 mt-1 text-sm text-gray-700">
                      Delete this folder?
                    </div>
                    <div className="flex gap-2 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-4 py-1.5 text-sm text-gray-600 border border-gray-300 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteFolder}
                        className="flex-1 px-4 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-1 focus:ring-red-300"
                      >
                        Yes
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Folder Description */}
        {currentFolder.description && (
          <div className="mb-6">
            <p className="text-gray-600 text-sm">{currentFolder.description}</p>
          </div>
        )}

        {/* Flow Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading flows...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">Error: {error}</div>
            <p className="text-gray-500">Please make sure you're connected to Supabase</p>
          </div>
        ) : (
          folderFlows.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">No flows in this folder yet</div>
              <button
                onClick={handleCreateFlow}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create your first flow in this folder
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {folderFlows.map((flow) => (
                <FlowCard
                  key={flow.id}
                  flow={flow}
                  onEdit={handleEditFlow}
                  onDelete={handleDeleteFlow}
                  onPreview={handlePreviewFlow}
                  onDuplicate={handleDuplicateFlow}
                  folders={folders}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* How it works Modal */}
      <HowItWorksModal
        isOpen={showHowItWorksModal}
        onClose={() => setShowHowItWorksModal(false)}
      />

      {/* Folder Modal */}
      <FolderModal
        isOpen={showFolderModal}
        onClose={() => {
          setShowFolderModal(false);
        }}
        onSave={handleSaveFolder}
        folder={currentFolder}
        flows={flows}
      />
    </div>
  );
}
