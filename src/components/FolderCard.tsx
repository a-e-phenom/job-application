import React from 'react';
import { Edit, Trash2, MoreVertical, FolderOpen, Folder } from 'lucide-react';
import { Folder as FolderType } from '../types/folder';

interface FolderCardProps {
  folder: FolderType;
  onEdit: (folder: FolderType) => void;
  onDelete: (folderId: string) => void;
  onClick: (folder: FolderType) => void;
}

export default function FolderCard({ folder, onEdit, onDelete, onClick }: FolderCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowDeleteConfirm(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleCardClick = () => {
    onClick(folder);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
    setShowDeleteConfirm(false);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteConfirm(false);
    action();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteConfirm(false);
    onDelete(folder.id);
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-gray-200 py-5 pl-5 pr-4 hover:shadow-md transition-shadow duration-200 cursor-pointer relative flex flex-col justify-between"
    >
      {/* Content container */}
      <div>
        <div className="flex items-center justify-between mb-0">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-0">
             
                <img src="/folder-icon.png" alt="Folder" className="w-12 h-auto" />
             
              <div className="flex-1">
                <h3 className="text-md font-medium text-[#464F5E] mb-0">{folder.name}</h3>
                <div className="flex items-center space-x-0">
                  <span className="text-xs text-gray-700">
                    {folder.flowCount || 0} flow{(folder.flowCount || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div ref={menuRef} className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {!showDeleteConfirm ? (
                  // Action Menu
                  <>
                    <button
                      onClick={(e) => handleActionClick(e, () => onEdit(folder))}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={handleDeleteClick}
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
                        onClick={handleDeleteCancel}
                        className="flex-1 px-4 py-1.5 text-sm text-gray-600 border border-gray-300 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteConfirm}
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
      </div>
    </div>
  );
}
