import React from 'react';
import { Edit, Trash2, MoreVertical, MoveRight, Copy, Check, Link } from 'lucide-react';
import { ApplicationFlow } from '../types/flow';

interface FlowCardProps {
  flow: ApplicationFlow;
  onEdit: (flow: ApplicationFlow) => void;
  onDelete: (flowId: string) => void;
  onPreview: (flow: ApplicationFlow) => void;
  onDuplicate: (flow: ApplicationFlow) => void;
}

export default function FlowCard({ flow, onEdit, onDelete, onPreview, onDuplicate }: FlowCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
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
    onPreview(flow);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
    // Reset delete confirmation when opening menu
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
    // Delete immediately without any confirmation dialogs
    onDelete(flow.id);
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/flow/${flow.slug}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    
    setShowMenu(false);
    setShowDeleteConfirm(false);
  };

  return (
  <div 
    onClick={handleCardClick}
    className="bg-white rounded-xl border border-gray-200 py-5 pl-5 pr-4 hover:shadow-md transition-shadow duration-200 cursor-pointer relative flex flex-col justify-between min-h-[140px] border-l-4"
    style={{ borderLeftColor: flow.primaryColor || '#6366F1' }}
  >
    {/* Content container that can grow */}
    <div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-md font-medium text-[#464F5E]">{flow.name}</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
  {/* Steps Tag */}
  <div className="relative group">
    <span className="px-2 py-0.5 text-xs rounded-md bg-indigo-50 text-gray-700 cursor-default">
      {flow.steps.length} step{flow.steps.length !== 1 ? 's' : ''}
    </span>
    {/* Popover */}
    <div className="absolute left-0 mt-1 hidden w-52 rounded-lg bg-white border border-gray-200 shadow-lg p-3 text-xs text-gray-700 group-hover:block z-20">
  <div className="space-y-1">
    {flow.steps.map((step, idx) => (
      <div key={idx} className="flex items-center gap-2">
        <MoveRight className="w-3 h-3 text-indigo-500" />
        <span>{step.name}</span>
      </div>
    ))}
  </div>
</div>
  </div>

  {/* Modules Tag */}
  <div className="relative group">
    <span className="px-2 py-0.5 text-xs rounded-md bg-gray-100 text-gray-700 cursor-default">
      {flow.steps.reduce((total, step) => total + step.modules.length, 0)} module
      {flow.steps.reduce((total, step) => total + step.modules.length, 0) !== 1 ? 's' : ''}
    </span>
    {/* Popover */}
    <div className="absolute left-0 mt-1 hidden w-52 rounded-lg bg-white border border-gray-200 shadow-lg p-3 text-xs text-gray-700 group-hover:block z-20">
  <div className="space-y-1">
    {flow.steps.flatMap((step) =>
      step.modules.map((mod, idx) => (
        <div key={step.id + '-' + idx} className="flex items-center gap-2">
          <MoveRight className="w-3 h-3 text-indigo-500" />
          <span>{mod.name}</span>
        </div>
      ))
    )}
  </div>
</div>
  </div>
</div>


          <p className="text-[#637085] text-sm mb-3">{flow.description}</p>
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
                    onClick={(e) => handleActionClick(e, () => onEdit(flow))}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={(e) => handleActionClick(e, () => onDuplicate(flow))}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={handleCopyUrl}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy URL'}</span>
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
    Delete this flow?
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

    {/* Date at the bottom */}
    <div className="pt-4">
    <div className="text-xs text-[#637085]">
  {new Date(flow.updatedAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })}
</div>

    </div>
  </div>
);

}